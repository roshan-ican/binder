import { View } from 'react-native';
import { spacing } from '../theme';
import type { Enquiry } from '../data/mock';
import { Card } from './Card';
import { Divider } from './Divider';
import { MatchLabel } from './MatchLabel';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

/**
 * The demand dominates. The buyer's name is deliberately quieter than the
 * requirement itself.
 */
export function EnquiryCard({ enquiry, onPress }: { enquiry: Enquiry; onPress?: () => void }) {
  return (
    <Card onPress={onPress} accessibilityLabel={enquiry.title}>
      <Text variant="heading3">{enquiry.title.toUpperCase()}</Text>

      <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing[2] }}>
        {enquiry.location} · Needed by {enquiry.neededBy}
      </Text>

      <View style={{ marginTop: spacing[4], gap: spacing[1] }}>
        <Text variant="labelLarge">{enquiry.budget}</Text>
        <Text variant="bodySmall" tone="tertiary">
          {enquiry.fitNote}
        </Text>
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: spacing[1] }}>
          <Text variant="label" tone="secondary">
            {enquiry.buyer}
          </Text>
          <TrustBadge signal={enquiry.buyerTrust} />
        </View>
        {enquiry.match ? <MatchLabel quality={enquiry.match} /> : null}
      </View>
    </Card>
  );
}
