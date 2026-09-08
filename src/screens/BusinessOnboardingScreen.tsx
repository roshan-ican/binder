import { useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { BusinessIndustryPicker, Button, Chip, CityStatePicker, CountryPicker, Input, Screen, ScreenHeading, Text, TrustBadge } from '../components';
import { defaultCountryCode, getCountry, type CountryCode } from '../data/countries';
import type { BusinessProfileData, BuyerAudience, TradeIntent } from '../data/mock';
import { spacing } from '../theme';

type FormValues = {
  countryCode: CountryCode;
  businessName: string;
  contactName: string;
  industries: string[];
  city: string;
  region: string;
  offers: string[];
  needs: string;
  acceptsOrdersFrom: BuyerAudience;
};

const defaults: FormValues = {
  countryCode: defaultCountryCode,
  businessName: '', contactName: '', industries: [], city: '', region: '', offers: [], needs: '', acceptsOrdersFrom: 'businesses-and-individuals',
};

const offerOptions = ['Manufacturer', 'Supplier', 'Distributor', 'Wholesaler', 'Retailer', 'Service provider'] as const;

export function BusinessOnboardingScreen({ tradeIntent, onComplete }: { tradeIntent: TradeIntent; onComplete: (profile: BusinessProfileData) => void }) {
  const { control, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({ defaultValues: defaults });

  const countryCode = watch('countryCode');
  const country = getCountry(countryCode);

  const save = (values: FormValues) => onComplete({
    countryCode: values.countryCode,
    businessName: values.businessName.trim(),
    contactName: values.contactName.trim(),
    industry: values.industries[0],
    industries: values.industries,
    city: values.city.trim(),
    region: values.region.trim(),
    offers: values.offers,
    needs: values.needs.split(',').map((item) => item.trim()).filter(Boolean),
    acceptsOrdersFrom: values.acceptsOrdersFrom,
    tradeIntent,
    verificationStatus: 'unverified',
  });

  return (
    <Screen footer={<Button label="Create business profile" loading={isSubmitting} onPress={handleSubmit(save)} />}>
      <ScreenHeading title="Tell us about your business" supporting={`Create your profile first. ${country.taxId.label} verification is optional and can be completed later.`} />
      <View style={{ marginTop: spacing[5] }}><TrustBadge signal="pending" detail={country.taxId.optionalNote} /></View>
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <Controller
          control={control}
          name="countryCode"
          render={({ field: { value, onChange } }) => (
            <CountryPicker
              selected={value}
              onChange={(next) => {
                onChange(next);
                setValue('city', '');
                setValue('region', '');
              }}
            />
          )}
        />
        <FormInput control={control} name="businessName" label="Business name" placeholder="Roshan Clothing" />
        <FormInput control={control} name="contactName" label="Your name" placeholder="Roshan" />
        <Controller
          control={control}
          name="industries"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one industry.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <BusinessIndustryPicker selected={value} onChange={onChange} error={error?.message} />
          )}
        />
        <Controller
          control={control}
          name="city"
          rules={{ validate: (value) => value.trim().length > 0 || 'Choose a city.' }}
          render={({ field: { value: city }, fieldState: { error } }) => (
            <CityStatePicker
              city={city}
              state={watch('region')}
              countryCode={countryCode}
              onChange={({ city: nextCity, state: nextState }) => {
                setValue('city', nextCity, { shouldValidate: true });
                setValue('region', nextState);
              }}
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="offers"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one option.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <OfferPicker selected={value} onChange={onChange} error={error?.message} />
          )}
        />
        <Controller
          control={control}
          name="acceptsOrdersFrom"
          render={({ field: { value, onChange } }) => (
            <View style={{ gap: spacing[2] }}>
              <Text variant="label" tone="secondary">Who can order from you?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                <Chip label="Businesses only" selected={value === 'businesses-only'} onPress={() => onChange('businesses-only')} />
                <Chip label="Businesses & individuals" selected={value === 'businesses-and-individuals'} onPress={() => onChange('businesses-and-individuals')} />
              </View>
              <Text variant="bodySmall" tone="tertiary">Business accounts can join without GST. You decide whether individual buyers can order too.</Text>
            </View>
          )}
        />
        <FormInput control={control} name="needs" label="What do you need?" placeholder="Packaging, logistics" helper="Separate multiple items with commas." />
      </View>
    </Screen>
  );
}

function OfferPicker({ selected, onChange, error }: { selected: string[]; onChange: (offers: string[]) => void; error?: string }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const custom = selected.filter((offer) => !offerOptions.includes(offer as (typeof offerOptions)[number]));

  const toggle = (offer: string) => onChange(selected.includes(offer) ? selected.filter((item) => item !== offer) : [...selected, offer]);
  const addCustom = () => {
    const next = draft.trim();
    if (next && !selected.some((offer) => offer.toLowerCase() === next.toLowerCase())) onChange([...selected, next]);
    setDraft('');
    setAdding(false);
  };

  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label" tone="secondary">What do you offer?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
        {offerOptions.map((option) => <Chip key={option} label={option} selected={selected.includes(option)} onPress={() => toggle(option)} />)}
        {custom.map((offer) => <Chip key={offer} label={offer} selected onRemove={() => toggle(offer)} onPress={() => toggle(offer)} />)}
        <Chip label="Other" icon="plus" selected={adding} onPress={() => setAdding((open) => !open)} />
      </View>
      {adding ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] }}>
          <View style={{ flex: 1 }}><Input label="Add your own" value={draft} onChangeText={setDraft} placeholder="Exporter, job worker" /></View>
          <Button label="Add" variant="secondary" onPress={addCustom} />
        </View>
      ) : null}
      <Text variant="bodySmall" tone={error ? 'danger' : 'tertiary'}>{error ?? 'Select all that apply, or add your own.'}</Text>
    </View>
  );
}

type TextFieldName = Exclude<keyof FormValues, 'offers' | 'industries' | 'acceptsOrdersFrom' | 'city' | 'region' | 'countryCode'>;
function FormInput({ control, name, label, placeholder, helper }: { control: ReturnType<typeof useForm<FormValues>>['control']; name: TextFieldName; label: string; placeholder: string; helper?: string }) {
  return <Controller control={control} name={name} rules={{ validate: (value) => value.trim().length > 0 || 'Please enter a value.' }} render={({ field: { value, onChange }, fieldState: { error } }) => <Input label={label} value={value} onChangeText={onChange} placeholder={placeholder} helper={helper} error={error?.message} />} />;
}
