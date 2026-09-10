// Command seed loads the current src/data/mock.ts and src/data/swaps.ts
// volume into the schema, as a sanity check that every mock field has a
// home. It is not meant to be idempotent or safe to run against real data --
// point it at a scratch database.
//
// Job-seeker data is dropped from the product, so it has no home here
// either way. Business capabilities ARE seeded, from the 5 non-`me` mock
// businesses' mock capability/moq/capacity/serves fields.
// match_candidates/match_events/outreach_attempts are left empty, produced by the
// Matching Brain (cmd/match) against the seeded data, not by the seed
// script itself. conversations/messages are also skipped: the mock data links a
// conversation to an enquiry by a loose title string, which the new
// `conversations.context_id` (a real FK-shaped UUID) can't accept without
// fabricating a match -- left for when the API layer creates conversations
// for real instead of the seed script guessing at one.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/roshan-ican/binder/backend/internal/config"
	"github.com/roshan-ican/binder/backend/internal/db"
	"github.com/roshan-ican/binder/backend/internal/numparse"
)

type industryGroup struct {
	id         string
	label      string
	industries []string
}

// Transcribed from src/data/businessTaxonomy.ts.
var industryGroups = []industryGroup{
	{"technology", "Technology", []string{"Artificial Intelligence", "Software & SaaS", "Crypto & Web3", "Fintech", "Cybersecurity", "Cloud Services", "IT Services", "Consumer Electronics"}},
	{"health", "Health & Wellness", []string{"Hospitals", "Clinics", "Pharmaceuticals", "Medical Devices", "Diagnostics & Laboratories", "Mental Health", "Fitness & Wellness", "Health Insurance"}},
	{"fashion", "Fashion & Textiles", []string{"Fashion & Apparel", "Textiles", "Leather & Footwear", "Jewellery & Accessories", "Garment Manufacturing", "Fabric & Yarn", "Beauty & Personal Care"}},
	{"manufacturing", "Manufacturing", []string{"Industrial Manufacturing", "Automotive", "Machinery & Equipment", "Chemicals", "Plastics & Rubber", "Metals & Fabrication", "Furniture", "Packaging"}},
	{"retail", "Retail & Commerce", []string{"Retail", "E-commerce", "Wholesale", "Consumer Goods", "Home & Lifestyle", "Marketplaces", "Import & Export"}},
	{"food", "Food & Agriculture", []string{"Food & Beverage", "Agriculture", "Dairy", "Restaurants & Catering", "Food Processing", "Fisheries & Seafood", "AgriTech"}},
	{"construction", "Construction & Property", []string{"Construction", "Real Estate", "Architecture", "Interior Design", "Building Materials", "Property Management", "Facilities Management"}},
	{"transport", "Transport & Logistics", []string{"Logistics", "Warehousing", "Freight & Shipping", "Automotive Services", "Aviation", "Public Transport", "Last-mile Delivery"}},
	{"services", "Professional Services", []string{"Consulting", "Legal Services", "Accounting & Tax", "Human Resources", "Marketing & Advertising", "Design Services", "Business Support"}},
	{"finance", "Finance", []string{"Banking", "Insurance", "Investments", "Payments", "Lending", "Accounting Technology", "Asset Management"}},
	{"education", "Education", []string{"Schools", "Higher Education", "EdTech", "Vocational Training", "Professional Training", "Tutoring", "Publishing"}},
	{"media", "Media & Entertainment", []string{"Film & Television", "Music", "Gaming", "News & Publishing", "Content Creation", "Events", "Sports"}},
	{"energy", "Energy & Environment", []string{"Renewable Energy", "Oil & Gas", "Utilities", "Recycling & Waste", "Environmental Services", "Climate Technology", "Mining"}},
	{"travel", "Travel & Hospitality", []string{"Hotels & Resorts", "Travel Services", "Tourism", "Restaurants", "Events & Venues", "Airlines", "Leisure"}},
}

type seedBusiness struct {
	mockID       string // src/data/mock.ts Business.id, or a synthetic key for enquiry-only buyers
	name         string
	city         string
	region       string
	roles        []string // business_role_type values
	verification string   // verification_status value
}

