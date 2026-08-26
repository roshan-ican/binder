import { View } from 'react-native';
import { spacing } from '../theme';
import { Text } from './Text';

/** Compact, scannable counters. Never a vanity metric. */
export function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={{ gap: spacing[1] }}>
      <Text variant="heading3">{value}</Text>
      <Text variant="micro" tone="tertiary">
        {label}
      </Text>
    </View>
  );
}

export function MetricRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: spacing[8] }}>{children}</View>;
}
