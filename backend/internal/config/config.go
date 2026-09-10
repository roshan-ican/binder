package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
	SupabaseURL string
	ApifyToken  string
}

func Load() Config {
	// backend/.env is gitignored and optional -- absence (e.g. in production,
	// where real env vars are injected directly) is not an error.
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	return Config{
		DatabaseURL: getenv("DATABASE_URL", "postgres://localhost:5432/binder?sslmode=disable"),
		Port:        getenv("PORT", "8080"),
		// No sensible fallback -- this is a specific project's URL, not a
		// generic local default like DATABASE_URL's. Set it in backend/.env.
		SupabaseURL: getenv("SUPABASE_URL", ""),
		ApifyToken:  getenv("APIFY_TOKEN", ""),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
