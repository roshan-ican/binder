package supabaseauth

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const testKeyID = "test-key-1"

// newTestJWKSServer starts an httptest server serving the public half of a
// freshly generated ES256 key as a JWKS document -- standing in for
// Supabase's real /auth/v1/.well-known/jwks.json without needing a real
// Supabase project's signing key.
func newTestJWKSServer(t *testing.T) (*httptest.Server, *ecdsa.PrivateKey) {
	t.Helper()
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}

	jwk := map[string]any{
		"kty": "EC",
		"crv": "P-256",
		"alg": "ES256",
		"use": "sig",
		"kid": testKeyID,
		"x":   base64.RawURLEncoding.EncodeToString(priv.PublicKey.X.Bytes()),
		"y":   base64.RawURLEncoding.EncodeToString(priv.PublicKey.Y.Bytes()),
	}
	body, err := json.Marshal(map[string]any{"keys": []any{jwk}})
	if err != nil {
		t.Fatalf("marshal jwks: %v", err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	}))
	t.Cleanup(server.Close)
	return server, priv
}

func signTestToken(t *testing.T, priv *ecdsa.PrivateKey, claims Claims) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	token.Header["kid"] = testKeyID
	signed, err := token.SignedString(priv)
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return signed
}

func TestVerifyAcceptsAValidToken(t *testing.T) {
	server, priv := newTestJWKSServer(t)

	kf, err := newKeyfuncForJWKSURL(server.URL)
	if err != nil {
		t.Fatalf("build keyfunc: %v", err)
	}
	v := &Verifier{keyfunc: kf}

	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "11111111-1111-1111-1111-111111111111",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
		Email: "person@example.com",
	}
	signed := signTestToken(t, priv, claims)

	got, err := v.Verify(signed)
	if err != nil {
		t.Fatalf("expected a valid token to verify, got: %v", err)
	}
	if got.Subject != claims.Subject || got.Email != claims.Email {
		t.Fatalf("claims mismatch: got %+v, want subject=%s email=%s", got, claims.Subject, claims.Email)
	}
}

func TestVerifyRejectsExpiredToken(t *testing.T) {
	server, priv := newTestJWKSServer(t)
	kf, err := newKeyfuncForJWKSURL(server.URL)
	if err != nil {
		t.Fatalf("build keyfunc: %v", err)
	}
	v := &Verifier{keyfunc: kf}

	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "11111111-1111-1111-1111-111111111111",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)), // already expired
		},
	}
	signed := signTestToken(t, priv, claims)

	if _, err := v.Verify(signed); err == nil {
		t.Fatal("expected an expired token to be rejected")
	}
}

func TestVerifyRejectsTokenSignedByAnUntrustedKey(t *testing.T) {
	server, _ := newTestJWKSServer(t) // JWKS server holds the "real" key
	kf, err := newKeyfuncForJWKSURL(server.URL)
	if err != nil {
		t.Fatalf("build keyfunc: %v", err)
	}
	v := &Verifier{keyfunc: kf}

	imposterKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatalf("generate imposter key: %v", err)
	}
	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "attacker",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	signed := signTestToken(t, imposterKey, claims) // signed with a key NOT in the JWKS

	if _, err := v.Verify(signed); err == nil {
		t.Fatal("expected a token signed by an untrusted key to be rejected")
	}
}

func TestVerifyRejectsTokenMissingSubject(t *testing.T) {
	server, priv := newTestJWKSServer(t)
	kf, err := newKeyfuncForJWKSURL(server.URL)
	if err != nil {
		t.Fatalf("build keyfunc: %v", err)
	}
	v := &Verifier{keyfunc: kf}

	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	signed := signTestToken(t, priv, claims)

	if _, err := v.Verify(signed); err == nil {
		t.Fatal("expected a token with no subject claim to be rejected")
	}
}
