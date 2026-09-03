import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Icon,
  SectionHeader,
  SwapCard,
  Text,
  TextButton,
  ToggleRow,
} from '../components';
import {
  me,
  mySwapListings,
  swapProposals,
  type BusinessProfileData,
  type SwapKind,
} from '../data/mock';
import { describeSwaps, findDirectSwaps, findSwapChains } from '../data/swapMatching';
import { colors, pagePadding, rhythm, size, spacing } from '../theme';

type KindFilter = 'all' | SwapKind;

const kindFilters: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'service', label: 'Service' },
  { key: 'product', label: 'Product' },
  { key: 'value', label: 'Value' },
];

/**
 * The second mode of the Match tab. Where the deck answers "who can sell me
 * this", SWAP answers "who can I exchange value with" — including the loops a
 * one-to-one swap cannot reach.
 */
export function SwapScreen({
  profile,
  swapOpen,
  onSwapOpenChange,
  onOpenMatch,
  onCreateListing,
  onEditSwapProfile,
  onOpenConversation,
}: {
  profile: BusinessProfileData | null;
  swapOpen: boolean;
  onSwapOpenChange: (value: boolean) => void;
  onOpenMatch: (id: string) => void;
  onCreateListing: () => void;
  onEditSwapProfile: () => void;
  onOpenConversation: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<KindFilter>('all');

  const direct = useMemo(() => describeSwaps(findDirectSwaps(profile), profile), [profile]);
  const chains = useMemo(() => describeSwaps(findSwapChains(profile), profile), [profile]);

  const wants = profile?.swapWants ?? me.swapWants;
  const offers = profile?.swapOffers ?? me.swapOffers;
  const visibleDirect = direct.filter((item) => kind === 'all' || item.swapKind === kind);
  const visibleChains = chains.filter((item) => kind === 'all' || item.swapKind === kind);
  const total = direct.length + chains.length;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: pagePadding.default,
        paddingBottom: spacing[16] + insets.bottom,
      }}
    >
      <View style={{ paddingTop: spacing[4], gap: spacing[2] }}>
        <Text variant="micro" tone="chrome">Binder swaps</Text>
        <Text variant="heading1" accessibilityRole="header">
          {swapOpen
            ? `You have ${total} possible ${total === 1 ? 'swap' : 'swaps'} this week.`
            : 'You are closed to swaps.'}
        </Text>
        <Text variant="body" tone="secondary">
          Exchange services, products or exposure. No cash has to change hands.
        </Text>
      </View>

      <Card style={{ marginTop: rhythm.titleToContent, gap: spacing[3] }}>
        <ToggleRow
          label="Open to swaps"
          detail="Other businesses can see what you want and what you can offer."
          value={swapOpen}
          onChange={onSwapOpenChange}
        />
        <Divider />
        <View style={{ gap: spacing[3] }}>
          <SectionHeader title="You need" />
          <ChipRow labels={wants} empty="Nothing listed yet." />
        </View>
        <View style={{ gap: spacing[3] }}>
          <SectionHeader title="You can offer" />
          <ChipRow labels={offers} empty="Nothing listed yet." />
        </View>
        <TextButton label="Edit your swap profile" onPress={onEditSwapProfile} />
      </Card>

      {!swapOpen ? (
        <EmptyState
          title="Swaps are switched off."
          body="Turn swaps on and Binder will look for exchanges that fit what you need and what you can offer."
          actionLabel="Open to swaps"
          onAction={() => onSwapOpenChange(true)}
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: rhythm.sectionToSection }}>
            {kindFilters.map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                selected={kind === filter.key}
                onPress={() => setKind(filter.key)}
              />
            ))}
          </View>

          <View style={{ marginTop: rhythm.cardToCard, gap: spacing[3] }}>
            <SectionHeader
              title="Direct swaps"
              supporting="You want what they offer, and they want what you offer."
            />
            {visibleDirect.length ? (
              visibleDirect.map((summary) => (
                <SwapCard key={summary.id} summary={summary} onPress={() => onOpenMatch(summary.id)} />
              ))
            ) : (
              <EmptyState
                title="No direct swaps in this filter."
                body="Add more to what you can offer, or clear the filter to see every swap Binder found."
                actionLabel="Add something to swap"
                onAction={onCreateListing}
              />
            )}
          </View>

          {visibleChains.length ? (
            <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
              <SectionHeader
                title="Swap chains"
                supporting="Three businesses, no cash. Binder closes the loop a one-to-one swap cannot."
              />
              {visibleChains.map((summary) => (
                <SwapCard key={summary.id} summary={summary} onPress={() => onOpenMatch(summary.id)} />
              ))}
            </View>
          ) : null}
        </>
      )}

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="What you have on the table" action="Add" onAction={onCreateListing} />
        {mySwapListings.map((listing) => (
          <View
            key={listing.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[2] }}
          >
            <Icon name="package" size={size.iconSm} color={colors.text.tertiary} />
            <View style={{ flex: 1, gap: spacing[1] }}>
              <Text variant="body">{listing.title}</Text>
              <Text variant="bodySmall" tone="tertiary">
                {listing.category} · {listing.indicativeValue}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Your proposals" />
        {swapProposals.map((proposal) => (
          <Card
            key={proposal.id}
            onPress={() => onOpenConversation('swap-lens-forty-two')}
            accessibilityLabel={`${proposal.headline} with ${proposal.counterparties}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
              <View style={{ flex: 1, gap: spacing[1] }}>
                <Text variant="body">{proposal.headline}</Text>
                <Text variant="bodySmall" tone="tertiary">
                  {proposal.counterparties} · {statusLabel[proposal.status]} · {proposal.updated}
                </Text>
              </View>
              <Icon name="chevronRight" size={size.icon} color={colors.text.tertiary} />
            </View>
          </Card>
        ))}
      </View>

      <Button
        label="Add something to swap"
        variant="secondary"
        icon={<Icon name="plus" />}
        onPress={onCreateListing}
        style={{ marginTop: rhythm.sectionToSection }}
      />
    </ScrollView>
  );
}

const statusLabel: Record<'draft' | 'active' | 'closed' | 'expired', string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
  expired: 'Expired',
};

function ChipRow({ labels, empty }: { labels: string[]; empty: string }) {
  if (!labels.length) {
    return (
      <Text variant="bodySmall" tone="tertiary">
        {empty}
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
      {labels.map((label) => (
        <Chip key={label} label={label} />
      ))}
    </View>
  );
}
