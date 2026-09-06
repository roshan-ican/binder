// Command match runs Binder's Matching Brain v1 for one enquiry and prints
// the ranked, persisted result. Usage:
//
//	go run ./cmd/match <enquiry-id>
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/roshan-ican/binder/backend/internal/config"
	"github.com/roshan-ican/binder/backend/internal/db"
	"github.com/roshan-ican/binder/backend/internal/matching"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("usage: match <enquiry-id>")
	}
	enquiryID := os.Args[1]

	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	ranked, err := matching.Run(ctx, pool, enquiryID)
	if err != nil {
		log.Fatalf("run matching: %v", err)
	}

	if len(ranked) == 0 {
		fmt.Println("no candidates passed the hard filters")
		return
	}
	for _, r := range ranked {
		fmt.Printf("#%d  %-24s score=%-5.1f  category=%.0f moq=%.0f location=%.0f capacity=%.0f trust=%.0f\n",
			r.Rank, r.Name, r.Score,
			r.Breakdown.CategoryFit, r.Breakdown.MOQFit, r.Breakdown.LocationFit, r.Breakdown.CapacityFit, r.Breakdown.TrustScore)
	}
}
