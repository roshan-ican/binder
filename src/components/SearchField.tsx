import { useState } from "react";
import { TextInput, View } from "react-native";
import { colors, radius, size, spacing, typography } from "../theme";
import { Icon } from "./Icon";

/** Search must feel immediate — the query stays visible after submitting. */
export function SearchField({
  value,
  onChangeText,
  placeholder = "Search products, suppliers, services...",
  onSubmit,
  autoFocus,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={{
        height: size.control,
        borderRadius: radius.input,
        backgroundColor: colors.surface.field,
        borderWidth: size.hairline,
        borderColor: focused ? colors.border.focus : colors.border.strong,
        paddingHorizontal: spacing[4],
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        shadowColor: colors.bg.primary,
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View pointerEvents="none" style={{ position: "relative", zIndex: 1 }}>
        <Icon name="search" size={size.iconSm} color={colors.text.secondary} />
      </View>
      <TextInput
        accessibilityLabel="Search Binder"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        returnKeyType="search"
        autoFocus={autoFocus}
        style={[typography.body, { flex: 1, color: colors.text.primary, position: "relative", zIndex: 1 }]}
      />
    </View>
  );
}