// Transcribed from src/data/mock.ts `me` and `businesses`, plus synthetic
// businesses for the external enquiry buyers referenced only by name in
// `opportunities` (UrbanWear, Kraft & Co, Atelier Nine) -- enquiries.
// buyer_business_id is NOT NULL, so a real buyer needs to exist.
var seedBusinesses = []seedBusiness{
	{"me", "Roshan Clothing", "Kanpur", "Uttar Pradesh, India", []string{"buyer", "seller"}, "verified"},
	{"abc-leather", "ABC Leather Works", "Kanpur", "Uttar Pradesh", []string{"seller"}, "verified"},
	{"northline-tanners", "Northline Tanners", "Kanpur", "Uttar Pradesh", []string{"seller"}, "pending"},
	{"meridian-pack", "Meridian Packaging", "Kanpur", "Uttar Pradesh", []string{"seller"}, "verified"},
	{"shakti-logistics", "Shakti Logistics", "Lucknow", "Uttar Pradesh", []string{"service_provider"}, "verified"},
	{"city-fabric-house", "City Fabric House", "Kanpur", "Uttar Pradesh", []string{"seller"}, "pending"},
	{"buyer-urbanwear", "UrbanWear", "Delhi", "Delhi, India", []string{"buyer"}, "unverified"},
	{"buyer-kraft-co", "Kraft & Co", "Jaipur", "Rajasthan, India", []string{"buyer"}, "unverified"},
	{"buyer-atelier-nine", "Atelier Nine", "Kanpur", "Uttar Pradesh, India", []string{"buyer"}, "verified"},
}

type seedEnquiry struct {
	buyerMockID string
	title       string
	// category has no equivalent in src/data/mock.ts's Enquiry type -- only
	// the create-flow form (EnquiryDraft) captures one, and mock.ts doesn't
	// store drafts. Hand-assigned here to stand in for what a human (or,
	// later, the Language Brain) would have tagged the free-text title with,
	// so the Matching Brain has something real to filter on.
	category   string
	location   string
	neededBy   string
	quantity   string
	budget     string
	fitNote    string
	status     string
	relevant   int
	interested int
	connected  int
}

// Transcribed from src/data/mock.ts `opportunities` and `myEnquiries`.
var seedEnquiries = []seedEnquiry{
	{"buyer-urbanwear", "500 leather jackets", "Leather manufacturing", "Delhi", "18 Oct 2026", "500 units", "₹900–₹1,200 / unit", "MOQ compatible", "active", 14, 5, 2},
	{"buyer-kraft-co", "2,000 canvas totes", "Garment manufacturing", "Jaipur", "02 Nov 2026", "2,000 units", "₹180–₹240 / unit", "Above your usual MOQ", "active", 9, 3, 1},
	{"buyer-atelier-nine", "1,200 leather belts", "Leather manufacturing", "Kanpur", "25 Sep 2026", "1,200 units", "₹260–₹320 / unit", "MOQ compatible", "active", 11, 4, 0},
	{"me", "10,000 garment boxes", "Garment packaging", "Kanpur", "18 Oct 2026", "10,000 units", "₹18–₹26 / unit", "Printing required", "active", 14, 5, 2},
	{"me", "Monthly freight to Delhi", "Logistics", "Kanpur", "Ongoing", "8 trips / month", "₹14,000 / trip", "Part load acceptable", "draft", 0, 0, 0},
}

// seedSupplier supplies structured business_capabilities from the existing
// mock businesses for exercising the matching flow.
type seedSupplier struct {
	businessMockID string
	category       string
	capability     string
	description    string
	moqRaw         string // src/data/mock.ts Business.moq
	capacity       string // src/data/mock.ts Business.capacity
	serviceRegions []string
}

var seedSuppliers = []seedSupplier{
	{"abc-leather", "Leather manufacturing", "Leather jacket and outerwear manufacturing, job work and full production runs",
		"Leather jacket and outerwear manufacturing since 1998. Job work and full production runs for domestic brands and export houses.",
		"500 units", "30,000 / month", []string{"India", "UAE"}},
	{"northline-tanners", "Finished leather supply", "Finished and semi-finished leather, vegetable and chrome tanned",
		"Finished and semi-finished leather supply, vegetable and chrome tanned.",
		"200 metres", "80,000 m / month", []string{"India"}},
	{"meridian-pack", "Garment packaging", "Corrugated and rigid garment packaging, printing in-house",
		"Corrugated and rigid garment packaging, printing in-house.",
		"5,000 units", "400,000 / month", []string{"India"}},
	{"shakti-logistics", "Logistics", "Road freight across North India with warehousing",
		"Road freight across North India with warehousing at Lucknow and Delhi.",
		"No minimum", "120 vehicles", []string{"North India"}},
	{"city-fabric-house", "Retail fabrics", "Neighbourhood fabric shop with cotton, denim, lining and seasonal material",
		"Neighbourhood fabric shop with cotton, denim, lining and seasonal garment material.",
		"No minimum", "Daily retail stock", []string{"Kanpur"}},
}

