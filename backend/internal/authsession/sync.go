// Package authsession links a verified Supabase identity to a row in our
// own `users` table and reports whether that identity already owns a
// business -- the one thing the client needs to know to route into
// onboarding versus straight into the app.
package authsession

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Result struct {
	UserID      string  `json:"userId"`
	HasBusiness bool    `json:"hasBusiness"`
	BusinessID  *string `json:"businessId"`
}

// Sync upserts a users row keyed by the Supabase user id (idempotent --
// signing in again just refreshes the stored email/phone) and looks up
// whether that user already owns a business. email and phone are both
// optional -- a phone-only sign-in has no email and vice versa -- and are
// passed as NULL rather than "" when absent, since users.email is UNIQUE
// and Postgres treats multiple NULLs (but not multiple empty strings) as
// distinct, so several phone-only users don't collide on a shared "".
func Sync(ctx context.Context, pool *pgxpool.Pool, supabaseUserID, email, phone string) (Result, error) {
	var userID string
	err := pool.QueryRow(ctx, `
		INSERT INTO users (supabase_user_id, email, phone)
		VALUES ($1, $2, $3)
		ON CONFLICT (supabase_user_id) DO UPDATE SET email = EXCLUDED.email, phone = EXCLUDED.phone
		RETURNING id
	`, supabaseUserID, nullIfEmpty(email), nullIfEmpty(phone)).Scan(&userID)
	if err != nil {
		return Result{}, fmt.Errorf("authsession: upsert user: %w", err)
	}

	var businessID string
	err = pool.QueryRow(ctx, `SELECT id::text FROM businesses WHERE owner_user_id = $1 LIMIT 1`, userID).Scan(&businessID)
	switch {
	case errors.Is(err, pgx.ErrNoRows):
		return Result{UserID: userID, HasBusiness: false, BusinessID: nil}, nil
	case err != nil:
		return Result{}, fmt.Errorf("authsession: lookup business: %w", err)
	default:
		return Result{UserID: userID, HasBusiness: true, BusinessID: &businessID}, nil
	}
}

func nullIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
