import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Chip, Input, Screen, ScreenHeading, Text, TrustBadge } from '../components';
import type { BusinessProfileData } from '../data/mock';
import { colors, radius, spacing } from '../theme';

type FormValues = {
  gstin: string;
  businessName: string;
  contactName: string;
  industry: string;
  city: string;
  offers: string[];
  needs: string;
};

const initialValues: FormValues = {
  gstin: '27AAPFU0939F1ZV',
  businessName: '',
  contactName: '',
  industry: '',
  city: '',
  offers: [],
  needs: '',
};

const testBusiness: FormValues = {
  gstin: '27AAPFU0939F1ZV',
  businessName: 'Binder Test Industries',
  contactName: 'Test Business Owner',
  industry: 'Manufacturing & Distribution',
  city: 'Mumbai, Maharashtra',
  offers: ['Manufacturer', 'Distributor'],
  needs: 'Packaging, logistics',
};

export function BusinessVerificationScreen({
  onVerified,
  onExplore,
}: {
  onVerified: (profile: BusinessProfileData) => void;
  onExplore: () => void;
}) {
  const [verified, setVerified] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    setError,
    setValue,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: initialValues });

  const verifyTestGstin = () => {
    const gstin = getValues('gstin').trim().toUpperCase();

    if (gstin !== testBusiness.gstin) {
      setError('gstin', {
        type: 'validate',
        message: 'Use the provided test GSTIN for this demo lookup.',
      });
      return;
    }

    clearErrors();
    (Object.keys(testBusiness) as (keyof FormValues)[]).forEach((field) => {
      setValue(field, testBusiness[field], { shouldDirty: true, shouldValidate: true });
    });
  };

  const verify = (values: FormValues) => {
    onVerified({
      gstin: values.gstin.trim().toUpperCase(),
      businessName: values.businessName.trim(),
      contactName: values.contactName.trim(),
      industry: values.industry.trim(),
      city: values.city.trim(),
      offers: values.offers,
      needs: toList(values.needs),
      verified: true,
    });
    setVerified(true);
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showToast]);

  if (verified) {
    return (
      <Screen
        density="hero"
        scroll={false}
        footer={<Button label="Explore matching businesses" onPress={onExplore} />}
      >
        {showToast ? (
          <View
            accessibilityRole="alert"
            style={{
              marginTop: spacing[4],
              padding: spacing[4],
              borderRadius: radius.md,
              backgroundColor: colors.bg.raised,
              borderWidth: 1,
              borderColor: colors.semantic.success,
            }}
          >
            <Text variant="labelLarge" tone="success">Business verified successfully</Text>
          </View>
        ) : null}

        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
          <View style={{ gap: spacing[3] }}>
            <TrustBadge signal="verified" detail={`GSTIN ${getValues('gstin')}`} />
            <Text variant="displayMedium">Your business profile is ready.</Text>
            <Text variant="body" tone="secondary">
              Explore businesses that match what you offer and what you need.
            </Text>
          </View>

          <Card style={{ gap: spacing[2] }}>
            <Text variant="labelLarge">Suggested next step</Text>
            <Text variant="bodySmall" tone="secondary">
              Browse suppliers, buyers, and service providers selected for your business profile.
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          label="Verify business"
          loading={isSubmitting}
          onPress={handleSubmit(verify)}
        />
      }
    >
      <ScreenHeading
        title="Tell us about your business"
        supporting="This is a demo verification. Any details you enter will be accepted and shown on your profile."
      />

      <View style={{ marginTop: spacing[5] }}>
        <TrustBadge signal="pending" detail="Demo verification" />
      </View>

      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <FormInput
          control={control}
          name="gstin"
          label="GSTIN"
          placeholder="27AAPFU0939F1ZV"
          helper="Enter the 15-character GST registration number."
          normalize={(value) => value.replace(/\s/g, '').toUpperCase().slice(0, 15)}
          validate={(value) => isValidGstin(value) || 'Enter a valid GSTIN.'}
        />
        <Button
          label="Verify test GSTIN and fill details"
          variant="secondary"
          onPress={verifyTestGstin}
        />
        <FormInput control={control} name="businessName" label="Business name" placeholder="Roshan Clothing" />
        <FormInput control={control} name="contactName" label="Your name" placeholder="Roshan" />
        <FormInput control={control} name="industry" label="Industry" placeholder="Fashion & Apparel" />
        <FormInput control={control} name="city" label="City" placeholder="Kanpur" />
        <OffersMultiSelect control={control} />
        {/* Needs stay open-ended because buyers may describe many different requirements. */}
        <FormInput
          control={control}
          name="needs"
          label="What do you need?"
          placeholder="Packaging, logistics"
          helper="Separate multiple items with commas."
        />
        <Text variant="bodySmall" tone="tertiary">
          No real documents are checked in this prototype.
        </Text>
      </View>
    </Screen>
  );
}

const offerOptions = [
  'Manufacturer',
  'Supplier',
  'Distributor',
  'Wholesaler',
  'Retailer',
  'Service provider',
] as const;

function OffersMultiSelect({
  control,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control'];
}) {
  return (
    <Controller
      control={control}
      name="offers"
      rules={{ validate: (value) => value.length > 0 || 'Select at least one option.' }}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={{ gap: spacing[2] }}>
          <Text variant="label" tone="secondary">What do you offer?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {offerOptions.map((option) => {
              const selected = value.includes(option);
              return (
                <Chip
                  key={option}
                  label={option}
                  selected={selected}
                  onPress={() =>
                    onChange(
                      selected
                        ? value.filter((item) => item !== option)
                        : [...value, option],
                    )
                  }
                />
              );
            })}
          </View>
          <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>
            {error?.message ?? 'Select all that apply.'}
          </Text>
        </View>
      )}
    />
  );
}

type TextFieldName = Exclude<keyof FormValues, 'offers'>;

function FormInput({
  control,
  name,
  label,
  placeholder,
  helper,
  normalize,
  validate,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control'];
  name: TextFieldName;
  label: string;
  placeholder: string;
  helper?: string;
  normalize?: (value: string) => string;
  validate?: (value: string) => true | string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: (value) =>
          value.trim().length > 0
            ? (validate?.(value) ?? true)
            : 'Please enter a value.',
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={(nextValue) => onChange(normalize?.(nextValue) ?? nextValue)}
          placeholder={placeholder}
          helper={helper}
          error={error?.message}
        />
      )}
    />
  );
}

function isValidGstin(value: string) {
  const gstin = value.trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
    return false;
  }

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 2;
  let sum = 0;

  for (let index = gstin.length - 2; index >= 0; index -= 1) {
    const codePoint = chars.indexOf(gstin[index]);
    const product = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    sum += Math.floor(product / 36) + (product % 36);
  }

  const checkCodePoint = (36 - (sum % 36)) % 36;
  return gstin[14] === chars[checkCodePoint];
}

function toList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
