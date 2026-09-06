import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Input, Screen, ScreenHeading, StatusNotice, TextButton } from '../components';
import { spacing } from '../theme';

const CODE_LENGTH = 6;

/** Verifies the phone number sent from ContactScreen before onboarding continues. */
export function OtpScreen({
  phone,
  onBack,
  onVerify,
}: {
  phone: string;
  onBack: () => void;
  onVerify: () => void;
}) {
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);
  const valid = code.length === CODE_LENGTH;

  return (
    <Screen
      density="hero"
      scroll={false}
      footer={<Button label="Verify & continue" disabled={!valid} onPress={onVerify} />}
    >
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[8] }}>
        <ScreenHeading
          title="Enter the code"
          supporting={`We sent a ${CODE_LENGTH}-digit code to +91 ${phone}.`}
        />
        <Input
          label="Verification code"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          placeholder="123456"
        />
        <StatusNotice
          title="Prototype mode"
          body="Any 6-digit code works here — production will verify the real SMS code."
        />
        <View style={{ alignItems: 'center' }}>
          <TextButton
            label={resent ? 'Code resent' : 'Resend code'}
            onPress={() => setResent(true)}
            tone="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}
