import type { MatchQuality } from '../components/MatchLabel';

export function normalise(value: string) {
  return value.trim().toLowerCase();
}

export function keywordMatches(text: string, keywords: string[]) {
  const normalisedText = normalise(text);
  return keywords.filter((keyword) => keyword.length > 2 && normalisedText.includes(keyword)).length;
}

export function scoreToMatchQuality(score: number): MatchQuality {
  if (score >= 60) return 'strong';
  if (score >= 30) return 'good';
  return 'potential';
}
