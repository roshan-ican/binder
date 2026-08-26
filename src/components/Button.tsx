import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Shows an inline spinner and swaps the label — never a full-screen spinner. */
  loading?: boolean;
  loadingLabel?: string;
  /** Only for the rare case where the icon carries meaning the label cannot. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

/**
 * One dominant action per screen. Sentence case. Minimum 48pt height so the
 * 44pt touch target is never in question.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingLabel,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityLabel={label}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: size.control,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing[2],
          paddingHorizontal: spacing[5],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isInactive ? 0.5 : 1,
        },
        variantStyle(variant, pressed),
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={indicatorColor(variant)} /> : icon}
      <Text variant="labelLarge" tone={labelTone(variant)}>
        {loading ? loadingLabel ?? label : label}
      </Text>
    </Pressable>
  );
}

function variantStyle(variant: Variant, pressed: boolean): ViewStyle {
  switch (variant) {
    case 'primary':
      // Black UI cannot rely on black buttons — the CTA is chrome.
      return { backgroundColor: pressed ? colors.chrome[200] : colors.surface.inverse };
    case 'secondary':
      return {
        backgroundColor: pressed ? colors.surface.hover : 'transparent',
        borderWidth: size.hairline,
        borderColor: colors.border.default,
      };
    case 'destructive':
      return {
        backgroundColor: 'transparent',
        borderWidth: size.hairline,
        borderColor: colors.semantic.danger,
      };
    case 'tertiary':
    default:
      return { backgroundColor: 'transparent', height: size.controlSm, paddingHorizontal: 0 };
  }
}

function labelTone(variant: Variant) {
  if (variant === 'primary') return 'inverse' as const;
  if (variant === 'destructive') return 'danger' as const;
  return 'primary' as const;
}

function indicatorColor(variant: Variant) {
  return variant === 'primary' ? colors.text.inverse : colors.text.primary;
}

/** Text button with no container: "Skip for now", "Edit", "View all". */
export function TextButton({ label, onPress, tone = 'secondary' }: { label: string; onPress?: () => void; tone?: 'secondary' | 'chrome' | 'danger' }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={spacing[3]}
      style={{ minHeight: size.tap, justifyContent: 'center' }}
    >
      <Text variant="labelLarge" tone={tone}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Square icon-only action. Always carries an accessibility label. */
export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size.tap,
        height: size.tap,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.surface.hover : 'transparent',
      })}
    >
      <View pointerEvents="none">{icon}</View>
    </Pressable>
  );
}
