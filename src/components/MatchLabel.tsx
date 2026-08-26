import { View } from 'react-native';
import { colors, size, spacing } from '../theme';
import { Text } from './Text';

/**
 * Match quality is a label, never a percentage — we only claim what the
 * ranking can actually explain. No score rings, no "94%".
 */
export type MatchQuality = 'strong' | 'good' | 'potential';

const copy: Record<MatchQuality, string> = {
  strong: 'Strong match',
  good: 'Good fit',
  potential: 'Potential fit',
};

export function MatchLabel({ quality }: { quality: MatchQuality }) {
  const isStrong = quality === 'strong';

  return (
    <View
      accessible
      accessibilityLabel={copy[quality]}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}
    >
      {/* A small silver mark, not a coloured dot — state is never colour-only,
          the label always says it too. */}
      <View
        style={{
          width: isStrong ? 6 : size.hairline * 6,
          height: 6,
          borderRadius: isStrong ? 3 : 0,
          backgroundColor: isStrong ? colors.chrome[100] : colors.chrome[500],
        }}
      />
      <Text variant="micro" tone={isStrong ? 'chrome' : 'tertiary'}>
        {copy[quality]}
      </Text>
    </View>
  );
}
