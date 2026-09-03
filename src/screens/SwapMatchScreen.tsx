import { View } from 'react-native';
import {
  BackHeader,
  Button,
  Divider,
  Icon,
  Logo,
  MatchLabel,
  Screen,
  SectionHeader,
  Text,
  TextButton,
  TrustBadge,
} from '../components';
import { me, type BusinessProfileData } from '../data/mock';
import { describeSwap, findSwapMatch, pairLabel, swapKindLabel, type SwapLegView } from '../data/swapMatching';
import { colors, rhythm, size, spacing } from '../theme';

/**
 * One swap in full. The loop is the story, so it is drawn leg by leg: who gives
 * what to whom, all the way back round to you.
 */
export function SwapMatchScreen({
  matchId,
  profile,
  onBack,
  onOpenBusiness,
  onPropose,
}: {
  matchId: string;
  profile: BusinessProfileData | null;
  onBack: () => void;
  onOpenBusiness: (id: string) => void;
  /** Receives the business the proposal goes to — the first hop of the loop. */
  onPropose: (partyId: string) => void;
}) {
  const match = findSwapMatch(matchId, profile);
  const summary = match ? describeSwap(match, profile) : undefined;

  if (!summary) {
    return (
      <Screen>
        <BackHeader title="Swap" onBack={onBack} />
        <View style={{ paddingTop: spacing[12], gap: spacing[3] }}>
          <Text variant="heading3">This swap is no longer available.</Text>
          <Text variant="body" tone="secondary">
            It may have been withdrawn, or your swap profile changed. Go back to see current swaps.
          </Text>
        </View>
      </Screen>
    );
  }

  const isChain = summary.kind === 'chain';

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <Button label="Save" variant="secondary" fullWidth={false} style={{ flex: 1 }} />
          <Button
            label="Propose swap"
            onPress={() => onPropose(summary.others[0]?.id ?? '')}
            fullWidth={false}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <BackHeader title={isChain ? 'Swap chain' : 'Swap'} onBack={onBack} />

      <View style={{ gap: spacing[3], paddingTop: spacing[2] }}>
        <Text variant="micro" tone="chrome">
          {isChain ? `${pairLabel(summary.legs)} · 3-WAY CHAIN` : pairLabel(summary.legs)}
        </Text>
        <Text variant="heading1" accessibilityRole="header">
          {summary.others.map((party) => party.name).join(isChain ? ' → ' : ' ↔ ')}
        </Text>
        <MatchLabel quality={summary.match} />
      </View>

      <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />

      <View style={{ marginTop: spacing[6], gap: spacing[4] }}>
        <SectionHeader
          title="The exchange"
          supporting={
            isChain
              ? 'Value moves round the loop. Nobody has to pay cash.'
              : 'Both sides give something the other needs.'
          }
        />
        {summary.legs.map((leg, index) => (
          <LegRow key={`${leg.from.id}-${leg.to.id}`} leg={leg} step={index + 1} />
        ))}
      </View>

      {summary.youGiveValue || summary.youGetValue ? (
        <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
          <SectionHeader
            title="Indicative value"
            supporting="Each side states its own. Binder does not price a swap, and an unequal swap is still a swap if both sides want it."
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[4] }}>
            <View style={{ flex: 1, gap: spacing[1] }}>
              <Text variant="micro" tone="tertiary">You give</Text>
              <Text variant="body" tone="secondary">{summary.youGiveValue ?? 'Not stated'}</Text>
            </View>
            <View style={{ flex: 1, gap: spacing[1] }}>
              <Text variant="micro" tone="tertiary">You get</Text>
              <Text variant="body">{summary.youGetValue ?? 'Not stated'}</Text>
            </View>
          </View>
          {summary.balanceNote ? (
            <Text variant="bodySmall" tone="tertiary">{summary.balanceNote}</Text>
          ) : null}
        </View>
      ) : null}

      <Divider style={{ marginTop: spacing[6] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Why this works" />
        {summary.reasons.map((reason) => (
          <View key={reason} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}>
            <Icon name="check" size={size.iconSm} color={colors.chrome[300]} />
            <Text variant="body" tone="secondary" style={{ flex: 1 }}>
              {reason}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[4] }}>
        <SectionHeader title={isChain ? 'The three businesses' : 'Who you would swap with'} />
        {summary.others.map((party) => (
          <View key={party.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
            <Logo name={party.name} size="md" />
            <View style={{ flex: 1, gap: spacing[1] }}>
              <Text variant="labelLarge">{party.name}</Text>
              <Text variant="bodySmall" tone="secondary">
                {party.role} · {party.city}
              </Text>
              {party.trust ? <TrustBadge signal={party.trust} /> : null}
            </View>
            <TextButton label="View" onPress={() => onOpenBusiness(party.id)} />
          </View>
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="How a swap settles" />
        <Text variant="body" tone="secondary">
          Binder does not price or hold anything. Proposing opens a conversation with{' '}
          {isChain ? 'all three businesses' : summary.others[0]?.name ?? 'them'}, where the terms are agreed
          between you.
        </Text>
      </View>
    </Screen>
  );
}

function LegRow({ leg, step }: { leg: SwapLegView; step: number }) {
  const fromYou = leg.from.id === me.id;
  const toYou = leg.to.id === me.id;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}>
      <Text variant="micro" tone="tertiary" style={{ paddingTop: spacing[1], minWidth: spacing[4] }}>
        {step}
      </Text>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text variant="labelLarge" tone={toYou ? 'chrome' : 'primary'}>
          {fromYou ? 'You' : leg.from.name} → {toYou ? 'you' : leg.to.name}
        </Text>
        <Text variant="body" tone="secondary">
          {leg.gives}
        </Text>
        <Text variant="micro" tone="tertiary">
          {swapKindLabel[leg.kind]}
          {leg.indicativeValue ? ` · ${leg.indicativeValue}` : ''}
        </Text>
      </View>
    </View>
  );
}
