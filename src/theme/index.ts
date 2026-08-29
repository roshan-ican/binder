export { colors, chromeGradient, type Colors } from './colors';
export { spacing, pagePadding, rhythm } from './spacing';
export { radius } from './radius';
export { size, elevation } from './size';
export { typography, fontFamily, type TypeVariant } from './typography';

/** Motion durations. Motion communicates state; it never decorates. */
export const motion = {
  tap: 120,
  small: 200,
  sheet: 260,
  trace: 2100,
  water: 4200,
} as const;
