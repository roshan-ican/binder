// Package matching is Binder's Matching Brain v1: deterministic hard
// filters plus a hand-weighted score, per the hybrid-AI architecture --
// "do not train a complicated ML model at the beginning." No embeddings,
// no LLM calls; those are later, additive phases (the SemanticSimilarity
// field exists now so the score_breakdown shape doesn't change when they
// land).
package matching

import "strings"

const RankingVersion = "v1-rule-based"

type EnquiryInput struct {
	ID       string
	Category string
	Location string
	Quantity *int // parsed from the enquiry's free-text quantity; nil if unparseable
}

type CandidateInput struct {
	SupplierID         string
	Category           string
	MinOrderQuantity   *int
	MaxOrderQuantity   *int
	ServiceRegions     []string
	Capacity           string
	VerificationStatus string
}

type ScoreBreakdown struct {
	SemanticSimilarity float64 `json:"semantic_similarity"`
	CategoryFit        float64 `json:"category_fit"`
	MOQFit             float64 `json:"moq_fit"`
	LocationFit        float64 `json:"location_fit"`
	CapacityFit        float64 `json:"capacity_fit"`
	TrustScore         float64 `json:"trust_score"`
}

type Result struct {
	SupplierID string
	Score      float64
	Breakdown  ScoreBreakdown
}

// Evaluate scores one enquiry against one candidate supplier. ok is false
// when a mandatory requirement (category, MOQ) fails -- semantic similarity
// never overrides a failed hard filter, per Brain 2's design.
func Evaluate(enquiry EnquiryInput, candidate CandidateInput) (result Result, ok bool) {
	categoryMatched, categoryKnown := categoryFit(enquiry.Category, candidate.Category)
	if categoryKnown && !categoryMatched {
		return Result{}, false
	}
	if !moqCompatible(enquiry.Quantity, candidate.MinOrderQuantity, candidate.MaxOrderQuantity) {
		return Result{}, false
	}

	b := ScoreBreakdown{}
	if categoryMatched {
		b.CategoryFit = 40
	}
	if enquiry.Quantity == nil || (candidate.MinOrderQuantity == nil && candidate.MaxOrderQuantity == nil) {
		b.MOQFit = 10 // unknown on one side or the other -- not disqualifying, but not a confirmed fit either
	} else {
		b.MOQFit = 20 // known quantity checked against a known MOQ range above, and it passed
	}
	if locationFit(enquiry.Location, candidate.ServiceRegions) {
		b.LocationFit = 20
	}
	if candidate.Capacity != "" {
		b.CapacityFit = 10
	}
	b.TrustScore = trustScore(candidate.VerificationStatus)

	total := b.CategoryFit + b.MOQFit + b.LocationFit + b.CapacityFit + b.TrustScore + b.SemanticSimilarity
	return Result{SupplierID: candidate.SupplierID, Score: total, Breakdown: b}, true
}

// categoryFit reports whether the two category strings overlap, and
// whether the comparison was possible at all (both sides non-empty).
// An unknown comparison is never grounds for exclusion.
//
// Deliberately substring-only, not word-overlap: an earlier version matched
// on any shared word over 3 characters, which matched "Garment
// manufacturing" to "Leather manufacturing" on the word "manufacturing" --
// a false positive that would have shown a tote buyer a leather-jacket
// maker. A missed match is a worse look than a wrong one, so this stays
// conservative until real categories (or embeddings, in Matching Brain v2)
// replace free-text comparison.
func categoryFit(a, b string) (matched, known bool) {
	an, bn := normalize(a), normalize(b)
	if an == "" || bn == "" {
		return false, false
	}
	known = true
	matched = an == bn || strings.Contains(bn, an) || strings.Contains(an, bn)
	return matched, known
}

func moqCompatible(quantity, min, max *int) bool {
	if quantity == nil {
		return true
	}
	if min != nil && *quantity < *min {
		return false
	}
	if max != nil && *quantity > *max {
		return false
	}
	return true
}

func locationFit(location string, regions []string) bool {
	loc := normalize(location)
	if loc == "" {
		return false
	}
	for _, region := range regions {
		r := normalize(region)
		if r == "" {
			continue
		}
		if strings.Contains(loc, r) || strings.Contains(r, loc) {
			return true
		}
	}
	return false
}

func trustScore(verificationStatus string) float64 {
	switch verificationStatus {
	case "verified":
		return 20
	case "pending":
		return 10
	default:
		return 0
	}
}

func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}
