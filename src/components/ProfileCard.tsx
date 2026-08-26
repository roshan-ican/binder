import { View } from 'react-native';
import { colors, spacing } from '../theme';
import type { Business } from '../data/mock';
import { Card } from './Card';
import { Divider } from './Divider';
import { Logo } from './Logo';
import { MatchLabel } from './MatchLabel';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

/** An entry in a premium directory — not a social card. */
export function ProfileCard({ business, onPress }: { business: Business; onPress?: () => void }) {
  return (
    <Card onPress={onPress} accessibilityLabel={`${business.name}, ${business.role} in ${business.city}`}>
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Logo name={business.name} size="md" />
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="labelLarge" numberOfLines={1}>
            {business.name}
          </Text>
          <Text variant="bodySmall" tone="secondary">
            {business.role} · {business.city}
          </Text>
          {business.trust ? <TrustBadge signal={business.trust} /> : null}
        </View>
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <Text variant="bodySmall" tone="secondary">
        {business.capability}
      </Text>
      <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[1] }}>
        {business.activity}
      </Text>

      {business.match ? (
        <View style={{ marginTop: spacing[4] }}>
          <MatchLabel quality={business.match} />
        </View>
      ) : null}
    </Card>
  );
}

/** Compact row used inside lists of interested businesses. */
export function ProfileRow({ business, onPress }: { business: Business; onPress?: () => void }) {
  return (
    <Card onPress={onPress} accessibilityLabel={business.name} style={{ backgroundColor: colors.bg.secondary }}>
      <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
        <Logo name={business.name} size="sm" />
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="labelLarge" numberOfLines={1}>
            {business.name}
          </Text>
          <Text variant="bodySmall" tone="tertiary" numberOfLines={1}>
            {business.capability}
          </Text>
        </View>
        {business.match ? <MatchLabel quality={business.match} /> : null}
      </View>
    </Card>
  );
}
