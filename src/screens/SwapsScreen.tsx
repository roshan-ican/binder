import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Divider, EmptyState, Metric, MetricRow, Screen, ScreenHeading, SwapCard, SwapChainCard, Text, TopTabs } from '../components';
import { findDirectSwapMatches, findSwapChains, mySwapListings, swapListings } from '../data/swaps';
import { rhythm, spacing } from '../theme';

type MainTab = 'matches' | 'mine';
type StatusTab = 'active' | 'draft' | 'closed' | 'expired';

export function SwapsScreen({
  onOpenSwap,
  onCreateSwap,
}: {
  onOpenSwap: (id: string) => void;
  onCreateSwap?: () => void;
}) {
  const [tab, setTab] = useState<MainTab>('matches');
  const [statusTab, setStatusTab] = useState<StatusTab>('active');

  const directMatches = useMemo(() => findDirectSwapMatches(mySwapListings, swapListings), []);
  const chains = useMemo(() => findSwapChains(mySwapListings, swapListings), []);
  const myListings = mySwapListings.filter((listing) => listing.status === statusTab);

  return (
    <Screen>
      <ScreenHeading title="Swaps" supporting="Trade what you have for what you need — no cash required." />

      <View style={{ marginTop: spacing[4] }}>
        <TopTabs
          items={[
            { key: 'matches', label: 'Matches' },
            { key: 'mine', label: 'My listings' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'matches' ? (
        <View style={{ marginTop: rhythm.cardToCard, gap: spacing[6] }}>
          <View style={{ gap: spacing[3] }}>
            <Text variant="micro" tone="tertiary">Direct matches</Text>
            {directMatches.length === 0 ? (
              <EmptyState
                title="No direct matches yet."
                body="Post what your business has and needs — Binder will look for a business whose needs mirror yours."
              />
            ) : (
              directMatches.map((match) => (
                <SwapCard key={match.id} kind="match" match={match} onPress={() => onOpenSwap(match.id)} />
              ))
            )}
          </View>

          <View style={{ gap: spacing[3] }}>
            <Text variant="micro" tone="tertiary">Swap chains</Text>
            {chains.length === 0 ? (
              <EmptyState
                title="No swap chains yet."
                body="When three businesses' offers and needs form a loop, Binder will surface it here."
              />
            ) : (
              chains.map((chain) => (
                <SwapChainCard key={chain.id} chain={chain} onPress={() => onOpenSwap(chain.id)} />
              ))
            )}
          </View>
        </View>
      ) : (
        <View style={{ marginTop: rhythm.cardToCard, gap: spacing[3] }}>
          <TopTabs
            items={[
              { key: 'active', label: 'Active' },
              { key: 'draft', label: 'Drafts' },
              { key: 'closed', label: 'Closed' },
              { key: 'expired', label: 'Expired' },
            ]}
            active={statusTab}
            onChange={setStatusTab}
          />

          <View style={{ marginTop: rhythm.cardToCard, gap: spacing[3] }}>
            {myListings.map((listing) => (
              <Card key={listing.id} onPress={() => onOpenSwap(listing.id)} accessibilityLabel={listing.offering.title}>
                <Text variant="heading3">{listing.offering.title}</Text>
                <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing[1] }}>
                  Seeking: {listing.seeking.title}
                </Text>
                <Divider style={{ marginVertical: spacing[4] }} />
                <MetricRow>
                  <Metric value={listing.relevant} label="Relevant" />
                  <Metric value={listing.interested} label="Interested" />
                  <Metric value={listing.connected} label="Connected" />
                </MetricRow>
                <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[4] }}>
                  {listing.status === 'draft' ? 'Draft — not published' : `Expires in ${listing.expiresIn}`}
                </Text>
              </Card>
            ))}

            {myListings.length === 0 ? (
              <EmptyState
                title="No swap listings here yet."
                body="Post what your business has and what it needs in return."
                actionLabel="New swap listing"
                onAction={onCreateSwap}
              />
            ) : null}
          </View>
        </View>
      )}

      <Button label="New swap listing" onPress={onCreateSwap} style={{ marginTop: rhythm.sectionToSection }} />
    </Screen>
  );
}
