import { ScrollView, View } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';

export type BrowseSliderItem<T extends string> = {
  key: T;
  label: string;
};

export function BrowseSlider<T extends string>({
  items,
  active,
  onChange,
  accessibilityLabel = 'Browse categories',
}: {
  items: BrowseSliderItem<T>[];
  active: T;
  onChange: (key: T) => void;
  accessibilityLabel?: string;
}) {
  return (
    <ScrollView
      horizontal
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing[3], paddingRight: spacing[2] }}
    >
      {items.map((item) => {
        const selected = item.key === active;

        return (
          <AnimatedPressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            onPress={() => onChange(item.key)}
            pressedScale={0.98}
            style={{
              minWidth: 92,
              minHeight: size.controlSm,
              paddingHorizontal: spacing[2],
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Text variant="labelLarge" tone={selected ? 'primary' : 'secondary'}>
              {item.label}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                width: selected ? 52 : 0,
                height: 3,
                borderRadius: radius.full,
                backgroundColor: colors.chrome[200],
                opacity: selected ? 1 : 0,
              }}
            />
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}
