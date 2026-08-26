import { View } from 'react-native';
import { spacing } from '../theme';
import { Text } from './Text';
import { TextButton } from './Button';

/** Editorial section opener: a micro label, an optional quiet action. */
export function SectionHeader({
  title,
  action,
  onAction,
  supporting,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  supporting?: string;
}) {
  return (
    <View style={{ gap: spacing[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="micro" tone="tertiary">
          {title}
        </Text>
        {action ? <TextButton label={action} onPress={onAction} /> : null}
      </View>
      {supporting ? (
        <Text variant="bodySmall" tone="secondary">
          {supporting}
        </Text>
      ) : null}
    </View>
  );
}
