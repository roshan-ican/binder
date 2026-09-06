package matching

import "testing"

func intPtr(n int) *int { return &n }

func TestEvaluateExcludesOnSharedWordButDifferentCategory(t *testing.T) {
	// Regression: an earlier word-overlap heuristic matched these two on
	// the shared word "manufacturing", which would have shown a canvas
	// tote buyer a leather-jacket maker.
	enquiry := EnquiryInput{Category: "Garment manufacturing", Quantity: intPtr(2000)}
	candidate := CandidateInput{Category: "Leather manufacturing"}

	_, ok := Evaluate(enquiry, candidate)
	if ok {
		t.Fatal("expected exclusion: sharing the word \"manufacturing\" is not a real category match")
	}
}

func TestEvaluateExcludesOnCategoryMismatch(t *testing.T) {
	enquiry := EnquiryInput{Category: "Leather & Footwear", Quantity: intPtr(500)}
	candidate := CandidateInput{Category: "Logistics", VerificationStatus: "verified"}

	_, ok := Evaluate(enquiry, candidate)
	if ok {
		t.Fatal("expected exclusion on category mismatch, got a match")
	}
}

func TestEvaluateExcludesWhenBelowSupplierMOQ(t *testing.T) {
	enquiry := EnquiryInput{Category: "Packaging", Quantity: intPtr(100)}
	candidate := CandidateInput{Category: "Packaging", MinOrderQuantity: intPtr(5000)}

	_, ok := Evaluate(enquiry, candidate)
	if ok {
		t.Fatal("expected exclusion when enquiry quantity is below supplier's minimum order, got a match")
	}
}

func TestEvaluateExcludesWhenAboveSupplierMax(t *testing.T) {
	enquiry := EnquiryInput{Category: "Packaging", Quantity: intPtr(1_000_000)}
	candidate := CandidateInput{Category: "Packaging", MinOrderQuantity: intPtr(100), MaxOrderQuantity: intPtr(10_000)}

	_, ok := Evaluate(enquiry, candidate)
	if ok {
		t.Fatal("expected exclusion when enquiry quantity exceeds supplier's maximum order, got a match")
	}
}

func TestEvaluateDoesNotExcludeOnUnparseableQuantity(t *testing.T) {
	enquiry := EnquiryInput{Category: "Logistics", Quantity: nil} // e.g. "8 trips / month" had no clean unit count
	candidate := CandidateInput{Category: "Logistics", MinOrderQuantity: intPtr(50)}

	result, ok := Evaluate(enquiry, candidate)
	if !ok {
		t.Fatal("expected an unparseable enquiry quantity to not be disqualifying")
	}
	if result.Breakdown.MOQFit != 10 {
		t.Fatalf("expected the unknown-quantity MOQFit score (10), got %v", result.Breakdown.MOQFit)
	}
}

func TestEvaluateDoesNotExcludeOnUnknownCategoryEitherSide(t *testing.T) {
	enquiry := EnquiryInput{Category: "", Quantity: intPtr(10)}
	candidate := CandidateInput{Category: "Packaging"}

	result, ok := Evaluate(enquiry, candidate)
	if !ok {
		t.Fatal("expected a blank enquiry category to not be disqualifying")
	}
	if result.Breakdown.CategoryFit != 0 {
		t.Fatalf("expected no category credit when the comparison was unknown, got %v", result.Breakdown.CategoryFit)
	}
}

func TestEvaluateRewardsLocationMatch(t *testing.T) {
	enquiry := EnquiryInput{Category: "Leather", Location: "Kanpur", Quantity: intPtr(10)}

	inRegion, ok := Evaluate(enquiry, CandidateInput{Category: "Leather", ServiceRegions: []string{"India", "Kanpur"}})
	if !ok {
		t.Fatal("expected a match")
	}
	outOfRegion, ok := Evaluate(enquiry, CandidateInput{Category: "Leather", ServiceRegions: []string{"Europe"}})
	if !ok {
		t.Fatal("expected a match")
	}

	if inRegion.Breakdown.LocationFit <= outOfRegion.Breakdown.LocationFit {
		t.Fatalf("expected an in-region supplier to score higher on location: in=%v out=%v",
			inRegion.Breakdown.LocationFit, outOfRegion.Breakdown.LocationFit)
	}
}

func TestEvaluateRewardsVerifiedSuppliersOverUnverified(t *testing.T) {
	enquiry := EnquiryInput{Category: "Packaging", Quantity: intPtr(10)}

	verified, ok := Evaluate(enquiry, CandidateInput{Category: "Packaging", VerificationStatus: "verified"})
	if !ok {
		t.Fatal("expected a match")
	}
	unverified, ok := Evaluate(enquiry, CandidateInput{Category: "Packaging", VerificationStatus: "unverified"})
	if !ok {
		t.Fatal("expected a match")
	}

	if verified.Score <= unverified.Score {
		t.Fatalf("expected a verified supplier to outscore an unverified one: verified=%v unverified=%v",
			verified.Score, unverified.Score)
	}
}
