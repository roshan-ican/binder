import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Input, Screen, ScreenHeading, TaxonomyPicker, Text, TrustBadge } from '../components';
import { professions, roles, skills, type TaxonomyItem } from '../data/jobTaxonomy';
import type { JobSeekerProfileData } from '../data/mock';
import { colors, radius, spacing } from '../theme';

type CandidateForm = {
  fullName: string;
  email: string;
  city: string;
  headline: string;
  professionId: string;
  skillIds: string[];
  desiredRoleIds: string[];
  linkedInUrl: string;
};

const defaults: CandidateForm = {
  fullName: 'Aarav Sharma',
  email: 'candidate@binder.test',
  city: 'Mumbai',
  headline: 'Production and sourcing professional',
  professionId: '',
  skillIds: [],
  desiredRoleIds: [],
  linkedInUrl: 'https://www.linkedin.com/in/aarav-sharma',
};

export function JobSeekerOnboardingScreen({
  onComplete,
  onExplore,
}: {
  onComplete: (profile: JobSeekerProfileData) => void;
  onExplore: () => void;
}) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { control, handleSubmit, getValues, trigger, watch, formState: { isSubmitting } } = useForm<CandidateForm>({
    defaultValues: defaults,
  });
  const professionId = watch('professionId');
  const selectedRoleIds = watch('desiredRoleIds');
  const profession = professions.find((item) => item.id === professionId);
  const orderedSkills = prioritize(skills, profession?.suggestedSkillIds ?? []);
  const availableRoles = roles.filter(
    (role) => role.professionId === professionId || selectedRoleIds.includes(role.id),
  );

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showToast]);

  const saveProfile = (values: CandidateForm) => {
    onComplete({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      city: values.city.trim(),
      headline: values.headline.trim(),
      professionId: values.professionId,
      skillIds: values.skillIds,
      desiredRoleIds: values.desiredRoleIds,
      linkedInUrl: values.linkedInUrl.trim() || undefined,
      emailVerified: true,
    });
    setComplete(true);
    setShowToast(true);
  };

  if (!emailVerified) {
    return (
      <Screen
        density="hero"
        scroll={false}
        footer={
          <Button
            label="Send test magic link"
            onPress={async () => {
              if (await trigger('email')) setEmailVerified(true);
            }}
          />
        }
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[8] }}>
          <ScreenHeading
            title="Verify your email"
            supporting="We use this to confirm you can receive application and interview updates."
          />
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Enter your email address.',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                error={error?.message}
              />
            )}
          />
          <Text variant="bodySmall" tone="tertiary">
            This prototype completes the test magic link instantly.
          </Text>
        </View>
      </Screen>
    );
  }

  if (complete) {
    return (
      <Screen
        density="hero"
        scroll={false}
        footer={<Button label="Explore matching jobs" onPress={onExplore} />}
      >
        {showToast ? <SuccessToast message="Candidate profile created successfully" /> : null}
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
          <View style={{ gap: spacing[3] }}>
            <TrustBadge signal="verified" detail={getValues('email')} />
            <Text variant="displayMedium">Your candidate profile is ready.</Text>
            <Text variant="body" tone="secondary">
              Start exploring jobs that match your skills and desired roles.
            </Text>
          </View>
          <Card style={{ gap: spacing[2] }}>
            <Text variant="labelLarge">Suggested next step</Text>
            <Text variant="bodySmall" tone="secondary">
              Review matching opportunities and apply when a role feels right.
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label="Create candidate profile" loading={isSubmitting} onPress={handleSubmit(saveProfile)} />}>
      <ScreenHeading
        title="Complete your profile"
        supporting="Choose your skills so Binder can suggest relevant jobs."
      />
      <View style={{ marginTop: spacing[5] }}>
        <TrustBadge signal="verified" detail={`${getValues('email')} · test verified`} />
      </View>
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <CandidateInput control={control} name="fullName" label="Full name" placeholder="Aarav Sharma" />
        <CandidateInput control={control} name="city" label="City" placeholder="Mumbai" />
        <CandidateInput control={control} name="headline" label="Professional headline" placeholder="Production professional" />
        <Controller
          control={control}
          name="professionId"
          rules={{ required: 'Select your primary profession.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TaxonomyPicker
              label="Primary profession"
              placeholder="Select profession"
              searchPlaceholder="Search manufacturing, sourcing..."
              options={professions}
              selectedIds={value ? [value] : []}
              onChange={(ids) => onChange(ids[0] ?? '')}
              error={error?.message}
              helper="Choose the profession that best describes your main work."
            />
          )}
        />
        <Controller
          control={control}
          name="skillIds"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one skill.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TaxonomyPicker
              label="Skills"
              placeholder="Select skills"
              searchPlaceholder="Search quality control, sourcing..."
              options={orderedSkills}
              selectedIds={value}
              onChange={onChange}
              multiple
              allowCustom
              error={error?.message}
              helper={profession ? `Suggestions for ${profession.label} appear first.` : 'Select a profession to personalize suggestions.'}
            />
          )}
        />
        <Controller
          control={control}
          name="desiredRoleIds"
          rules={{ validate: (value) => value.length > 0 || 'Select at least one desired role.' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TaxonomyPicker
              label="Roles you want"
              placeholder={profession ? 'Select desired roles' : 'Select a profession first'}
              searchPlaceholder="Search roles..."
              options={availableRoles}
              selectedIds={value}
              onChange={onChange}
              multiple
              allowCustom={Boolean(profession)}
              error={error?.message}
              helper="Choose all roles you would consider."
            />
          )}
        />
        <CandidateInput
          control={control}
          name="linkedInUrl"
          label="LinkedIn profile"
          placeholder="https://www.linkedin.com/in/username"
          optional
          validate={(value) => !value.trim() || /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i.test(value) || 'Enter a valid LinkedIn profile URL.'}
        />
      </View>
    </Screen>
  );
}

type TextField = Exclude<keyof CandidateForm, 'email' | 'professionId' | 'skillIds' | 'desiredRoleIds'>;

function CandidateInput({ control, name, label, placeholder, helper, optional, validate }: {
  control: ReturnType<typeof useForm<CandidateForm>>['control'];
  name: TextField;
  label: string;
  placeholder: string;
  helper?: string;
  optional?: boolean;
  validate?: (value: string) => true | string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ validate: (value) => optional && !value.trim() ? true : value.trim() ? (validate?.(value) ?? true) : 'Please enter a value.' }}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <Input label={label} value={value} onChangeText={onChange} placeholder={placeholder} helper={helper} optional={optional} error={error?.message} />
      )}
    />
  );
}

function SuccessToast({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={{ marginTop: spacing[4], padding: spacing[4], borderRadius: radius.md, backgroundColor: colors.bg.raised, borderWidth: 1, borderColor: colors.semantic.success }}>
      <Text variant="labelLarge" tone="success">{message}</Text>
    </View>
  );
}

function prioritize(items: TaxonomyItem[], preferredIds: string[]) {
  const order = new Map(preferredIds.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}
