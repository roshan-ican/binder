import { View } from 'react-native';
import type { UserRole } from '../data/mock';
import { colors, radius, size, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';
import { ChromeSurface } from './ChromeSurface';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type TabKey = 'match' | 'discover' | 'enquiries' | 'swaps' | 'inbox' | 'profile';

const businessTabs: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'match', label: 'Match', icon: 'check' },
  { key: 'discover', label: 'Discover', icon: 'search' },
  { key: 'enquiries', label: 'Enquiries', icon: 'document' },
  { key: 'swaps', label: 'Swaps', icon: 'swap' },
  { key: 'inbox', label: 'Inbox', icon: 'message' },
  { key: 'profile', label: 'Profile', icon: 'building' },
];

// Job-seeker tab set disabled — Binder is business-only for now.
// const jobSeekerTabs: { key: TabKey; label: string; icon: IconName }[] = [
//   { key: 'match', label: 'Match', icon: 'check' },
//   { key: 'discover', label: 'Jobs', icon: 'search' },
//   { key: 'enquiries', label: 'Applied', icon: 'document' },
//   { key: 'inbox', label: 'Inbox', icon: 'message' },
//   { key: 'profile', label: 'Profile', icon: 'users' },
// ];

/** Role-aware primary tabs. No floating centre button. */
export function BottomTabs({
  role = 'business',
  active,
  onChange,
  bottomInset = 0,
}: {
  role?: UserRole;
  active: TabKey;
  onChange: (key: TabKey) => void;
  bottomInset?: number;
}) {
  // Job-seeker tab set disabled — Binder is business-only for now.
  // const tabs = role === 'job-seeker' ? jobSeekerTabs : businessTabs;
  const tabs = businessTabs;

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        borderTopWidth: size.hairline,
        borderTopColor: '#DED9D3',
        backgroundColor: '#D6D1CB',
        paddingTop: spacing[2],
        paddingBottom: spacing[2] + bottomInset,
        paddingHorizontal: spacing[2],
        overflow: 'hidden',
      }}
    >
      <ChromeSurface borderRadius={0} intensity="soft" animated={false} />
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <AnimatedPressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            pressedScale={0.94}
            wrapperStyle={{ flex: 1 }}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: spacing[1],
              minHeight: size.tap,
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Icon
              name={tab.icon}
              size={size.iconNav}
              color={isActive ? colors.text.inverse : '#4F4D4A'}
            />
            <Text variant="micro" tone="inverse" style={{ opacity: isActive ? 1 : 0.7 }}>
              {tab.label}
            </Text>
          </AnimatedPressable>
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
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        borderRadius: radius.full,
        borderWidth: size.hairline,
        borderColor: colors.border.strong,
        backgroundColor: colors.surface.inverse,
        overflow: 'hidden',
        alignSelf: 'stretch',
        width: '100%',
      }}
    >
      <ChromeSurface borderRadius={radius.full} intensity="soft" />
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <AnimatedPressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
            pressedScale={0.97}
            style={{
              minHeight: size.tap,
              minWidth: 0,
              paddingHorizontal: spacing[2],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? colors.chrome[100] : 'transparent',
              borderRightWidth: item === items[items.length - 1] ? 0 : size.hairline,
              borderRightColor: 'rgba(35,33,31,0.18)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Text variant="labelLarge" tone="inverse" style={{ opacity: isActive ? 1 : 0.72 }}>
              {item.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
