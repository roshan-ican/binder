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
	"github.com/roshan-ican/binder/backend/internal/matching"
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
		pool, err := pgxpool.New(context.Background(), databaseURL)
		if err != nil {
			t.Errorf("cleanup connect: %v", err)
			return
		}
		_, err = pool.Exec(context.Background(), `TRUNCATE businesses CASCADE`)
		pool.Close()
		if err != nil {
			t.Errorf("cleanup fixtures: %v", err)
			return
		}
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
	if version != 6 {
		t.Fatalf("expected to land on migration 6, got %d", version)
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
	mustScan(t, pool, ctx, &supplierID, `INSERT INTO businesses (business_name, source_type) VALUES ('Test Supplier', 'manual_entry') RETURNING id`)
	mustScan(t, pool, ctx, &enquiryID, `INSERT INTO enquiries (buyer_business_id, title) VALUES ($1, 'Test enquiry') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &conversationID, `INSERT INTO conversations (context_type, context_id) VALUES ('enquiry', $1) RETURNING id`, enquiryID)

	cases := []struct {
		name        string
		role        string
		businessID  *string
		expectError bool
	}{
		{"valid buyer", "buyer", &businessID, false},
		{"valid unclaimed supplier", "supplier", &supplierID, false},
		{"valid system", "system", nil, false},
		{"buyer missing business", "buyer", nil, true},
		{"supplier missing business", "supplier", nil, true},
		{"system with business", "system", &businessID, true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := pool.Exec(ctx, `
				INSERT INTO conversation_participants (conversation_id, role, business_id)
				VALUES ($1, $2, $3)
			`, conversationID, tc.role, tc.businessID)

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
	mustScan(t, pool, ctx, &supplierID, `INSERT INTO businesses (business_name, source_type) VALUES ('Test Supplier', 'manual_entry') RETURNING id`)
	mustScan(t, pool, ctx, &enquiryID, `INSERT INTO enquiries (buyer_business_id, title) VALUES ($1, 'Test enquiry') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &candidateID, `INSERT INTO match_candidates (enquiry_id, business_id) VALUES ($1, $2) RETURNING id`, enquiryID, supplierID)

	if _, err := pool.Exec(ctx, `INSERT INTO match_candidates (enquiry_id, business_id) VALUES ($1, $2)`, enquiryID, supplierID); err == nil {
		t.Fatal("expected duplicate (enquiry_id, business_id) to be rejected")
	}

	// event_type is free text (Go-validated), not tied to match_candidates.status --
	// an arbitrary, forward-looking event type must be insertable without a migration.
	if _, err := pool.Exec(ctx, `
		INSERT INTO match_events (match_candidate_id, event_type) VALUES ($1, 'negotiation_started')
	`, candidateID); err != nil {
		t.Fatalf("expected open-ended event_type to be accepted, got: %v", err)
	}
}

func TestUnclaimedBusinessAndPlaceIdentity(t *testing.T) {
	url := testDatabaseURL(t)
	applyMigrations(t, url)
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	var businessID, userID string
	mustScan(t, pool, ctx, &businessID, `INSERT INTO businesses (business_name, source_type, source_place_id) VALUES ('External Co', 'apify', 'place-1') RETURNING id`)
	var claimed bool
	if err := pool.QueryRow(ctx, `SELECT is_claimed FROM businesses WHERE id=$1`, businessID).Scan(&claimed); err != nil || claimed {
		t.Fatalf("expected unclaimed: %v", err)
	}
	if _, err := pool.Exec(ctx, `INSERT INTO businesses (business_name, source_place_id) VALUES ('Duplicate', 'place-1')`); err == nil {
		t.Fatal("duplicate place accepted")
	}
	mustScan(t, pool, ctx, &userID, `INSERT INTO users (full_name) VALUES ('Owner') RETURNING id`)
	if _, err := pool.Exec(ctx, `UPDATE businesses SET owner_user_id=$1 WHERE id=$2`, userID, businessID); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(ctx, `SELECT is_claimed FROM businesses WHERE id=$1`, businessID).Scan(&claimed); err != nil || !claimed {
		t.Fatalf("expected claimed: %v", err)
	}
	if _, err := pool.Exec(ctx, `DELETE FROM users WHERE id=$1`, userID); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(ctx, `SELECT is_claimed FROM businesses WHERE id=$1`, businessID).Scan(&claimed); err != nil || claimed {
		t.Fatalf("business must survive owner deletion unclaimed: %v", err)
	}
	for _, table := range []string{"suppliers", "ai_extractions", "supplier_capabilities"} {
		var exists bool
		if err := pool.QueryRow(ctx, `SELECT to_regclass($1) IS NOT NULL`, table).Scan(&exists); err != nil || exists {
			t.Fatalf("obsolete table %s still exists: %v", table, err)
		}
	}
}

