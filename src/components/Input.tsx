import { useState } from "react";
import { TextInput, View, type KeyboardTypeOptions } from "react-native";
import { colors, radius, size, spacing, typography } from "../theme";
import { Text } from "./Text";

export type InputProps = {
  /** Labels sit above the field. Placeholder text is never the only label. */
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  /** Error text is linked to the field for screen readers. */
  error?: string;
  helper?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  /** Rendered inside the field, before the text — currency symbols, prefixes. */
  prefix?: string;
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  optional,
  error,
  helper,
  multiline,
  keyboardType,
  prefix,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.semantic.danger
    : focused
      ? colors.border.focus
      : colors.border.field;

  return (
    <View style={{ gap: spacing[2] }}>
      <View
        style={{
          flexDirection: "row",
          gap: spacing[2],
          alignItems: "baseline",
        }}
      >
        <Text variant="label" tone="secondary">
          {label}
        </Text>
        {optional ? (
          <Text variant="label" tone="tertiary">
            Optional
          </Text>
        ) : null}
      </View>

      <View
        style={{
          minHeight: multiline ? size.control * 2 : size.control,
          borderRadius: radius.input,
          backgroundColor: colors.surface.field,
          borderWidth: size.hairline,
          borderColor,
          paddingHorizontal: spacing[4],
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          gap: spacing[2],
          shadowColor: "#000000",
          shadowOpacity: 0.16,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 1 },
        }}
      >
        {prefix ? (
          <Text variant="body" tone="tertiary">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[
            typography.body,
            {
              flex: 1,
              color: colors.text.primary,
              paddingVertical: multiline ? spacing[3] : 0,
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
        />
      </View>

      {error ? (
        <Text variant="bodySmall" tone="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="bodySmall" tone="tertiary">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
