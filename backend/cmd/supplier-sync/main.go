package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/roshan-ican/binder/backend/internal/apify"
	"github.com/roshan-ican/binder/backend/internal/config"
	"github.com/roshan-ican/binder/backend/internal/db"
	"github.com/roshan-ican/binder/backend/internal/supplierimport"
)

func main() {
	cfg := config.Load()
	locations := flag.String("locations", getenv("SUPPLIER_SYNC_LOCATIONS", "Gangtok, Sikkim, India"), "semicolon-separated locations")
	searchTerms := flag.String("search-terms", getenv("SUPPLIER_SYNC_SEARCH_TERMS", "restaurant"), "comma-separated Google Maps search terms")
	maxResults := flag.Int("max-results", getenvInt("SUPPLIER_SYNC_MAX_RESULTS", 100), "maximum results per search term")
	dryRun := flag.Bool("dry-run", false, "fetch and summarize without writing to Postgres")
	printResults := flag.Bool("print-results", false, "print fetched places as JSON")
	schedule := flag.Bool("schedule", false, "run immediately and then every interval")
	interval := flag.Duration("interval", 15*24*time.Hour, "scheduled refresh interval")
	flag.Parse()

	if cfg.ApifyToken == "" {
		log.Fatal("APIFY_TOKEN is required")
	}
	locationList := splitNonEmpty(*locations, ";")
	termList := splitNonEmpty(*searchTerms, ",")
	if len(locationList) == 0 || len(termList) == 0 || *maxResults < 1 {
		log.Fatal("at least one location and search term, and max-results greater than zero, are required")
	}

	run := func() error {
		return runSync(context.Background(), cfg, locationList, termList, *maxResults, *dryRun, *printResults)
	}
	if err := run(); err != nil {
		log.Fatal(err)
	}
	if !*schedule {
		return
	}
	ticker := time.NewTicker(*interval)
	defer ticker.Stop()
	for range ticker.C {
		if err := run(); err != nil {
			log.Printf("supplier sync failed: %v", err)
		}
	}
}

func runSync(parent context.Context, cfg config.Config, locations, terms []string, maxResults int, dryRun, printResults bool) error {
	client := apify.NewClient(cfg.ApifyToken)
	var importer *supplierimport.Importer
	var closePool func()
	if !dryRun {
		ctx, cancel := context.WithTimeout(parent, 10*time.Second)
		pool, err := db.Connect(ctx, cfg.DatabaseURL)
		cancel()
		if err != nil {
			return fmt.Errorf("connect to database: %w", err)
		}
		closePool = pool.Close
		defer closePool()
		importer = supplierimport.New(pool)
	}

	for _, location := range locations {
		ctx, cancel := context.WithTimeout(parent, 12*time.Minute)
		places, err := client.SearchPlaces(ctx, apify.SearchInput{
			SearchStringsArray:        terms,
			LocationQuery:             location,
			MaxCrawledPlacesPerSearch: maxResults,
			Language:                  "en",
		})
		cancel()
		if err != nil {
			return fmt.Errorf("sync %s: %w", location, err)
		}
		if printResults {
			encoded, err := json.MarshalIndent(places, "", "  ")
			if err != nil {
				return fmt.Errorf("encode results: %w", err)
			}
			fmt.Println(string(encoded))
		}
		if dryRun {
			log.Printf("location=%q fetched=%d dry_run=true", location, len(places))
			continue
		}
		ctx, cancel = context.WithTimeout(parent, 5*time.Minute)
		stats, err := importer.Save(ctx, places)
		cancel()
		if err != nil {
			return fmt.Errorf("save %s: %w", location, err)
		}
		log.Printf("location=%q fetched=%d saved=%d skipped=%d", location, stats.Fetched, stats.Saved, stats.Skipped)
	}
	return nil
}

func splitNonEmpty(value, separator string) []string {
	parts := strings.Split(value, separator)
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if part = strings.TrimSpace(part); part != "" {
			result = append(result, part)
		}
	}
	return result
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
