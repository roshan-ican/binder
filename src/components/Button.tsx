import {
  ActivityIndicator,
  View,
  type ViewStyle,
} from "react-native";
import { colors, radius, size, spacing } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";
import { ChromeTraceBorder } from "./ChromeTraceBorder";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

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
  variant = "primary",
  disabled = false,
  loading = false,
  loadingLabel,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityLabel={label}
      disabled={isInactive}
      onPress={onPress}
      pressedScale={variant === "tertiary" ? 0.99 : 0.98}
      wrapperStyle={{ alignSelf: fullWidth ? "stretch" : "flex-start" }}
      style={({ pressed }) => [
        {
          height: size.control,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing[2],
          paddingHorizontal: spacing[5],
          opacity: isInactive ? 0.5 : 1,
          overflow: "hidden",
          shadowColor: "#000000",
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
          position: "relative",
        },
        variantStyle(variant, pressed),
        style,
      ]}
    >
      {variant === "primary" ? <ChromeTraceBorder borderRadius={radius.md} /> : null}
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor(variant)} />
      ) : (
        icon
      )}
      <Text variant="labelLarge" tone={labelTone(variant)}>
        {loading ? (loadingLabel ?? label) : label}
      </Text>
    </AnimatedPressable>
  );
}

function variantStyle(variant: Variant, pressed: boolean): ViewStyle {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: pressed ? colors.surface.hover : colors.surface.raised,
        borderWidth: size.hairline,
        borderColor: colors.chrome[400],
      };
    case "secondary":
      return {
        backgroundColor: pressed ? colors.surface.hover : "transparent",
        borderWidth: size.hairline,
        borderColor: colors.border.default,
      };
    case "destructive":
      return {
        backgroundColor: "transparent",
        borderWidth: size.hairline,
        borderColor: colors.semantic.danger,
      };
    case "tertiary":
    default:
      return {
        backgroundColor: "transparent",
        height: size.controlSm,
        paddingHorizontal: 0,
      };
  }
}

function labelTone(variant: Variant) {
  if (variant === "destructive") return "danger" as const;
  return "primary" as const;
}

function indicatorColor(variant: Variant) {
  return colors.text.primary;
}

/** Text button with no container: "Skip for now", "Edit", "View all". */
export function TextButton({
  label,
  onPress,
  tone = "secondary",
}: {
  label: string;
  onPress?: () => void;
  tone?: "secondary" | "chrome" | "danger";
}) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={spacing[3]}
      pressedScale={0.99}
      style={{ minHeight: size.tap, justifyContent: "center" }}
    >
      <Text variant="labelLarge" tone={tone}>
        {label}
      </Text>
    </AnimatedPressable>
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
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      pressedScale={0.94}
      style={({ pressed }) => ({
        width: size.tap,
        height: size.tap,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        backgroundColor: pressed ? colors.surface.hover : "transparent",
      })}
    >
      <View pointerEvents="none">{icon}</View>
    </AnimatedPressable>
  );
}
