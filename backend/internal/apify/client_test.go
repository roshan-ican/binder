package apify

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSearchPlaces(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s", r.Method)
		}
		if r.Header.Get("Authorization") != "Bearer secret" {
			t.Fatal("missing bearer token")
		}
		var input SearchInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			t.Fatal(err)
		}
		if input.LocationQuery != "Gangtok, Sikkim, India" {
			t.Fatalf("location = %q", input.LocationQuery)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`[{"title":"Sikkim Traders","placeId":"place-1","city":"Gangtok","state":"Sikkim","countryCode":"IN","location":{"lat":27.33,"lng":88.61}}]`))
	}))
	defer server.Close()

	client := NewClient("secret")
	client.baseURL = server.URL
	places, err := client.SearchPlaces(context.Background(), SearchInput{
		SearchStringsArray:        []string{"business"},
		LocationQuery:             "Gangtok, Sikkim, India",
		MaxCrawledPlacesPerSearch: 10,
		Language:                  "en",
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(places) != 1 || places[0].PlaceID != "place-1" {
		t.Fatalf("places = %#v", places)
	}
}
