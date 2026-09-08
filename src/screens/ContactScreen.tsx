import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Chip, Divider, Input, Screen, ScreenHeading, Text } from '../components';
import { spacing } from '../theme';

const PHONE_PATTERN = /^\d{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactMethod = 'phone' | 'email';

/** First identity step for both buyers and sellers — same form either way. */
export function ContactScreen({
  onBack,
  onSubmit,
  sendBusy,
  sendError,
  onGoogleContinue,
  googleBusy,
}: {
  onBack: () => void;
  onSubmit: (input: { method: ContactMethod; identifier: string }) => void;
  sendBusy?: boolean;
  sendError?: string | null;
  onGoogleContinue: () => void;
  googleBusy?: boolean;
}) {
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const validPhone = PHONE_PATTERN.test(phone.replace(/\s+/g, ''));
  const validEmail = EMAIL_PATTERN.test(email.trim());
  const valid = method === 'phone' ? validPhone : validEmail;

  const submit = () => {
    if (method === 'phone') {
      onSubmit({ method: 'phone', identifier: `+91${phone.replace(/\s+/g, '')}` });
    } else {
      onSubmit({ method: 'email', identifier: email.trim() });
    }
  };

  return (
    <Screen
      density="hero"
      scroll={false}
      footer={<Button label={method === 'phone' ? 'Send code' : 'Email me a sign-in link'} disabled={!valid} loading={sendBusy} onPress={submit} />}
    >
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[8] }}>
        <ScreenHeading
          title="How can we reach you?"
          supporting={method === 'phone' ? "We'll text you a one-time code to verify it's you." : "We'll email you a sign-in link — no password to remember."}
        />
        <View style={{ gap: spacing[5] }}>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <Chip label="Phone" selected={method === 'phone'} onPress={() => setMethod('phone')} />
            <Chip label="Email" selected={method === 'email'} onPress={() => setMethod('email')} />
          </View>
          {method === 'phone' ? (
            <Input
              label="Phone number"
              value={phone}
              onChangeText={(value) => setPhone(value.replace(/[^\d\s]/g, ''))}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              prefix="+91"
              helper="Buyers and sellers you connect with will see this number."
            />
          ) : (
            <Input
              label="Email"
              value={email}
              onChangeText={(value) => setEmail(value.toLowerCase())}
              keyboardType="email-address"
              placeholder="you@company.com"
              helper="We'll send a link you tap to sign in."
            />
          )}
          {sendError ? (
            <Text variant="bodySmall" tone="danger">
              {sendError}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
            <Divider style={{ flex: 1 }} />
            <Text variant="bodySmall" tone="tertiary">
              or
            </Text>
            <Divider style={{ flex: 1 }} />
          </View>
          <Button
            label="Continue with Google"
            variant="secondary"
            loading={googleBusy}
            onPress={onGoogleContinue}
          />
        </View>
        <Text variant="bodySmall" tone="tertiary">
          By continuing, you agree to Binder's Terms and Privacy Policy.
        </Text>
      </View>
    </Screen>
  );
}
