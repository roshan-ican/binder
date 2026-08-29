import { Platform, type TextStyle } from 'react-native';

/**
 * The type scale. Editorial hierarchy carries most of the design, so these
 * are the least negotiable tokens in the system.
 *
 * Font families resolve to the Inter / Instrument Serif faces loaded in
 * `App.tsx`. If the fonts have not finished loading, React Native falls back
 * to the platform sans, which is close enough to avoid a layout jump.
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  serif: 'InstrumentSerif_400Regular',
} as const;

type Scale = Record<string, TextStyle>;

const scale = {
  displayLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0,
  },
  heading1: {
    fontFamily: fontFamily.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
  },
  heading2: {
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0,
  },
  heading3: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 25,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  labelLarge: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  /** Uppercase micro label — match quality, section openers, trust marks. */
  micro: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  /** Business quantities. Tabular figures so numbers stay scannable. */
  numberHero: {
    fontFamily: fontFamily.medium,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: 0,
    ...Platform.select({
      ios: { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
      default: {},
    }),
  },
  /** One editorial line per screen, at most. Never on a control. */
  editorial: {
    fontFamily: fontFamily.serif,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0,
  },
} satisfies Scale;

export const typography = scale;
export type TypeVariant = keyof typeof scale;
