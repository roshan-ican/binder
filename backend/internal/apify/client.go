package apify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const DefaultActorID = "compass~crawler-google-places"

type Client struct {
	token      string
	actorID    string
	httpClient *http.Client
	baseURL    string
}

type SearchInput struct {
	SearchStringsArray        []string `json:"searchStringsArray"`
	LocationQuery             string   `json:"locationQuery"`
	MaxCrawledPlacesPerSearch int      `json:"maxCrawledPlacesPerSearch"`
	Language                  string   `json:"language"`
}

type Coordinates struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
}

type Place struct {
	Title        string      `json:"title"`
	PlaceID      string      `json:"placeId"`
	URL          string      `json:"url"`
	Website      string      `json:"website"`
	Phone        string      `json:"phone"`
	City         string      `json:"city"`
	State        string      `json:"state"`
	CountryCode  string      `json:"countryCode"`
	TotalScore   *float64    `json:"totalScore"`
	ReviewsCount *int        `json:"reviewsCount"`
	CategoryName string      `json:"categoryName"`
	Categories   []string    `json:"categories"`
	Location     Coordinates `json:"location"`
}

func NewClient(token string) *Client {
	return &Client{
		token:      token,
		actorID:    DefaultActorID,
		httpClient: &http.Client{Timeout: 10 * time.Minute},
		baseURL:    "https://api.apify.com/v2",
	}
}

func (c *Client) SearchPlaces(ctx context.Context, input SearchInput) ([]Place, error) {
	body, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("apify: encode input: %w", err)
	}
	actorID := url.PathEscape(c.actorID)
	endpoint := fmt.Sprintf("%s/actors/%s/run-sync-get-dataset-items", strings.TrimRight(c.baseURL, "/"), actorID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("apify: create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("apify: run actor: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		message, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return nil, fmt.Errorf("apify: status %d: %s", resp.StatusCode, strings.TrimSpace(string(message)))
	}

	var places []Place
	if err := json.NewDecoder(resp.Body).Decode(&places); err != nil {
		return nil, fmt.Errorf("apify: decode places: %w", err)
	}
	return places, nil
}
