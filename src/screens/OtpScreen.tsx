import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Input, Screen, ScreenHeading, TextButton } from '../components';
import { spacing } from '../theme';
import type { ContactMethod } from './ContactScreen';

const CODE_LENGTH = 6;

/** Verifies the phone/email code sent from ContactScreen before onboarding continues. */
export function OtpScreen({
  method,
  identifier,
  onBack,
  onVerify,
  verifyBusy,
  verifyError,
  onResend,
  resendBusy,
}: {
  method: ContactMethod;
  /** Display-ready value the code was sent to — a +91-prefixed phone or an email address. */
  identifier: string;
  onBack: () => void;
  onVerify: (code: string) => void;
  verifyBusy?: boolean;
  verifyError?: string | null;
  onResend: () => void;
  resendBusy?: boolean;
}) {
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);
  const valid = code.length === CODE_LENGTH;

  return (
    <Screen
      density="hero"
      scroll={false}
      footer={<Button label="Verify & continue" disabled={!valid} loading={verifyBusy} onPress={() => onVerify(code)} />}
    >
      <BackHeader onBack={onBack} />
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing[8] }}>
        <ScreenHeading
          title="Enter the code"
          supporting={`We sent a ${CODE_LENGTH}-digit code ${method === 'phone' ? 'to' : 'to your email'} ${identifier}.`}
        />
        <Input
          label="Verification code"
          value={code}
          onChangeText={(value) => { setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH)); setResent(false); }}
          keyboardType="number-pad"
          placeholder="123456"
          error={verifyError ?? undefined}
        />
        <View style={{ alignItems: 'center' }}>
          <TextButton
            label={resendBusy ? 'Sending...' : resent ? 'Code resent' : 'Resend code'}
            onPress={() => { onResend(); setResent(true); }}
            tone="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}
