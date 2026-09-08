package authsession

import (
	"context"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func testPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping (needs the real schema, run against a scratch or Supabase database)")
	}
	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func TestSyncCreatesAUserWithNoBusinessYet(t *testing.T) {
	pool := testPool(t)
	ctx := context.Background()
	supabaseUserID := uuid.NewString()

	result, err := Sync(ctx, pool, supabaseUserID, "new-google-user@example.com", "")
	if err != nil {
		t.Fatalf("Sync: %v", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, result.UserID) })

	if result.HasBusiness {
		t.Fatal("expected a freshly created user to have no business yet")
	}
	if result.BusinessID != nil {
		t.Fatalf("expected nil BusinessID, got %v", *result.BusinessID)
	}
}

func TestSyncIsIdempotentAndUpdatesEmail(t *testing.T) {
	pool := testPool(t)
	ctx := context.Background()
	supabaseUserID := uuid.NewString()

	first, err := Sync(ctx, pool, supabaseUserID, "old-email@example.com", "")
	if err != nil {
		t.Fatalf("first Sync: %v", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, first.UserID) })

	second, err := Sync(ctx, pool, supabaseUserID, "new-email@example.com", "")
	if err != nil {
		t.Fatalf("second Sync: %v", err)
	}

	if second.UserID != first.UserID {
		t.Fatalf("expected signing in again to reuse the same user row: first=%s second=%s", first.UserID, second.UserID)
	}

	var storedEmail string
	if err := pool.QueryRow(ctx, `SELECT email FROM users WHERE id = $1`, first.UserID).Scan(&storedEmail); err != nil {
		t.Fatalf("read back email: %v", err)
	}
	if storedEmail != "new-email@example.com" {
		t.Fatalf("expected the email to be refreshed on re-sync, got %q", storedEmail)
	}
}

func TestSyncAllowsMultiplePhoneOnlyUsersWithNoEmail(t *testing.T) {
	// Regression: users.email is UNIQUE. If an absent email were stored as
	// "" instead of NULL, a second phone-only sign-up would fail with a
	// duplicate-key error since Postgres treats "" as a real, colliding
	// value but treats multiple NULLs as distinct.
	pool := testPool(t)
	ctx := context.Background()

	first, err := Sync(ctx, pool, uuid.NewString(), "", "+919000000001")
	if err != nil {
		t.Fatalf("first phone-only Sync: %v", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, first.UserID) })

	second, err := Sync(ctx, pool, uuid.NewString(), "", "+919000000002")
	if err != nil {
		t.Fatalf("second phone-only Sync: %v (expected NULL, not \"\", to avoid colliding on the email UNIQUE constraint)", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, second.UserID) })

	var storedPhone string
	if err := pool.QueryRow(ctx, `SELECT phone FROM users WHERE id = $1`, first.UserID).Scan(&storedPhone); err != nil {
		t.Fatalf("read back phone: %v", err)
	}
	if storedPhone != "+919000000001" {
		t.Fatalf("expected phone to be stored, got %q", storedPhone)
	}
}

func TestSyncReportsAnExistingBusiness(t *testing.T) {
	pool := testPool(t)
	ctx := context.Background()
	supabaseUserID := uuid.NewString()

	synced, err := Sync(ctx, pool, supabaseUserID, "founder@example.com", "")
	if err != nil {
		t.Fatalf("Sync: %v", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, synced.UserID) })

	var businessID string
	err = pool.QueryRow(ctx, `
		INSERT INTO businesses (owner_user_id, business_name) VALUES ($1, 'Test Co') RETURNING id
	`, synced.UserID).Scan(&businessID)
	if err != nil {
		t.Fatalf("insert business: %v", err)
	}
	t.Cleanup(func() { _, _ = pool.Exec(ctx, `DELETE FROM businesses WHERE id = $1`, businessID) })

	result, err := Sync(ctx, pool, supabaseUserID, "founder@example.com", "")
	if err != nil {
		t.Fatalf("Sync after business exists: %v", err)
	}
	if !result.HasBusiness {
		t.Fatal("expected HasBusiness to be true once a businesses row exists")
	}
	if result.BusinessID == nil || *result.BusinessID != businessID {
		t.Fatalf("expected BusinessID %q, got %v", businessID, result.BusinessID)
	}
}
