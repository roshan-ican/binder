/**
 * Shared, deliberately simple text matching. Ranking on Binder has to be
 * explainable — every match we surface is accompanied by the reasons that
 * produced it, so the scoring stays readable rather than clever.
 */

export function normalise(value: string) {
  return value.trim().toLowerCase();
}

export function keywordMatches(text: string, keywords: string[]) {
  const normalisedText = normalise(text);
  return keywords.filter((keyword) => keyword.length > 2 && normalisedText.includes(keyword)).length;
}

/** True when `text` contains the term. Two-character terms are ignored as noise. */
export function containsTerm(text: string, term: string) {
  const needle = normalise(term);
  return needle.length > 2 && normalise(text).includes(needle);
}