type seedAsset struct {
	category    string
	title       string
	description string
	quantity    string
}

type seedSwapListing struct {
	businessMockID string
	status         string
	expiresIn      string
	relevant       int
	interested     int
	connected      int
	offering       seedAsset
	seeking        seedAsset
}

// Transcribed from src/data/swaps.ts `swapListings`.
var seedSwapListings = []seedSwapListing{
	{"me", "active", "18 days", 6, 2, 0,
		seedAsset{"Textiles", "Leftover cotton fabric rolls", "Roll-end cotton fabric offcuts from production, still usable for lining and small-batch runs.", "400 metres"},
		seedAsset{"Packaging", "Garment boxes", "Rigid garment boxes for finished stock, any neutral finish.", ""}},
	{"me", "active", "25 days", 4, 1, 0,
		seedAsset{"Space", "Warehouse space, 2,000 sq ft", "Spare storage bay near our unit, available most weekdays.", ""},
		seedAsset{"Logistics", "Freight and delivery capacity", "Regular delivery capacity on the Kanpur–Delhi route.", ""}},
	{"me", "draft", "—", 0, 0, 0,
		seedAsset{"Inventory", "Surplus buttons and trims", "Assorted buttons and trims left over from a discontinued line.", ""},
		seedAsset{"Services", "Sample stitching support", "Occasional overflow stitching for sample runs.", ""}},
	{"meridian-pack", "active", "20 days", 5, 2, 0,
		seedAsset{"Packaging", "Surplus garment boxes", "Overrun rigid garment boxes from a cancelled order, matte black finish.", "3,000 units"},
		seedAsset{"Textiles", "Cotton fabric offcuts", "Cotton fabric scraps for internal padding and sample work.", ""}},
	{"shakti-logistics", "active", "14 days", 3, 1, 0,
		seedAsset{"Logistics", "Spare freight capacity, Kanpur–Delhi route", "Part-load truck capacity on our regular Delhi route, twice weekly.", ""},
		seedAsset{"Packaging", "Packaging crates", "Durable crates for our own warehouse dispatch.", ""}},
	{"city-fabric-house", "active", "10 days", 2, 0, 0,
		seedAsset{"Packaging", "Surplus packaging crates", "Spare wooden and plastic crates from a closed retail line.", ""},
		seedAsset{"Space", "Warehouse storage space", "Short-term storage space for seasonal stock.", ""}},
	{"abc-leather", "active", "9 days", 1, 0, 0,
		seedAsset{"Materials", "Leather offcuts and scrap", "Usable leather offcuts from jacket production.", ""},
		seedAsset{"Equipment", "Spare stitching machines", "A couple of spare industrial stitching machines for a new line.", ""}},
}

