import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Chip, Input, Screen, ScreenHeading, Text, TrustBadge } from '../components';
import { businessIndustries } from '../data/businessTaxonomy';
import type { BusinessProfileData } from '../data/mock';
import { spacing } from '../theme';

type FormValues = {
  businessName: string;
  contactName: string;
  industries: string[];
  city: string;
  offers: string[];
  needs: string;
};

const defaults: FormValues = {
  businessName: '', contactName: '', industries: [], city: '', offers: [], needs: '',
};

const offerOptions = ['Manufacturer', 'Supplier', 'Distributor', 'Wholesaler', 'Retailer', 'Service provider'] as const;

export function BusinessOnboardingScreen({ onComplete }: { onComplete: (profile: BusinessProfileData) => void }) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({ defaultValues: defaults });

  const save = (values: FormValues) => onComplete({
    businessName: values.businessName.trim(),
    contactName: values.contactName.trim(),
    industry: values.industries[0],
    industries: values.industries,
    city: values.city.trim(),
    offers: values.offers,
    needs: values.needs.split(',').map((item) => item.trim()).filter(Boolean),
    verificationStatus: 'unverified',
  });

  return (
    <Screen footer={<Button label="Create business profile" loading={isSubmitting} onPress={handleSubmit(save)} />}>
      <ScreenHeading title="Tell us about your business" supporting="Create your profile first. GST verification is optional and can be completed later." />
      <View style={{ marginTop: spacing[5] }}><TrustBadge signal="pending" detail="No GST required to join" /></View>
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <FormInput control={control} name="businessName" label="Business name" placeholder="Roshan Clothing" />
        <FormInput control={control} name="contactName" label="Your name" placeholder="Roshan" />
        <Controller
          control={control}
          name="industries"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one industry.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View style={{ gap: spacing[2] }}>
              <Text variant="label" tone="secondary">Industries</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                {businessIndustries.map((industry) => (
                  <Chip
                    key={industry}
                    label={industry}
                    selected={value.includes(industry)}
                    onPress={() => onChange(value.includes(industry)
                      ? value.filter((item) => item !== industry)
                      : [...value, industry])}
                  />
                ))}
              </View>
              <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>
                {error?.message ?? 'Select all industries that apply.'}
              </Text>
            </View>
          )}
        />
        <FormInput control={control} name="city" label="City" placeholder="Kanpur" />
        <Controller
          control={control}
          name="offers"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one option.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View style={{ gap: spacing[2] }}>
              <Text variant="label" tone="secondary">What do you offer?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                {offerOptions.map((option) => <Chip key={option} label={option} selected={value.includes(option)} onPress={() => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])} />)}
              </View>
              <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>{error?.message ?? 'Select all that apply.'}</Text>
            </View>
          )}
        />
        <FormInput control={control} name="needs" label="What do you need?" placeholder="Packaging, logistics" helper="Separate multiple items with commas." />
      </View>
    </Screen>
  );
}

type TextFieldName = Exclude<keyof FormValues, 'offers' | 'industries'>;
function FormInput({ control, name, label, placeholder, helper }: { control: ReturnType<typeof useForm<FormValues>>['control']; name: TextFieldName; label: string; placeholder: string; helper?: string }) {
  return <Controller control={control} name={name} rules={{ validate: (value) => value.trim().length > 0 || 'Please enter a value.' }} render={({ field: { value, onChange }, fieldState: { error } }) => <Input label={label} value={value} onChangeText={onChange} placeholder={placeholder} helper={helper} error={error?.message} />} />;
}
