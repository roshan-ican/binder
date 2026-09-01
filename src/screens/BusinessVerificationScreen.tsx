import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Card, Screen, ScreenHeading, Text, TrustBadge } from '../components';
import type { BusinessProfileData } from '../data/mock';
import { colors, radius, spacing } from '../theme';

export function BusinessVerificationScreen({ profile, allowSkip = false, onVerified, onSkip, onBack }: {
  profile: BusinessProfileData; allowSkip?: boolean;
  onVerified: (profile: BusinessProfileData) => void; onSkip?: () => void; onBack?: () => void;
}) {
  const [complete, setComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const verify = () => {
    onVerified({ ...profile, verificationStatus: 'verified' });
    setComplete(true); setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showToast]);

  if (complete) {
    return (
      <Screen density="hero" scroll={false} footer={<Button label="Continue" onPress={onSkip} />}>
        {showToast ? <View accessibilityRole="alert" style={{ marginTop: spacing[4], padding: spacing[4], borderRadius: radius.md, backgroundColor: colors.bg.raised, borderWidth: 1, borderColor: colors.semantic.success }}><Text variant="labelLarge" tone="success">Business verified successfully</Text></View> : null}
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[5] }}>
          <TrustBadge signal="verified" detail="Business verification demo" />
          <Text variant="displayMedium">Your business is verified.</Text>
          <Text variant="body" tone="secondary">You can now connect, message, reply, and publish enquiries.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<View style={{ gap: spacing[2] }}><Button label="Verify business" onPress={verify} />{allowSkip ? <Button label="Do it later" variant="tertiary" onPress={onSkip} /> : null}</View>}>
      {onBack ? <BackHeader title="Business verification" onBack={onBack} /> : <ScreenHeading title="Verify your business" supporting="For this prototype, any business details you enter can be verified instantly." />}
      <View style={{ marginTop: spacing[5] }}><TrustBadge signal="pending" detail="Demo verification" /></View>
      <View style={{ gap: spacing[4], marginTop: spacing[8] }}>
        <Card style={{ gap: spacing[2] }}>
          <Text variant="labelLarge">Ready to verify</Text>
          <Text variant="heading3">{profile.businessName}</Text>
          <Text variant="bodySmall" tone="secondary">{profile.industry} · {profile.city}</Text>
          {profile.gstin ? <Text variant="bodySmall" tone="tertiary">GSTIN {profile.gstin}</Text> : <Text variant="bodySmall" tone="tertiary">No GSTIN added</Text>}
        </Card>
        <Text variant="bodySmall" tone="tertiary">This is a demo only. A real GST check will replace this step later.</Text>
      </View>
    </Screen>
  );
}
