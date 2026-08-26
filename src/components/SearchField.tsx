import { TextInput, View } from 'react-native';
import { colors, radius, size, spacing, typography } from '../theme';
import { Icon } from './Icon';

/** Search must feel immediate — the query stays visible after submitting. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search products, suppliers, services...',
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
        backgroundColor: colors.surface.field,
        borderWidth: size.hairline,
        borderColor: colors.border.field,
        paddingHorizontal: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
      }}
    >
      <Icon name="search" size={size.iconSm} color={colors.text.tertiary} />
      <TextInput
        accessibilityLabel="Search Binder"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        returnKeyType="search"
        autoFocus={autoFocus}
        style={[typography.body, { flex: 1, color: colors.text.primary }]}
      />
    </View>
  );
}
