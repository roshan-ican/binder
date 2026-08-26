import { Pressable, View } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type TabKey = 'discover' | 'enquiries' | 'inbox' | 'profile';

const tabs: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'discover', label: 'Discover', icon: 'search' },
  { key: 'enquiries', label: 'Enquiries', icon: 'document' },
  { key: 'inbox', label: 'Inbox', icon: 'message' },
  { key: 'profile', label: 'Profile', icon: 'building' },
];

/** Four tabs in V1. No floating centre button. */
export function BottomTabs({
  active,
  onChange,
  bottomInset = 0,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  bottomInset?: number;
}) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        borderTopWidth: size.hairline,
        borderTopColor: colors.border.subtle,
        backgroundColor: colors.bg.primary,
        paddingTop: spacing[2],
        paddingBottom: spacing[2] + bottomInset,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            style={{ flex: 1, alignItems: 'center', gap: spacing[1], minHeight: size.tap, justifyContent: 'center' }}
          >
            <Icon
              name={tab.icon}
              size={size.iconNav}
              color={isActive ? colors.text.primary : colors.text.tertiary}
            />
            <Text variant="micro" tone={isActive ? 'primary' : 'tertiary'}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Editorial segmented control — a chrome underline marks the active item. */
export function TopTabs<T extends string>({
  items,
  active,
  onChange,
}: {
  items: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: spacing[6] }}>
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
            style={{ paddingVertical: spacing[3], gap: spacing[2] }}
          >
            <Text variant="labelLarge" tone={isActive ? 'primary' : 'tertiary'}>
              {item.label}
            </Text>
            <View
              style={{
                height: 2,
                borderRadius: radius.xs,
                backgroundColor: isActive ? colors.chrome[200] : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
