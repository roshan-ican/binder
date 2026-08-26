export const size = {
  /** Button and input height. */
  control: 52,
  /** Compact control. Never go below the 44pt touch target. */
  controlSm: 44,
  chip: 36,
  tap: 44,
  iconSm: 18,
  icon: 20,
  iconNav: 24,
  logoSm: 40,
  logo: 48,
  logoMd: 56,
  logoLg: 72,
  /** Borders carry the system. Shadows barely exist. */
  hairline: 1,
} as const;

/** Shadows are almost invisible by design — borders do the work. */
export const elevation = {
  none: {},
  sheet: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  overlay: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;
