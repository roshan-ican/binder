package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/roshan-ican/binder/backend/internal/config"
	"github.com/roshan-ican/binder/backend/internal/db"
	"github.com/roshan-ican/binder/backend/internal/httpapi"
	"github.com/roshan-ican/binder/backend/internal/supabaseauth"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer pool.Close()

	if cfg.SupabaseURL == "" {
		log.Fatal("SUPABASE_URL is required (used to verify Supabase Auth JWTs) -- set it in backend/.env")
	}
	verifier, err := supabaseauth.NewVerifier(ctx, cfg.SupabaseURL)
	if err != nil {
		log.Fatalf("init supabase auth verifier: %v", err)
	}

	handler := httpapi.NewRouter(pool, verifier)

	log.Printf("binder api listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, handler); err != nil {
		log.Fatal(err)
	}
}
