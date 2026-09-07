// Package supabaseauth verifies Supabase Auth JWTs. Supabase (not this
// backend) runs the actual Google OAuth exchange; all this backend ever
// sees is the resulting JWT, verified against Supabase's own public JWKS
// (this project signs with ES256, not a shared secret) -- so there is no
// Google credential and no Supabase service-role secret involved here.
package supabaseauth

import (
	"context"
	"fmt"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

// Claims is the subset of a Supabase Auth JWT this backend cares about.
// A phone-only sign-in carries Phone with Email empty, and vice versa for
// email/Google sign-in -- never assume both are populated.
type Claims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// Verifier validates Supabase-issued JWTs against that project's JWKS,
// fetched once and refreshed automatically by keyfunc in the background.
type Verifier struct {
	keyfunc keyfunc.Keyfunc
}

// NewVerifier fetches (and keeps refreshed) the JWKS for a Supabase project,
// e.g. supabaseURL = "https://xxxx.supabase.co".
func NewVerifier(ctx context.Context, supabaseURL string) (*Verifier, error) {
	kf, err := newKeyfuncForJWKSURL(supabaseURL + "/auth/v1/.well-known/jwks.json")
	if err != nil {
		return nil, err
	}
	return &Verifier{keyfunc: kf}, nil
}

func newKeyfuncForJWKSURL(jwksURL string) (keyfunc.Keyfunc, error) {
	kf, err := keyfunc.NewDefaultCtx(context.Background(), []string{jwksURL})
	if err != nil {
		return nil, fmt.Errorf("supabaseauth: fetch jwks: %w", err)
	}
	return kf, nil
}

// Verify parses and validates a raw JWT (as sent in an Authorization: Bearer
// header), returning its claims if the signature, issuer, and expiry all
// check out.
func (v *Verifier) Verify(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, v.keyfunc.Keyfunc,
		jwt.WithValidMethods([]string{"ES256"}),
	)
	if err != nil {
		return nil, fmt.Errorf("supabaseauth: verify token: %w", err)
	}
	if !token.Valid {
		return nil, fmt.Errorf("supabaseauth: token not valid")
	}
	if claims.Subject == "" {
		return nil, fmt.Errorf("supabaseauth: token missing subject claim")
	}
	return claims, nil
}
