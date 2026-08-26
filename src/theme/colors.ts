/**
 * Binder colour tokens.
 *
 * Mirrors the "Primitives" and "Color" variable collections in the Figma file
 * `Binder — Mobile Design System V1`. Primitives are raw values and are never
 * referenced from a screen — always go through the semantic layer below.
 *
 * Target: 90% black/neutral, 10% chrome.
 */

const primitives = {
  ink: {
    '000': '#070707',
    '050': '#0D0D0D',
    '075': '#101010',
    100: '#121212',
    150: '#171717',
    200: '#1B1B1B',
    250: '#202020',
    300: '#252525',
  },
  line: {
    100: '#242424',
    150: '#2A2A2A',
    200: '#323232',
    300: '#4B4B4B',
  },
  paper: {
    '000': '#F4F4F2',
    200: '#B6B6B1',
    400: '#777772',
    600: '#50504D',
  },
  obsidian: '#090909',
  chrome: {
    100: '#F3F3F1',
    200: '#DADAD6',
    300: '#BDBDB8',
    400: '#969690',
    500: '#73736E',
    600: '#555551',
  },
  state: {
    success: '#7E9B83',
    warning: '#B69A63',
    danger: '#A86F6F',
    info: '#7D8FA4',
  },
} as const;

export const colors = {
  /** Page and container backgrounds. */
  bg: {
    primary: primitives.ink['000'],
    secondary: primitives.ink['050'],
    raised: primitives.ink[100],
    elevated: primitives.ink[150],
  },
  /** Surfaces that sit on a background. */
  surface: {
    soft: primitives.ink[200],
    hover: primitives.ink[250],
    selected: primitives.ink[300],
    field: primitives.ink['075'],
    inverse: primitives.chrome[100],
  },
  text: {
    primary: primitives.paper['000'],
    secondary: primitives.paper[200],
    tertiary: primitives.paper[400],
    disabled: primitives.paper[600],
    inverse: primitives.obsidian,
  },
  border: {
    subtle: primitives.line[100],
    default: primitives.line[200],
    strong: primitives.line[300],
    field: primitives.line[150],
    focus: primitives.chrome[300],
  },
  /**
   * Chrome is a material accent, not a theme. Allowed on: the wordmark, the
   * primary CTA, selected underlines, match indicators, verification detail,
   * one premium divider. Never as a page background or a repeated gradient.
   */
  chrome: primitives.chrome,
  /** Desaturated on purpose. Never used as branding. */
  semantic: primitives.state,
} as const;

/** The one restrained metallic treatment. Maximum once per screen. */
export const chromeGradient = {
  angle: 120,
  stops: [
    { color: '#767676', position: 0 },
    { color: '#E6E6E1', position: 0.32 },
    { color: '#858580', position: 0.52 },
    { color: '#D3D3CF', position: 0.72 },
    { color: '#656561', position: 1 },
  ],
} as const;

export type Colors = typeof colors;
