import { View } from 'react-native';
import { colors, radius, size, spacing } from '../theme';
import type { Enquiry } from '../data/mock';
import { Button } from './Button';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { MatchLabel } from './MatchLabel';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

/**
 * Supply-side retention. The card occupies most of the screen and leads with
 * what is needed, not who is asking. Buttons always exist — the swipe gesture
 * is convenience, never the only way through.
 */
export function OpportunityCard({
  enquiry,
  onPass,
  onInterested,
  onExpand,
}: {
  enquiry: Enquiry;
  onPass: () => void;
  onInterested: () => void;
  onExpand?: () => void;
}) {
  const [quantity, ...unitWords] = enquiry.title.split(' ');

  return (
    <View style={{ flex: 1, gap: spacing[4] }}>
      <View
        style={{
          flex: 1,
          borderRadius: radius.md,
          borderWidth: size.hairline,
          borderColor: colors.border.default,
          backgroundColor: colors.bg.raised,
          padding: spacing[6],
        }}
      >
        {enquiry.match ? <MatchLabel quality={enquiry.match} /> : null}

        <View style={{ marginTop: spacing[6] }}>
          <Text variant="numberHero">{quantity}</Text>
          <Text variant="heading2" style={{ marginTop: spacing[1] }}>
            {unitWords.join(' ').toUpperCase()}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[5] }}>
          <Icon name="mapPin" size={size.iconSm} color={colors.text.tertiary} />
          <Text variant="body" tone="secondary">
            {enquiry.location}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing[8], marginTop: spacing[5] }}>
          <View style={{ gap: spacing[1] }}>
            <Text variant="micro" tone="tertiary">
              Needed by
            </Text>
            <Text variant="labelLarge">{enquiry.neededBy}</Text>
          </View>
          <View style={{ gap: spacing[1] }}>
            <Text variant="micro" tone="tertiary">
              Budget
            </Text>
            <Text variant="labelLarge">{enquiry.budget}</Text>
          </View>
        </View>

        <Divider style={{ marginVertical: spacing[5] }} />

        <Text variant="micro" tone="tertiary">
          Why this fits
        </Text>
        <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
          {enquiry.whyItFits.map((reason) => (
            <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <Icon name="check" size={size.iconSm} color={colors.chrome[300]} />
              <Text variant="bodySmall" tone="secondary">
                {reason}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 'auto', gap: spacing[2] }}>
          <Text variant="label" tone="secondary">
            {enquiry.buyer.toUpperCase()}
          </Text>
          <TrustBadge signal={enquiry.buyerTrust} detail="buyer" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Button label="Pass" variant="secondary" onPress={onPass} fullWidth={false} style={{ flex: 1 }} />
        <Button label="Interested" onPress={onInterested} fullWidth={false} style={{ flex: 2 }} />
      </View>

      {onExpand ? (
        <Text
          variant="bodySmall"
          tone="tertiary"
          onPress={onExpand}
          accessibilityRole="button"
          style={{ textAlign: 'center' }}
        >
          View full requirement
        </Text>
      ) : null}
    </View>
  );
}
