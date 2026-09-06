// Package schema tests the SQL migrations directly against a real Postgres
// instance. These tests need TEST_DATABASE_URL to point at a scratch
// database with the pgvector extension installed (CREATE EXTENSION vector
// must succeed) -- they skip otherwise, since there's no way to check
// pgvector constraints without a real database.
package schema

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
)

func migrationsPath(t *testing.T) string {
	t.Helper()
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("could not determine test file path")
	}
	return filepath.Join(filepath.Dir(thisFile), "..", "..", "migrations")
}

func newMigrator(t *testing.T, databaseURL string) *migrate.Migrate {
	t.Helper()
	m, err := migrate.New("file://"+migrationsPath(t), databaseURL)
	if err != nil {
		t.Fatalf("init migrator: %v", err)
	}
	return m
}

func testDatabaseURL(t *testing.T) string {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping schema tests that need a real Postgres+pgvector instance")
	}
	return url
}

// applyMigrations brings a scratch database up to the latest migration and
// registers a cleanup that migrates it back down, so each test starts clean.
func applyMigrations(t *testing.T, databaseURL string) {
	t.Helper()
	m := newMigrator(t, databaseURL)
	if err := m.Up(); err != nil {
		t.Fatalf("migrate up: %v", err)
	}
	t.Cleanup(func() {
		if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			t.Errorf("cleanup: migrate down: %v", err)
		}
	})
}

func TestMigrationsApplyAndRollBackCleanly(t *testing.T) {
	url := testDatabaseURL(t)

	m := newMigrator(t, url)
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		t.Fatalf("migrate up: %v", err)
	}

	version, dirty, err := m.Version()
	if err != nil {
		t.Fatalf("version after up: %v", err)
	}
	if dirty {
		t.Fatalf("expected clean migration state, got dirty at version %d", version)
	}
	if version != 2 {
		t.Fatalf("expected to land on migration 2, got %d", version)
	}

	if err := m.Down(); err != nil {
		t.Fatalf("migrate down: %v", err)
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	var tableCount int
	err = pool.QueryRow(ctx, `
		SELECT count(*) FROM information_schema.tables
		WHERE table_schema = 'public' AND table_name != 'schema_migrations'
	`).Scan(&tableCount)
	if err != nil {
		t.Fatalf("count tables after rollback: %v", err)
	}
	if tableCount != 0 {
		t.Fatalf("expected no tables after full rollback, found %d", tableCount)
	}
}

