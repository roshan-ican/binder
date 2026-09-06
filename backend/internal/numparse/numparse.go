// Package numparse extracts numbers out of the free-text quantity/MOQ
// strings the mock data (and, until the Language Brain exists, real users)
// enters -- "2,000 units", "500 metres", "No minimum".
package numparse

import (
	"regexp"
	"strconv"
	"strings"
)

var firstNumberRe = regexp.MustCompile(`[0-9][0-9,]*`)

// FirstInt returns the first integer found in s, ignoring thousands
// separators. ok is false when s has no parseable number (e.g. "No
// minimum", "Ongoing") -- callers should treat that as "unknown", not zero.
func FirstInt(s string) (value int, ok bool) {
	match := firstNumberRe.FindString(s)
	if match == "" {
		return 0, false
	}
	n, err := strconv.Atoi(strings.ReplaceAll(match, ",", ""))
	if err != nil {
		return 0, false
	}
	return n, true
}
