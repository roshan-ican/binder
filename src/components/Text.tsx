import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, typography, type TypeVariant } from '../theme';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'chrome' | 'danger' | 'success' | 'warning';

const tones: Record<Tone, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  disabled: colors.text.disabled,
  inverse: colors.text.inverse,
  chrome: colors.chrome[200],
  danger: colors.semantic.danger,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
};

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
};

/**
 * Every string in the product goes through here so the type scale stays the
 * only source of size, weight and tracking.
 */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  return <RNText {...rest} style={[typography[variant], { color: tones[tone] }, style]} />;
}
