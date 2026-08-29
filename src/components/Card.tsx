import { View, type ViewStyle } from "react-native";
import { colors, radius, rhythm, size } from "../theme";
import { AnimatedPressable } from "./AnimatedPressable";
import { ChromeTraceBorder } from "./ChromeTraceBorder";

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
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  };

  const content = (
    <View style={{ position: "relative", zIndex: 1 }}>{children}</View>
  );

  if (!onPress) {
    return (
      <View style={[base, style]}>
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        {content}
      </View>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      pressedScale={0.985}
      style={({ pressed }) => [
        base,
        pressed && { backgroundColor: colors.bg.elevated },
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: pressed
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.04)",
            }}
          />
          <ChromeTraceBorder borderRadius={radius.md} />
          {content}
        </>
      )}
    </AnimatedPressable>
  );
}
