import { View } from 'react-native';
import { Button, Screen, Text, TextButton } from '../components';
import { colors, spacing } from '../theme';

/**
 * Large negative space, one strong message, no carousel and no stock
 * photography. Calm. Serious. Fast.
 */
export function WelcomeScreen({ onContinue, onExplore }: { onContinue: () => void; onExplore: () => void }) {
  return (
    <Screen density="hero" scroll={false}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: spacing[8] }}>
        <View style={{ paddingTop: spacing[16], gap: spacing[6] }}>
          <Text variant="micro" style={{ color: colors.chrome[200] }}>
            Binder
          </Text>
          <Text variant="displayMedium">
            Find what your business needs.{'\n'}Meet businesses that need what you offer.
          </Text>
        </View>

        <View style={{ gap: spacing[3] }}>
          <Button label="Continue with Google" onPress={onContinue} />
          <Button label="Continue with phone" variant="secondary" onPress={onContinue} />
          <View style={{ alignItems: 'center', paddingTop: spacing[2] }}>
            <TextButton label="Look around first" onPress={onExplore} tone="secondary" />
          </View>
          <Text variant="bodySmall" tone="tertiary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
            By continuing, you agree to the terms and privacy policy.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
