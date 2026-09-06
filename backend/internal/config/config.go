package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
}

func Load() Config {
	// backend/.env is gitignored and optional -- absence (e.g. in production,
	// where real env vars are injected directly) is not an error.
	_ = godotenv.Load(".env")

	return Config{
		DatabaseURL: getenv("DATABASE_URL", "postgres://localhost:5432/binder?sslmode=disable"),
		Port:        getenv("PORT", "8080"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
