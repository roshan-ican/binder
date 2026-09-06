import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Input, Screen, ScreenHeading, Text } from '../components';
import { spacing } from '../theme';

const PHONE_PATTERN = /^\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** First identity step for both buyers and sellers — same form either way. */
export function ContactScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (contact: { phone: string; email: string }) => void;
}) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const validPhone = PHONE_PATTERN.test(phone.replace(/\s+/g, ''));
  const validEmail = EMAIL_PATTERN.test(email.trim());

  return (
    <Screen
      density="hero"
      scroll={false}
      footer={
        <Button
          label="Send code"
          disabled={!validPhone || !validEmail}
          onPress={() => onContinue({ phone: phone.replace(/\s+/g, ''), email: email.trim() })}
        />
      }
    >
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[8] }}>
        <ScreenHeading
          title="How can we reach you?"
          supporting="We'll text a one-time code to your number to verify it's you."
        />
        <View style={{ gap: spacing[5] }}>
          <Input
            label="Phone number"
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/[^\d\s]/g, ''))}
            keyboardType="phone-pad"
            placeholder="98765 43210"
            prefix="+91"
            helper="Buyers and sellers you connect with will see this number."
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@company.com"
          />
        </View>
        <Text variant="bodySmall" tone="tertiary">
          By continuing, you agree to Binder's Terms and Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
}
