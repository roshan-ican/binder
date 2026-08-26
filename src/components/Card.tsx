import { Pressable, View, type ViewStyle } from 'react-native';
import { colors, radius, rhythm, size } from '../theme';

/**
 * Border-based container. Almost no shadow — Binder is a printed directory,
 * not a stack of floating glass cards.
 */
export function Card({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const base: ViewStyle = {
    borderRadius: radius.md,
    borderWidth: size.hairline,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.raised,
    padding: rhythm.cardPadding,
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { backgroundColor: colors.bg.elevated }, style]}
    >
      {children}
    </Pressable>
  );
}
