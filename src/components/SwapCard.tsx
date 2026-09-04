import { View } from 'react-native';
import type { SwapChainMatch, SwapListing, SwapMatch } from '../data/swaps';
import { spacing } from '../theme';
import { Card } from './Card';
import { Divider } from './Divider';
import { MatchLabel } from './MatchLabel';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

export type SwapCardProps =
  | { kind: 'listing'; listing: SwapListing; onPress?: () => void }
  | { kind: 'match'; match: SwapMatch; onPress?: () => void };

/**
 * Two shapes, one card: a plain listing (browsing what another business has
 * posted) or a computed direct match (mine + theirs, with why-this-works
 * reasons). No fake percentages — quality comes from MatchLabel only.
 */
export function SwapCard(props: SwapCardProps) {
  if (props.kind === 'listing') {
    const { listing, onPress } = props;
    return (
      <Card onPress={onPress} accessibilityLabel={listing.offering.title}>
        <Text variant="heading3">{listing.offering.title}</Text>
        <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing[2] }}>
          Seeking: {listing.seeking.title}
        </Text>

        <Divider style={{ marginVertical: spacing[4] }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: spacing[1] }}>
            <Text variant="label" tone="secondary">{listing.business}</Text>
            <TrustBadge signal={listing.businessTrust} />
          </View>
        </View>
      </Card>
    );
  }

  const { match, onPress } = props;
  return (
    <Card onPress={onPress} accessibilityLabel={`Swap match with ${match.theirs.business}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[3] }}>
        <Text variant="micro" tone="chrome">Direct swap</Text>
        <MatchLabel quality={match.quality} />
      </View>

      <View style={{ marginTop: spacing[3], gap: spacing[1] }}>
        <Text variant="heading3">You give {match.mine.offering.title}</Text>
        <Text variant="body" tone="secondary">You get {match.theirs.offering.title}</Text>
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <Text variant="micro" tone="tertiary">Why this works</Text>
      <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
        {match.reasons.map((reason) => (
          <Text key={reason} variant="body" tone="secondary">✓ {reason}</Text>
        ))}
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <View style={{ gap: spacing[1] }}>
        <Text variant="label" tone="secondary">{match.theirs.business}</Text>
        <TrustBadge signal={match.theirs.businessTrust} />
      </View>
    </Card>
  );
}

/** A 3-way circular chain: each business gives to the next, no cash involved. */
export function SwapChainCard({ chain, onPress }: { chain: SwapChainMatch; onPress?: () => void }) {
  return (
    <Card onPress={onPress} accessibilityLabel="3-way swap chain">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[3] }}>
        <Text variant="micro" tone="chrome">3-way swap chain</Text>
        <MatchLabel quality={chain.quality} />
      </View>

      <View style={{ marginTop: spacing[3], gap: spacing[3] }}>
        {chain.loop.map((listing, index) => {
          const next = chain.loop[(index + 1) % chain.loop.length];
          return (
            <View key={listing.id} style={{ gap: spacing[1] }}>
              <Text variant="labelLarge">{listing.business}</Text>
              <Text variant="bodySmall" tone="secondary">
                gives {listing.offering.title.toLowerCase()} to {next.business}
              </Text>
            </View>
          );
        })}
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <Text variant="micro" tone="tertiary">Why this works</Text>
      <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
        {chain.reasons.map((reason) => (
          <Text key={reason} variant="body" tone="secondary">✓ {reason}</Text>
        ))}
      </View>
    </Card>
  );
}
