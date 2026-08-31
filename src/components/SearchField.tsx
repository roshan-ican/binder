import { TextInput, View } from "react-native";
import { colors, radius, size, spacing, typography } from "../theme";
import { ChromeSurface } from "./ChromeSurface";
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
  return (
    <View
      style={{
        height: size.control,
        borderRadius: radius.input,
        backgroundColor: "#E2DDD7",
        borderWidth: size.hairline,
        borderColor: "#AAA39D",
        paddingHorizontal: spacing[4],
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        shadowColor: "#000000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        overflow: "hidden",
      }}
    >
      <ChromeSurface borderRadius={radius.input} intensity="soft" />
      <Icon name="search" size={size.iconSm} color={colors.text.inverse} />
      <TextInput
        accessibilityLabel="Search Binder"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#55524F"
        returnKeyType="search"
        autoFocus={autoFocus}
        style={[typography.body, { flex: 1, color: colors.text.inverse }]}
      />
    </View>
  );
}
