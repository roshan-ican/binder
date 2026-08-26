import { Pressable, View } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Removable filter chips carry a close affordance. */
  onRemove?: () => void;
};

/** Categories, materials, capabilities, locations, applied filters. */
export function Chip({ label, selected = false, onPress, icon, onRemove }: ChipProps) {
  const content = (
    <View
      style={{
        height: size.chip,
        paddingHorizontal: spacing[3],
        borderRadius: radius.input,
        borderWidth: size.hairline,
        borderColor: selected ? colors.chrome[200] : colors.border.default,
        backgroundColor: selected ? colors.chrome[200] : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
      }}
    >
      {icon ? (
        <Icon name={icon} size={size.iconSm} color={selected ? colors.text.inverse : colors.text.secondary} />
      ) : null}
      <Text variant="label" tone={selected ? 'inverse' : 'secondary'}>
        {label}
      </Text>
      {onRemove ? (
        <Icon name="close" size={14} color={selected ? colors.text.inverse : colors.text.tertiary} />
      ) : null}
    </View>
  );

  if (!onPress && !onRemove) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onRemove ?? onPress}
      hitSlop={spacing[1]}
    >
      {content}
    </Pressable>
  );
}
