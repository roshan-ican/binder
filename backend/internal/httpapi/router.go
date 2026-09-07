// Package httpapi owns HTTP routing and request/response handling.
package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/roshan-ican/binder/backend/internal/authsession"
	"github.com/roshan-ican/binder/backend/internal/supabaseauth"
)

// NewRouter connects the HTTP endpoints to the application services.
func NewRouter(pool *pgxpool.Pool, verifier *supabaseauth.Verifier) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if err := pool.Ping(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "db unreachable"})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	mux.HandleFunc("/auth/session", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		if !ok || token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "missing bearer token"})
			return
		}

		claims, err := verifier.Verify(token)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid token"})
			return
		}

		result, err := authsession.Sync(r.Context(), pool, claims.Subject, claims.Email, claims.Phone)
		if err != nil {
			log.Printf("auth session sync failed: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "sync failed"})
			return
		}

		json.NewEncoder(w).Encode(result)
	})

	return mux
}
