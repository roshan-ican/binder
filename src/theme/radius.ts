/** Binder avoids over-rounded "friendly SaaS" geometry. */
export const radius = {
  xs: 4,
  sm: 8,
  /** Inputs and chips. */
  input: 10,
  /** Cards and buttons — the default. */
  md: 12,
  lg: 16,
  /** Bottom sheets: top corners only. */
  sheet: 20,
  /** Pills. Only when the thing is semantically a pill. */
  full: 999,
} as const;
