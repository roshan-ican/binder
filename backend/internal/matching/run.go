package matching

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/roshan-ican/binder/backend/internal/numparse"
)

type candidateRow struct {
	SupplierID         string
	SupplierName       string
	Category           string
	MinOrderQuantity   *int
	MaxOrderQuantity   *int
	ServiceRegions     []string
	Capacity           *string
	VerificationStatus string
}

// RankedCandidate is one surviving, scored, and persisted match.
type RankedCandidate struct {
	Rank       int
	SupplierID string
	Name       string
	Score      float64
	Breakdown  ScoreBreakdown
}

// Run scores every business_capabilities row against one enquiry, keeps
// only the candidates that pass the hard filters, ranks the survivors, and
// persists the result: match_candidates holds the current state, and a
// `ranked` match_event is appended for each survivor so the run leaves a
// history behind. Re-running for the same enquiry replaces its previous
// candidates (ON DELETE CASCADE also clears their match_events) so this is
// safe to call again after the underlying data changes.
func Run(ctx context.Context, pool *pgxpool.Pool, enquiryID string) ([]RankedCandidate, error) {
	enquiry, err := loadEnquiry(ctx, pool, enquiryID)
	if err != nil {
		return nil, fmt.Errorf("matching: load enquiry: %w", err)
	}

	candidates, err := loadCandidates(ctx, pool)
	if err != nil {
		return nil, fmt.Errorf("matching: load candidates: %w", err)
	}

	var results []struct {
		row    candidateRow
		result Result
	}
	for _, c := range candidates {
		result, ok := Evaluate(enquiry, CandidateInput{
			SupplierID:         c.SupplierID,
			Category:           c.Category,
			MinOrderQuantity:   c.MinOrderQuantity,
			MaxOrderQuantity:   c.MaxOrderQuantity,
			ServiceRegions:     c.ServiceRegions,
			Capacity:           derefOr(c.Capacity, ""),
			VerificationStatus: c.VerificationStatus,
		})
		if !ok {
			continue
		}
		results = append(results, struct {
			row    candidateRow
			result Result
		}{c, result})
	}

	sort.SliceStable(results, func(i, j int) bool {
		return results[i].result.Score > results[j].result.Score
	})

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("matching: begin: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM match_candidates WHERE enquiry_id = $1`, enquiryID); err != nil {
		return nil, fmt.Errorf("matching: clear previous candidates: %w", err)
	}

	ranked := make([]RankedCandidate, 0, len(results))
	seen := make(map[string]bool)
	for _, r := range results {
		if seen[r.row.SupplierID] {
			continue
		}
		seen[r.row.SupplierID] = true
		rank := len(ranked) + 1
		breakdownJSON, err := json.Marshal(r.result.Breakdown)
		if err != nil {
			return nil, fmt.Errorf("matching: marshal score breakdown: %w", err)
		}

		var candidateID string
		err = tx.QueryRow(ctx, `
			INSERT INTO match_candidates (enquiry_id, business_id, status, rank, score, score_breakdown, ranking_version)
			VALUES ($1, $2, 'generated', $3, $4, $5, $6)
			RETURNING id
		`, enquiryID, r.row.SupplierID, rank, r.result.Score, breakdownJSON, RankingVersion).Scan(&candidateID)
		if err != nil {
			return nil, fmt.Errorf("matching: insert match_candidate for supplier %s: %w", r.row.SupplierID, err)
		}

		if _, err := tx.Exec(ctx, `
			INSERT INTO match_events (match_candidate_id, event_type, payload)
			VALUES ($1, 'ranked', $2)
		`, candidateID, breakdownJSON); err != nil {
			return nil, fmt.Errorf("matching: insert match_event for supplier %s: %w", r.row.SupplierID, err)
		}

		ranked = append(ranked, RankedCandidate{
			Rank:       rank,
			SupplierID: r.row.SupplierID,
			Name:       r.row.SupplierName,
			Score:      r.result.Score,
			Breakdown:  r.result.Breakdown,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("matching: commit: %w", err)
	}

	return ranked, nil
}

func loadEnquiry(ctx context.Context, pool *pgxpool.Pool, enquiryID string) (EnquiryInput, error) {
	var (
		category     *string
		location     *string
		quantityText *string
	)
	err := pool.QueryRow(ctx, `
		SELECT category, location, quantity FROM enquiries WHERE id = $1
	`, enquiryID).Scan(&category, &location, &quantityText)
	if err != nil {
		return EnquiryInput{}, err
	}

	var quantity *int
	if quantityText != nil {
		if n, ok := numparse.FirstInt(*quantityText); ok {
			quantity = &n
		}
	}

	return EnquiryInput{
		ID:       enquiryID,
		Category: derefOr(category, ""),
		Location: derefOr(location, ""),
		Quantity: quantity,
	}, nil
}

func loadCandidates(ctx context.Context, pool *pgxpool.Pool) ([]candidateRow, error) {
	rows, err := pool.Query(ctx, `
		SELECT sc.business_id, s.business_name, sc.category, sc.min_order_quantity, sc.max_order_quantity,
		       sc.service_regions, sc.capacity, s.verification_status::text
		FROM business_capabilities sc
		JOIN businesses s ON s.id = sc.business_id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []candidateRow
	for rows.Next() {
		var row candidateRow
		var minOrderQuantity, maxOrderQuantity *float64
		if err := rows.Scan(
			&row.SupplierID, &row.SupplierName, &row.Category,
			&minOrderQuantity, &maxOrderQuantity,
			&row.ServiceRegions, &row.Capacity, &row.VerificationStatus,
		); err != nil {
			return nil, err
		}
		if minOrderQuantity != nil {
			v := int(*minOrderQuantity)
			row.MinOrderQuantity = &v
		}
		if maxOrderQuantity != nil {
			v := int(*maxOrderQuantity)
			row.MaxOrderQuantity = &v
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func derefOr(s *string, fallback string) string {
	if s == nil {
		return fallback
	}
	return *s
}
