/** 4-point base grid. Never let content touch the screen edge. */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Horizontal page padding by screen kind. */
export const pagePadding = {
  /** Standard screens. */
  default: spacing[5],
  /** Dense data screens (results, dashboards). */
  dense: spacing[4],
  /** Hero and onboarding screens. */
  hero: spacing[6],
} as const;

/** Vertical rhythm between the recurring pairs of a screen. */
export const rhythm = {
  titleToContent: spacing[6],
  sectionToSection: spacing[8],
  labelToInput: spacing[2],
  cardPadding: spacing[4],
  cardToCard: spacing[3],
} as const;
