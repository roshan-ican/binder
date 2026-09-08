import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { BackHeader, Button, Card, Input, Screen, ScreenHeading, Text, TrustBadge } from '../components';
import { getCountry } from '../data/countries';
import type { BusinessProfileData } from '../data/mock';
import { colors, radius, spacing } from '../theme';

const testRegistration = {
  businessName: 'Binder Test Industries', industry: 'Manufacturing & Distribution', industries: ['Manufacturing & Distribution'],
  offers: ['Manufacturer', 'Distributor'], needs: ['Packaging', 'Logistics'],
};

export function BusinessVerificationScreen({ profile, allowSkip = false, onVerified, onSkip, onBack }: {
  profile: BusinessProfileData; allowSkip?: boolean;
  onVerified: (profile: BusinessProfileData) => void; onSkip?: () => void; onBack?: () => void;
}) {
  const [lookedUp, setLookedUp] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const country = getCountry(profile.countryCode);
  const { taxId } = country;
  const { control, getValues, setError, clearErrors } = useForm({ defaultValues: { taxId: taxId.demoValue } });

  const lookup = () => {
    const entered = getValues('taxId').trim().toUpperCase();
    if (entered !== taxId.demoValue) {
      setLookedUp(false);
      setError('taxId', { type: 'validate', message: `Use the provided test ${taxId.label} for this demo lookup.` });
      return;
    }
    clearErrors('taxId'); setLookedUp(true);
  };

  const verify = () => {
    if (!lookedUp) return lookup();
    onVerified({ ...profile, ...testRegistration, city: country.demoCity, taxId: taxId.demoValue, verificationStatus: 'verified' });
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
          <TrustBadge signal="verified" detail={`${taxId.label} ${taxId.demoValue}`} />
          <Text variant="displayMedium">Your business is verified.</Text>
          <Text variant="body" tone="secondary">You can now connect, message, reply, and publish enquiries.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<View style={{ gap: spacing[2] }}><Button label={lookedUp ? 'Verify business' : `Look up test ${taxId.label}`} onPress={lookedUp ? verify : lookup} />{allowSkip ? <Button label="Do it later" variant="tertiary" onPress={onSkip} /> : null}</View>}>
      {onBack ? <BackHeader title="Business verification" onBack={onBack} /> : <ScreenHeading title="Verify your business" supporting="Verification is optional now. You will need it before connecting, messaging, or publishing." />}
      <View style={{ marginTop: spacing[5] }}><TrustBadge signal="pending" detail={`One ${taxId.label} check`} /></View>
      <View style={{ gap: spacing[4], marginTop: spacing[8] }}>
        <Controller control={control} name="taxId" render={({ field: { value, onChange }, fieldState: { error } }) => <Input label={taxId.label} value={value} onChangeText={(next) => { setLookedUp(false); onChange(next.replace(/\s/g, '').toUpperCase().slice(0, 15)); }} placeholder={taxId.placeholder} helper={`${taxId.helper} Use the provided test value for this prototype.`} error={error?.message} />} />
        {lookedUp ? <Card style={{ gap: spacing[2] }}><Text variant="labelLarge">Registration found</Text><Text variant="heading3">{testRegistration.businessName}</Text><Text variant="bodySmall" tone="secondary">{testRegistration.industry} · {country.demoCity}</Text><Text variant="bodySmall" tone="tertiary">These registered details will update your profile.</Text></Card> : null}
        <Text variant="bodySmall" tone="tertiary">No real {taxId.label} registry is called in this prototype.</Text>
      </View>
    </Screen>
  );
}