func main() {
	cfg := config.Load()
	// Generous timeout: this issues ~150 individual round trips (one per
	// row) and a remote database (e.g. Supabase, not localhost) can easily
	// take longer than 30s for that -- seen in practice.
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	tx, err := pool.Begin(ctx)
	if err != nil {
		log.Fatalf("begin: %v", err)
	}
	defer tx.Rollback(ctx)

	industryIDs := map[string]string{} // industry_label -> id
	for _, g := range industryGroups {
		for _, label := range g.industries {
			var id string
			err := tx.QueryRow(ctx,
				`INSERT INTO industries (group_id, group_label, industry_label) VALUES ($1, $2, $3) RETURNING id`,
				g.id, g.label, label,
			).Scan(&id)
			if err != nil {
				log.Fatalf("insert industry %s: %v", label, err)
			}
			industryIDs[label] = id
		}
	}
	fmt.Printf("seeded %d industries\n", len(industryIDs))

	businessIDs := map[string]string{} // mockID -> business id
	for _, b := range seedBusinesses {
		var userID string
		err := tx.QueryRow(ctx,
			`INSERT INTO users (full_name) VALUES ($1) RETURNING id`,
			b.name+" (owner)",
		).Scan(&userID)
		if err != nil {
			log.Fatalf("insert user for %s: %v", b.name, err)
		}

		var businessID string
		err = tx.QueryRow(ctx,
			`INSERT INTO businesses (owner_user_id, business_name, contact_name, city, region, verification_status, country_code, source_type)
			 VALUES ($1, $2, $3, $4, $5, $6, 'IN', 'mock') RETURNING id`,
			userID, b.name, "Roshan", b.city, b.region, b.verification,
		).Scan(&businessID)
		if err != nil {
			log.Fatalf("insert business %s: %v", b.name, err)
		}
		businessIDs[b.mockID] = businessID

		for _, role := range b.roles {
			if _, err := tx.Exec(ctx,
				`INSERT INTO business_roles (business_id, role_type) VALUES ($1, $2)`,
				businessID, role,
			); err != nil {
				log.Fatalf("insert business_role %s/%s: %v", b.name, role, err)
			}
		}
	}
	fmt.Printf("seeded %d businesses\n", len(businessIDs))

	// `me`'s industries: Fashion & Apparel, Textiles (src/data/mock.ts).
	for _, label := range []string{"Fashion & Apparel", "Textiles"} {
		if _, err := tx.Exec(ctx,
			`INSERT INTO business_industries (business_id, industry_id) VALUES ($1, $2)`,
			businessIDs["me"], industryIDs[label],
		); err != nil {
			log.Fatalf("insert business_industries for me/%s: %v", label, err)
		}
	}

	for _, e := range seedEnquiries {
		buyerID, ok := businessIDs[e.buyerMockID]
		if !ok {
			log.Fatalf("enquiry %q references unknown buyer %q", e.title, e.buyerMockID)
		}
		if _, err := tx.Exec(ctx,
			`INSERT INTO enquiries (buyer_business_id, title, category, location, needed_by, quantity, budget, fit_note, status, relevant_count, interested_count, connected_count)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
			buyerID, e.title, e.category, e.location, e.neededBy, e.quantity, e.budget, e.fitNote, e.status, e.relevant, e.interested, e.connected,
		); err != nil {
			log.Fatalf("insert enquiry %q: %v", e.title, err)
		}
	}
	fmt.Printf("seeded %d enquiries\n", len(seedEnquiries))

	for _, s := range seedSuppliers {
		businessID, ok := businessIDs[s.businessMockID]
		if !ok {
			log.Fatalf("supplier references unknown business %q", s.businessMockID)
		}

		var minOrderQuantity *int // ok=false ("No minimum") means no lower bound -- left nil
		if n, ok := numparse.FirstInt(s.moqRaw); ok {
			minOrderQuantity = &n
		}

		if _, err := tx.Exec(ctx,
			`INSERT INTO business_capabilities (business_id, category, capability, description, min_order_quantity, capacity, service_regions)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			businessID, s.category, s.capability, s.description, minOrderQuantity, s.capacity, s.serviceRegions,
		); err != nil {
			log.Fatalf("insert business_capabilities for %s: %v", s.businessMockID, err)
		}
	}
	fmt.Printf("seeded capabilities for %d businesses\n", len(seedSuppliers))

	for _, l := range seedSwapListings {
		businessID, ok := businessIDs[l.businessMockID]
		if !ok {
			log.Fatalf("swap listing references unknown business %q", l.businessMockID)
		}
		var listingID string
		var expiresAt *time.Time // left null; `expiresIn` is a display string, not resolved to a real timestamp here
		err := tx.QueryRow(ctx,
			`INSERT INTO swap_listings (business_id, status, expires_at, relevant_count, interested_count, connected_count)
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
			businessID, l.status, expiresAt, l.relevant, l.interested, l.connected,
		).Scan(&listingID)
		if err != nil {
			log.Fatalf("insert swap_listing for %s: %v", l.businessMockID, err)
		}

		for _, pair := range []struct {
			role  string
			asset seedAsset
		}{
			{"offering", l.offering},
			{"seeking", l.seeking},
		} {
			var quantity *string
			if pair.asset.quantity != "" {
				quantity = &pair.asset.quantity
			}
			if _, err := tx.Exec(ctx,
				`INSERT INTO swap_listing_assets (listing_id, role, category, title, description, quantity)
				 VALUES ($1, $2, $3, $4, $5, $6)`,
				listingID, pair.role, pair.asset.category, pair.asset.title, pair.asset.description, quantity,
			); err != nil {
				log.Fatalf("insert swap_listing_asset %s/%s: %v", l.businessMockID, pair.role, err)
			}
		}
	}
	fmt.Printf("seeded %d swap listings\n", len(seedSwapListings))

	if err := tx.Commit(ctx); err != nil {
		log.Fatalf("commit: %v", err)
	}
	fmt.Println("seed complete")
}
