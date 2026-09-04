import { View } from 'react-native';
import { BackHeader, Button, Divider, MatchLabel, Screen, SectionHeader, Text, TextButton, TrustBadge } from '../components';
import {
  findDirectSwapMatches,
  findSwapChains,
  mySwapListings,
  swapListings,
  type SwapChainMatch,
  type SwapListing,
  type SwapMatch,
} from '../data/swaps';
import { rhythm, spacing } from '../theme';

export function SwapDetailScreen({
  id,
  onBack,
  onPropose,
  onEdit,
}: {
  id: string;
  onBack: () => void;
  onPropose: (conversationId: string) => void;
  onEdit?: () => void;
}) {
  const resolved = resolveSwapDetail(id);

  if (resolved.kind === 'chain') {
    const { chain } = resolved;
    return (
      <Screen footer={<Button label="Propose swap" onPress={() => onPropose(chain.loop[1].businessId)} />}>
        <BackHeader onBack={onBack} />
        <View style={{ gap: spacing[3], paddingTop: spacing[2] }}>
          <Text variant="micro" tone="chrome">3-way swap chain</Text>
          <Text variant="heading1">A 3-way loop, no cash involved</Text>
          <MatchLabel quality={chain.quality} />
        </View>

        <Divider tone="chrome" style={{ marginTop: rhythm.sectionToSection }} />

        <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
          <SectionHeader title="The loop" />
          {chain.loop.map((listing, index) => {
            const next = chain.loop[(index + 1) % chain.loop.length];
            return (
              <View key={listing.id} style={{ gap: spacing[1] }}>
                <Text variant="labelLarge">{listing.business}</Text>
                <Text variant="body" tone="secondary">
                  gives {listing.offering.title.toLowerCase()} to {next.business}
                </Text>
                <TrustBadge signal={listing.businessTrust} />
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Why this works" />
          {chain.reasons.map((reason) => (
            <Text key={reason} variant="body" tone="secondary">✓ {reason}</Text>
          ))}
        </View>
      </Screen>
    );
  }

  if (resolved.kind === 'match') {
    const { match } = resolved;
    return (
      <Screen footer={<Button label="Propose swap" onPress={() => onPropose(match.theirs.businessId)} />}>
        <BackHeader onBack={onBack} />
        <View style={{ gap: spacing[3], paddingTop: spacing[2] }}>
          <Text variant="micro" tone="chrome">Direct swap</Text>
          <Text variant="heading1">{match.theirs.business}</Text>
          <MatchLabel quality={match.quality} />
        </View>

        <Divider tone="chrome" style={{ marginTop: rhythm.sectionToSection }} />

        <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
          <SectionHeader title="The exchange" />
          <Text variant="body">You give: {match.mine.offering.title}</Text>
          <Text variant="body">You get: {match.theirs.offering.title}</Text>
        </View>

        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Why this works" />
          {match.reasons.map((reason) => (
            <Text key={reason} variant="body" tone="secondary">✓ {reason}</Text>
          ))}
        </View>

        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="About" />
          <TrustBadge signal={match.theirs.businessTrust} detail={match.theirs.businessCity} />
        </View>
      </Screen>
    );
  }

  const { listing } = resolved;
  const isMine = listing.businessId === 'me';

  return (
    <Screen
      footer={
        isMine ? (
          <Button label="Edit listing" variant="secondary" onPress={onEdit} />
        ) : (
          <Button label="Propose swap" onPress={() => onPropose(listing.businessId)} />
        )
      }
    >
      <BackHeader onBack={onBack} action={isMine && onEdit ? <TextButton label="Edit" onPress={onEdit} /> : undefined} />
      <View style={{ gap: spacing[3], paddingTop: spacing[2] }}>
        <Text variant="micro" tone="chrome">Swap listing</Text>
        <Text variant="heading1">{listing.offering.title}</Text>
        <Text variant="body" tone="secondary">{listing.offering.description}</Text>
      </View>

      <Divider tone="chrome" style={{ marginTop: rhythm.sectionToSection }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Seeking in return" />
        <Text variant="heading3">{listing.seeking.title}</Text>
        <Text variant="body" tone="secondary">{listing.seeking.description}</Text>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={isMine ? 'Status' : 'Posted by'} />
        {!isMine ? <Text variant="labelLarge">{listing.business}</Text> : null}
        <TrustBadge signal={listing.businessTrust} detail={listing.businessCity} />
        <Text variant="bodySmall" tone="tertiary">
          {listing.status === 'draft' ? 'Draft — not published' : `Expires in ${listing.expiresIn}`}
        </Text>
      </View>
    </Screen>
  );
}

type Resolved =
  | { kind: 'match'; match: SwapMatch }
  | { kind: 'chain'; chain: SwapChainMatch }
  | { kind: 'listing'; listing: SwapListing };

function resolveSwapDetail(id: string): Resolved {
  if (id.startsWith('match:')) {
    const match = findDirectSwapMatches(mySwapListings, swapListings).find((item) => item.id === id);
    if (match) return { kind: 'match', match };
  }
  if (id.startsWith('chain:')) {
    const chain = findSwapChains(mySwapListings, swapListings).find((item) => item.id === id);
    if (chain) return { kind: 'chain', chain };
  }
  const listing = swapListings.find((item) => item.id === id) ?? swapListings[0];
  return { kind: 'listing', listing };
}
