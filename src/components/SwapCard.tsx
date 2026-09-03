import { View } from 'react-native';
import { pairLabel, type SwapSummary } from '../data/swapMatching';
import { colors, radius, size, spacing } from '../theme';
import { Card } from './Card';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { MatchLabel } from './MatchLabel';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

/**
 * A swap is a loop, so the card leads with the loop: who is in it, what leaves
 * your business and what comes back. The reasons sit underneath, as everywhere
 * else on Binder — a label and its explanation, never a score.
 */
export function SwapCard({ summary, onPress }: { summary: SwapSummary; onPress?: () => void }) {
  const isChain = summary.kind === 'chain';
  const [counterpart] = summary.others;

  return (
    <Card onPress={onPress} accessibilityLabel={`${pairLabel(summary.legs)} with ${names(summary)}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }}>
        <Text variant="micro" tone="chrome" style={{ flex: 1 }}>
          {isChain ? `${pairLabel(summary.legs)} · 3-WAY CHAIN` : pairLabel(summary.legs)}
        </Text>
        <MatchLabel quality={summary.match} />
      </View>

      {isChain ? (
        <View style={{ marginTop: spacing[4], gap: spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            {summary.legs.map((leg, index) => (
              <View key={leg.from.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                <Logo name={leg.from.name} size="sm" />
                {index < summary.legs.length - 1 ? (
                  <Icon name="arrowRight" size={size.iconSm} color={colors.text.tertiary} />
                ) : null}
              </View>
            ))}
            <Icon name="arrowRight" size={size.iconSm} color={colors.text.tertiary} />
            <Logo name={summary.legs[0].from.name} size="sm" />
          </View>
          <Text variant="heading3">{names(summary)}</Text>
        </View>
      ) : counterpart ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[4] }}>
          <Logo name={counterpart.name} size="md" />
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text variant="heading3">{counterpart.name}</Text>
            <Text variant="bodySmall" tone="secondary">
              {counterpart.role} · {counterpart.city}
            </Text>
          </View>
        </View>
      ) : null}

      <Divider style={{ marginVertical: spacing[4] }} />

      <View style={{ gap: spacing[3] }}>
        <ExchangeRow direction="give" label="You give" value={summary.youGive} />
        <ExchangeRow direction="get" label="You get" value={summary.youGet} />
      </View>

      <View style={{ marginTop: spacing[4], gap: spacing[2] }}>
        {summary.reasons.slice(0, 2).map((reason) => (
          <Text key={reason} variant="bodySmall" tone="tertiary">
            ✓ {reason}
          </Text>
        ))}
      </View>

      {!isChain && counterpart?.trust ? (
        <View style={{ marginTop: spacing[4] }}>
          <TrustBadge signal={counterpart.trust} />
        </View>
      ) : null}
    </Card>
  );
}

function ExchangeRow({ direction, label, value }: { direction: 'give' | 'get'; label: string; value: string }) {
  const giving = direction === 'give';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}>
      <View
        style={{
          width: size.chip,
          height: size.chip,
          borderRadius: radius.full,
          borderWidth: size.hairline,
          borderColor: giving ? colors.border.default : colors.chrome[400],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={giving ? 'arrowRight' : 'arrowLeft'}
          size={size.iconSm}
          color={giving ? colors.text.tertiary : colors.chrome[200]}
        />
      </View>
      <View style={{ flex: 1, gap: spacing[1] }}>
        <Text variant="micro" tone="tertiary">{label}</Text>
        <Text variant="body" tone={giving ? 'secondary' : 'primary'}>{value}</Text>
      </View>
    </View>
  );
}

function names(summary: SwapSummary) {
  // A chain flows one way round the loop; a direct swap goes both ways.
  return summary.others.map((party) => party.name).join(summary.kind === 'chain' ? ' → ' : ' ↔ ');
}