// Every application table must have row-level security on. Binder's clients
// never touch Supabase's Data API -- they go through the Go backend -- so the
// tables are deny-everything by default (RLS enabled, no policies) and only
// the owning role, which the backend connects as, can reach them. A new table
// added without an ENABLE ROW LEVEL SECURITY line would silently be readable
// by anyone holding the publishable key, so this fails the build instead.
func TestEveryTableHasRowLevelSecurityEnabled(t *testing.T) {
	url := testDatabaseURL(t)
	applyMigrations(t, url)

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	// schema_migrations is golang-migrate's bookkeeping, not ours to alter.
	rows, err := pool.Query(ctx, `
		SELECT c.relname
		FROM pg_class c
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE n.nspname = 'public'
		  AND c.relkind = 'r'
		  AND c.relname != 'schema_migrations'
		  AND NOT c.relrowsecurity
		ORDER BY c.relname
	`)
	if err != nil {
		t.Fatalf("query tables without RLS: %v", err)
	}
	defer rows.Close()

	var unprotected []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			t.Fatalf("scan: %v", err)
		}
		unprotected = append(unprotected, name)
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("iterate: %v", err)
	}
	if len(unprotected) > 0 {
		t.Fatalf("tables missing row-level security: %v -- add ENABLE ROW LEVEL SECURITY in a migration", unprotected)
	}
}

func mustScan(t *testing.T, pool *pgxpool.Pool, ctx context.Context, dest *string, sql string, args ...any) {
	t.Helper()
	if err := pool.QueryRow(ctx, sql, args...).Scan(dest); err != nil {
		t.Fatalf("query %q: %v", sql, err)
	}
}

// Exercise the populated upgrade, including both linked and external vendors.
func TestUnifiedBusinessUpgradePreservesReferences(t *testing.T) {
	url := testDatabaseURL(t)
	m := newMigrator(t, url)
	defer m.Close()
	if err := m.Migrate(5); err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()
	var userID, businessID, linkedID, externalID, enquiryID, conversationID string
	mustScan(t, pool, ctx, &userID, `INSERT INTO users (full_name, supabase_user_id) VALUES ('Auth survivor', '11111111-1111-1111-1111-111111111111') RETURNING id`)
	mustScan(t, pool, ctx, &businessID, `INSERT INTO businesses (owner_user_id, business_name) VALUES ($1, 'Claimed') RETURNING id`, userID)
	mustScan(t, pool, ctx, &linkedID, `INSERT INTO suppliers (business_id, name, source_type) VALUES ($1, 'Claimed', 'binder_signup') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &externalID, `INSERT INTO suppliers (name, source_type, country) VALUES ('External', 'apify', 'UAE') RETURNING id`)
	mustScan(t, pool, ctx, &enquiryID, `INSERT INTO enquiries (buyer_business_id, title, category) VALUES ($1, 'Need boxes', 'Packaging') RETURNING id`, businessID)
	mustScan(t, pool, ctx, &conversationID, `INSERT INTO conversations (context_type, context_id) VALUES ('enquiry', $1) RETURNING id`, enquiryID)
	for _, id := range []string{linkedID, externalID} {
		if _, err := pool.Exec(ctx, `INSERT INTO supplier_capabilities (supplier_id, category, capability) VALUES ($1, 'Packaging', 'Boxes'), ($1, 'Packaging', 'Printed boxes')`, id); err != nil {
			t.Fatal(err)
		}
		if _, err := pool.Exec(ctx, `INSERT INTO match_candidates (enquiry_id, supplier_id) VALUES ($1, $2)`, enquiryID, id); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := pool.Exec(ctx, `INSERT INTO conversation_participants (conversation_id, role, supplier_id) VALUES ($1, 'supplier', $2)`, conversationID, externalID); err != nil {
		t.Fatal(err)
	}
	if _, err := pool.Exec(ctx, `INSERT INTO messages (conversation_id, sender_role, supplier_id, body) VALUES ($1, 'supplier', $2, 'Quote')`, conversationID, linkedID); err != nil {
		t.Fatal(err)
	}
	applyMigrations(t, url)
	var count int
	checks := []struct {
		sql  string
		want int
	}{
		{`SELECT count(*) FROM users WHERE supabase_user_id = '11111111-1111-1111-1111-111111111111'`, 1},
		{`SELECT count(*) FROM businesses`, 2},
		{`SELECT count(*) FROM businesses WHERE NOT is_claimed AND country_code = 'AE'`, 1},
		{`SELECT count(*) FROM business_capabilities c JOIN businesses b ON b.id=c.business_id`, 4},
		{`SELECT count(*) FROM match_candidates c JOIN businesses b ON b.id=c.business_id`, 2},
		{`SELECT count(*) FROM conversation_participants p JOIN businesses b ON b.id=p.business_id WHERE NOT b.is_claimed`, 1},
		{`SELECT count(*) FROM messages m JOIN businesses b ON b.id=m.business_id WHERE b.is_claimed`, 1},
	}
	for _, check := range checks {
		if err := pool.QueryRow(ctx, check.sql).Scan(&count); err != nil || count != check.want {
			t.Fatalf("%s: got %d want %d: %v", check.sql, count, check.want, err)
		}
	}
	ranked, err := matching.Run(ctx, pool, enquiryID)
	if err != nil {
		t.Fatal(err)
	}
	if len(ranked) != 2 {
		t.Fatalf("expected one match per business despite multiple capabilities, got %d", len(ranked))
	}
}
