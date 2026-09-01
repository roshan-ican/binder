import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Screen, ScreenHeading, TrustBadge } from '../components';
import type { BusinessProfileData } from '../data/mock';
import { spacing } from '../theme';

type FormValues = {
  businessName: string;
  industry: string;
  city: string;
  gstin: string;
};

const defaults: FormValues = {
  businessName: '', industry: '', city: '', gstin: '',
};

export function BusinessOnboardingScreen({ onComplete }: { onComplete: (profile: BusinessProfileData) => void }) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({ defaultValues: defaults });

  const save = (values: FormValues) => onComplete({
    businessName: values.businessName.trim(),
    contactName: '',
    industry: values.industry.trim(),
    city: values.city.trim(),
    gstin: values.gstin.trim().toUpperCase(),
    offers: [],
    needs: [],
    verificationStatus: 'unverified',
  });

  return (
    <Screen footer={<Button label="Verify & continue" loading={isSubmitting} onPress={handleSubmit(save)} />}>
      <ScreenHeading title="Your business" supporting="Just the essentials. You can add offers and needs from your profile later." />
      <View style={{ marginTop: spacing[5] }}><TrustBadge signal="pending" detail="No documents needed" /></View>
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <FormInput control={control} name="businessName" label="Business name" placeholder="Roshan Clothing" />
        <FormInput control={control} name="industry" label="Industry" placeholder="Fashion & Apparel" />
        <FormInput control={control} name="city" label="City" placeholder="Kanpur" />
        <FormInput control={control} name="gstin" label="GSTIN" placeholder="Optional" helper="Optional. No certificate or document upload is required." optional />
      </View>
    </Screen>
  );
}

function FormInput({ control, name, label, placeholder, helper, optional }: { control: ReturnType<typeof useForm<FormValues>>['control']; name: keyof FormValues; label: string; placeholder: string; helper?: string; optional?: boolean }) {
  return <Controller control={control} name={name} rules={optional ? undefined : { validate: (value) => value.trim().length > 0 || 'Please enter a value.' }} render={({ field: { value, onChange }, fieldState: { error } }) => <Input label={label} value={value} onChangeText={onChange} placeholder={placeholder} helper={helper} optional={optional} error={error?.message} />} />;
}
