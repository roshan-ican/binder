import { View } from 'react-native';
import { colors, size, spacing } from '../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

/**
 * Three separate trust systems that must never merge into one generic
 * "trusted" badge, and never claim more than Binder can support.
 */
export type TrustSignal = 'documents' | 'pending' | 'verified' | 'proven';

const signals: Record<TrustSignal, { label: string; icon: IconName; color: string }> = {
  documents: { label: 'Documents provided', icon: 'document', color: colors.text.secondary },
  pending: { label: 'Verification pending', icon: 'document', color: colors.semantic.warning },
  verified: { label: 'Verified', icon: 'shield', color: colors.semantic.success },
  proven: { label: 'Proven', icon: 'star', color: colors.chrome[200] },
};

export function TrustBadge({ signal, detail }: { signal: TrustSignal; detail?: string }) {
  const { label, icon, color } = signals[signal];

  return (
    <View
      accessible
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}
    >
      <Icon name={icon} size={size.iconSm} color={color} />
      <Text variant="bodySmall" style={{ color }}>
        {label}
      </Text>
      {detail ? (
        <Text variant="bodySmall" tone="tertiary">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}
