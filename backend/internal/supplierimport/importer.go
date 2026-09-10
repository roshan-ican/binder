package supplierimport

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/roshan-ican/binder/backend/internal/apify"
)

type Stats struct {
	Fetched int
	Saved   int
	Skipped int
}

type Importer struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Importer {
	return &Importer{pool: pool}
}

func (i *Importer) Save(ctx context.Context, places []apify.Place) (Stats, error) {
	stats := Stats{Fetched: len(places)}
	for _, place := range places {
		if strings.TrimSpace(place.PlaceID) == "" || strings.TrimSpace(place.Title) == "" {
			stats.Skipped++
			continue
		}
		if err := i.savePlace(ctx, place); err != nil {
			return stats, err
		}
		stats.Saved++
	}
	return stats, nil
}

func (i *Importer) savePlace(ctx context.Context, place apify.Place) error {
	tx, err := i.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("supplier import: begin: %w", err)
	}
	defer tx.Rollback(ctx)

	var businessID string
	err = tx.QueryRow(ctx, `
		INSERT INTO businesses (
			business_name, city, region, country_code, latitude, longitude,
			source_type, source_url, source_place_id, website, phone,
			google_maps_url, google_rating, google_review_count, last_synced_at
		) VALUES (
			$1, $2, $3, NULLIF(upper($4), ''), $5, $6,
			'apify_google_maps', $7, $8, $9, $10, $7, $11, $12, now()
		)
		ON CONFLICT (source_place_id) DO UPDATE SET
			business_name = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.business_name ELSE businesses.business_name END,
			city = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.city ELSE businesses.city END,
			region = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.region ELSE businesses.region END,
			country_code = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.country_code ELSE businesses.country_code END,
			latitude = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.latitude ELSE businesses.latitude END,
			longitude = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.longitude ELSE businesses.longitude END,
			website = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.website ELSE businesses.website END,
			phone = CASE WHEN businesses.owner_user_id IS NULL THEN EXCLUDED.phone ELSE businesses.phone END,
			source_url = EXCLUDED.source_url,
			google_maps_url = EXCLUDED.google_maps_url,
			google_rating = EXCLUDED.google_rating,
			google_review_count = EXCLUDED.google_review_count,
			last_synced_at = now(),
			updated_at = now()
		RETURNING id
	`, clean(place.Title), clean(place.City), clean(place.State), clean(place.CountryCode), nullableCoordinate(place.Location.Latitude), nullableCoordinate(place.Location.Longitude), clean(place.URL), place.PlaceID, clean(place.Website), clean(place.Phone), place.TotalScore, place.ReviewsCount).Scan(&businessID)
	if err != nil {
		return fmt.Errorf("supplier import: upsert %s: %w", place.PlaceID, err)
	}

	for _, category := range placeCategories(place) {
		result, updateErr := tx.Exec(ctx, `
			UPDATE business_capabilities
			SET updated_at = now()
			WHERE business_id = $1 AND lower(category) = lower($2) AND lower(capability) = lower($2)
		`, businessID, category)
		if updateErr != nil {
			return fmt.Errorf("supplier import: refresh capability %s: %w", place.PlaceID, updateErr)
		}
		if result.RowsAffected() > 0 {
			continue
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO business_capabilities (business_id, category, capability)
			VALUES ($1, $2, $2)
		`, businessID, category)
		if err != nil {
			return fmt.Errorf("supplier import: capability %s: %w", place.PlaceID, err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("supplier import: commit %s: %w", place.PlaceID, err)
	}
	return nil
}

func placeCategories(place apify.Place) []string {
	seen := make(map[string]bool)
	values := append([]string{place.CategoryName}, place.Categories...)
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = clean(value)
		key := strings.ToLower(value)
		if value == "" || seen[key] {
			continue
		}
		seen[key] = true
		result = append(result, value)
	}
	if len(result) == 0 {
		return []string{"Business"}
	}
	return result
}

func clean(value string) string {
	return strings.TrimSpace(value)
}

func nullableCoordinate(value float64) any {
	if value == 0 {
		return nil
	}
	return value
}