func TestConversationParticipantIdentityConstraint(t *testing.T) {
	url := testDatabaseURL(t)
	applyMigrations(t, url)

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	var businessID, supplierID, enquiryID, conversationID string
	mustScan(t, pool, ctx, &businessID, `
		WITH u AS (INSERT INTO users (full_name) VALUES ('t') RETURNING id)
		INSERT INTO businesses (owner_user_id, business_name) SELECT id, 'Test Biz' FROM u RETURNING id
	`)
	mustScan(t, pool, ctx, &supplierID, `INSERT INTO suppliers (name, source_type) VALUES ('Test Supplier', 'manual_entry') RETURNING id`)
	mustScan(t, pool, ctx, &enquiryID, `INSERT INTO enquiries (buyer_business_id, title) VALUES ($1, 'Test enquiry') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &conversationID, `INSERT INTO conversations (context_type, context_id) VALUES ('enquiry', $1) RETURNING id`, enquiryID)

	cases := []struct {
		name        string
		role        string
		businessID  *string
		supplierID  *string
		expectError bool
	}{
		{"valid buyer", "buyer", &businessID, nil, false},
		{"valid supplier", "supplier", nil, &supplierID, false},
		{"buyer role missing business_id", "buyer", nil, nil, true},
		{"buyer role with both ids set", "buyer", &businessID, &supplierID, true},
		{"supplier role with business_id instead", "supplier", &businessID, nil, true},
		{"system role with an id set", "system", &businessID, nil, true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := pool.Exec(ctx, `
				INSERT INTO conversation_participants (conversation_id, role, business_id, supplier_id)
				VALUES ($1, $2, $3, $4)
			`, conversationID, tc.role, tc.businessID, tc.supplierID)

			if tc.expectError && err == nil {
				t.Fatalf("expected constraint violation, got none")
			}
			if !tc.expectError && err != nil {
				t.Fatalf("expected success, got error: %v", err)
			}
			if err == nil {
				// clean up the row so later subtests don't collide on the composite PK (conversation_id, role)
				_, _ = pool.Exec(ctx, `DELETE FROM conversation_participants WHERE conversation_id = $1 AND role = $2`, conversationID, tc.role)
			}
		})
	}
}

func TestMatchCandidateUniquenessAndEventTypeIsOpenEnded(t *testing.T) {
	url := testDatabaseURL(t)
	applyMigrations(t, url)

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	var businessID, supplierID, enquiryID, candidateID string
	mustScan(t, pool, ctx, &businessID, `
		WITH u AS (INSERT INTO users (full_name) VALUES ('t') RETURNING id)
		INSERT INTO businesses (owner_user_id, business_name) SELECT id, 'Test Biz' FROM u RETURNING id
	`)
	mustScan(t, pool, ctx, &supplierID, `INSERT INTO suppliers (name, source_type) VALUES ('Test Supplier', 'manual_entry') RETURNING id`)
	mustScan(t, pool, ctx, &enquiryID, `INSERT INTO enquiries (buyer_business_id, title) VALUES ($1, 'Test enquiry') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &candidateID, `INSERT INTO match_candidates (enquiry_id, supplier_id) VALUES ($1, $2) RETURNING id`, enquiryID, supplierID)

	if _, err := pool.Exec(ctx, `INSERT INTO match_candidates (enquiry_id, supplier_id) VALUES ($1, $2)`, enquiryID, supplierID); err == nil {
		t.Fatal("expected duplicate (enquiry_id, supplier_id) to be rejected")
	}

	// event_type is free text (Go-validated), not tied to match_candidates.status --
	// an arbitrary, forward-looking event type must be insertable without a migration.
	if _, err := pool.Exec(ctx, `
		INSERT INTO match_events (match_candidate_id, event_type) VALUES ($1, 'negotiation_started')
	`, candidateID); err != nil {
		t.Fatalf("expected open-ended event_type to be accepted, got: %v", err)
	}
}

func TestSupplierBusinessIDIsOptionalAndUnique(t *testing.T) {
	url := testDatabaseURL(t)
	applyMigrations(t, url)

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	// An externally discovered supplier has no business_id at all.
	if _, err := pool.Exec(ctx, `INSERT INTO suppliers (name, source_type) VALUES ('External Co', 'directory_scrape')`); err != nil {
		t.Fatalf("expected supplier without business_id to be accepted, got: %v", err)
	}

	var businessID string
	mustScan(t, pool, ctx, &businessID, `
		WITH u AS (INSERT INTO users (full_name) VALUES ('t') RETURNING id)
		INSERT INTO businesses (owner_user_id, business_name) SELECT id, 'Test Biz' FROM u RETURNING id
	`)
	if _, err := pool.Exec(ctx, `INSERT INTO suppliers (business_id, name, source_type) VALUES ($1, 'A', 'binder_signup')`, businessID); err != nil {
		t.Fatalf("first supplier linked to business: %v", err)
	}
	if _, err := pool.Exec(ctx, `INSERT INTO suppliers (business_id, name, source_type) VALUES ($1, 'B', 'binder_signup')`, businessID); err == nil {
		t.Fatal("expected a second supplier row for the same business_id to be rejected")
	}
}

func mustScan(t *testing.T, pool *pgxpool.Pool, ctx context.Context, dest *string, sql string, args ...any) {
	t.Helper()
	if err := pool.QueryRow(ctx, sql, args...).Scan(dest); err != nil {
		t.Fatalf("query %q: %v", sql, err)
	}
}
