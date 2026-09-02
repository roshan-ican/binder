import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, pagePadding, size, spacing } from '../theme';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type Density = 'default' | 'dense' | 'hero';

/**
 * Standard screen anatomy: safe area, heading, content, bottom safe spacing.
 * Sticky UI is reserved for search, filters and a CTA during form completion.
 */
export function Screen({
  children,
  density = 'default',
  scroll = true,
  footer,
  style,
}: {
  children: React.ReactNode;
  density?: Density;
  scroll?: boolean;
  footer?: React.ReactNode;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const padding = pagePadding[density];

  const content = (
    <View style={[{ paddingHorizontal: padding, flexGrow: 1 }, !scroll && { flex: 1 }, style]}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing[16] + insets.bottom }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: padding,
            paddingTop: spacing[3],
            paddingBottom: spacing[3],
            borderTopWidth: size.hairline,
            borderTopColor: colors.border.subtle,
            backgroundColor: colors.bg.primary,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/** Screen title with the optional supporting sentence underneath. */
export function ScreenHeading({ title, supporting }: { title: string; supporting?: string }) {
  return (
    <View style={{ paddingTop: spacing[4], gap: spacing[2] }}>
      <Text variant="heading1" accessibilityRole="header">
        {title}
      </Text>
      {supporting ? (
        <Text variant="body" tone="secondary">
          {supporting}
        </Text>
      ) : null}
    </View>
  );
}

export function BackHeader({ title, onBack, action }: { title?: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: -spacing[3],
        paddingVertical: spacing[2],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], flex: 1 }}>
        <IconButton label="Go back" onPress={onBack} icon={<Icon name="arrowLeft" color={colors.text.primary} />} />
        {title ? (
          <Text variant="labelLarge" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
