import { View } from 'react-native';
import { BackHeader, Button, Screen, ScreenHeading, Text, TextButton } from '../components';
import { spacing } from '../theme';

/** Email sign-in ends here: the link in the inbox does the verifying, not a code. */
export function MagicLinkSentScreen({ email, onBack, onResend, resendBusy, resent, error }: {
  email: string;
  onBack: () => void;
  onResend: () => void;
  resendBusy?: boolean;
  resent?: boolean;
  error?: string | null;
}) {
  return (
    <Screen density="hero" scroll={false} footer={<Button label="Use a different email" variant="secondary" onPress={onBack} />}>
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
        <ScreenHeading title="Check your email" supporting={`We sent a sign-in link to ${email}. Open it on this device to continue.`} />
        <Text variant="bodySmall" tone="tertiary">The link expires in an hour and can only be used once. If it does not arrive, check your spam folder.</Text>
        {error ? <Text variant="bodySmall" tone="danger">{error}</Text> : null}
        <TextButton label={resendBusy ? 'Sending...' : resent ? 'Link resent' : 'Resend link'} onPress={onResend} />
      </View>
    </Screen>
  );
}
