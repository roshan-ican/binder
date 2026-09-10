package supplierimport

import (
	"reflect"
	"testing"

	"github.com/roshan-ican/binder/backend/internal/apify"
)

func TestPlaceCategories(t *testing.T) {
	got := placeCategories(apify.Place{
		CategoryName: "Manufacturer",
		Categories:   []string{"manufacturer", "Garment supplier", " "},
	})
	want := []string{"Manufacturer", "Garment supplier"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v want %v", got, want)
	}
}

func TestPlaceCategoriesFallback(t *testing.T) {
	got := placeCategories(apify.Place{})
	if !reflect.DeepEqual(got, []string{"Business"}) {
		t.Fatalf("got %v", got)
	}
}
