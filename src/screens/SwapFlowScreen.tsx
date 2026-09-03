import { useState } from 'react';
import { View } from 'react-native';
import {
  BackHeader,
  Button,
  Chip,
  ConfirmSheet,
  DetailRow,
  Divider,
  Icon,
  Input,
  Screen,
  ScreenHeading,
  SectionHeader,
  StatusNotice,
  Text,
  TextButton,
} from '../components';
import type { SwapKind } from '../data/mock';
import { swapKindHelper, swapKindShortLabel, swapKinds } from '../data/swapMatching';
import { colors, rhythm, size, spacing } from '../theme';

export type SwapDraft = {
  title: string;
  kind: SwapKind;
  category: string;
  indicativeValue: string;
  description: string;
  wants: string;
};

const kinds = swapKinds.map((key) => ({
  key,
  label: swapKindShortLabel[key],
  helper: swapKindHelper[key],
}));

const initialDraft: SwapDraft = {
  title: 'Last season overstock',
  kind: 'surplus',
  category: 'Surplus stock',
  indicativeValue: '₹1,80,000 retail value',
  description: 'Two hundred pieces of unsold winter stock, mixed sizes. We would rather move it than discount it.',
  wants: 'Campaign, Warehouse space, Printing',
};

/**
 * Create or edit what you put on the table. Same three steps as an enquiry:
 * form, preview, published — so the two flows stay learnable as one.
 */
export function SwapFlowScreen({
  mode = 'create',
  onBack,
  onDone,
}: {
  mode?: 'create' | 'edit';
  onBack: () => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState<'form' | 'preview' | 'published' | 'closed'>('form');
  const [closeOpen, setCloseOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const field = (key: 'title' | 'category' | 'indicativeValue' | 'description' | 'wants') => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Name what you are putting on the table.';
    if (!draft.category.trim()) next.category = 'Add a category so Binder can match it.';
    if (!draft.description.trim()) next.description = 'Add enough detail for the other side to judge it.';
    if (!draft.wants.trim()) next.wants = 'Say what you would want back.';
    setErrors(next);
    if (!Object.keys(next).length) setStep('preview');
  };

  if (step === 'published' || step === 'closed') {
    const closed = step === 'closed';
    return (
      <Screen
        density="hero"
        scroll={false}
        footer={<Button label={closed ? 'Back to swaps' : 'View your swaps'} onPress={onDone} />}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
          <Icon
            name={closed ? 'close' : 'check'}
            size={size.logoLg}
            color={closed ? colors.text.tertiary : colors.semantic.success}
          />
          <View style={{ gap: spacing[3] }}>
            <Text variant="micro" tone={closed ? 'tertiary' : 'chrome'}>{closed ? 'Closed' : 'Active'}</Text>
            <Text variant="displayMedium">{closed ? 'Swap listing closed.' : 'It is on the table.'}</Text>
            <Text variant="body" tone="secondary">
              {closed
                ? 'Other businesses can no longer propose a swap against this. Existing conversations stay available.'
                : 'Binder is looking for businesses that want this and offer what you need — including three-way chains.'}
            </Text>
          </View>
          <StatusNotice
            title={closed ? 'Closed successfully' : 'Published successfully'}
            body={draft.title}
            tone={closed ? 'warning' : 'success'}
          />
        </View>
      </Screen>
    );
  }

  if (step === 'preview') {
    return (
      <Screen
        footer={
          <View style={{ gap: spacing[2] }}>
            <Button
              label={mode === 'edit' ? 'Save changes' : 'Put it on the table'}
              onPress={() => setStep('published')}
            />
            <Button label="Save draft" variant="tertiary" onPress={onDone} />
          </View>
        }
      >
        <BackHeader
          title="Preview swap listing"
          onBack={() => setStep('form')}
          action={<TextButton label="Edit" onPress={() => setStep('form')} />}
        />
        <View style={{ paddingTop: spacing[3], gap: spacing[2] }}>
          <Text variant="micro" tone="chrome">Draft preview</Text>
          <Text variant="heading1">{draft.title}</Text>
          <Text variant="body" tone="secondary">
            {kinds.find((item) => item.key === draft.kind)?.label} swap · {draft.category}
          </Text>
        </View>
        <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />
        <View style={{ marginTop: spacing[6], gap: spacing[2] }}>
          <SectionHeader title="On the table" />
          <DetailRow label="Type" value={`${kinds.find((item) => item.key === draft.kind)?.label} swap`} />
          <DetailRow label="Category" value={draft.category} />
          <DetailRow label="Indicative value" value={draft.indicativeValue || 'Not stated'} />
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Detail" />
          <Text variant="body" tone="secondary">{draft.description}</Text>
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="What you want back" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {splitWants(draft.wants).map((want) => (
              <Chip key={want} label={want} />
            ))}
          </View>
        </View>
        <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[6] }}>
          Indicative value is a guide for the other side. Binder never prices or holds a swap.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <Button label="Save draft" variant="secondary" onPress={onDone} fullWidth={false} style={{ flex: 1 }} />
          <Button label="Preview" onPress={validate} fullWidth={false} style={{ flex: 1 }} />
        </View>
      }
    >
      <BackHeader
        title={mode === 'edit' ? 'Edit swap listing' : 'Add to your swaps'}
        onBack={onBack}
        action={mode === 'edit' ? <TextButton label="Close" tone="danger" onPress={() => setCloseOpen(true)} /> : undefined}
      />
      <ScreenHeading
        title={mode === 'edit' ? 'Refine what you offer.' : 'What can you put on the table?'}
        supporting="It does not have to be a product. Services, exposure, space and audience all count."
      />

      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <Input label="What you are offering" value={draft.title} onChangeText={field('title')} error={errors.title} />

        <View style={{ gap: spacing[2] }}>
          <Text variant="label" tone="secondary">What kind of thing is it?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {kinds.map((item) => (
              <Chip
                key={item.key}
                label={item.label}
                selected={draft.kind === item.key}
                onPress={() => setDraft((current) => ({ ...current, kind: item.key }))}
              />
            ))}
          </View>
          <Text variant="bodySmall" tone="tertiary">
            {kinds.find((item) => item.key === draft.kind)?.helper}
          </Text>
        </View>

        <Input
          label="Category"
          value={draft.category}
          onChangeText={field('category')}
          helper="One word is enough — Photography, Packaging, Catering."
          error={errors.category}
        />
        <Input
          label="Indicative value"
          value={draft.indicativeValue}
          onChangeText={field('indicativeValue')}
          helper="Optional. A guide for the other side, not a price."
        />
        <Input
          label="Detail"
          value={draft.description}
          onChangeText={field('description')}
          multiline
          error={errors.description}
        />
        <Input
          label="What you want back"
          value={draft.wants}
          onChangeText={field('wants')}
          helper="Separate with commas. Binder matches these against what others offer."
          error={errors.wants}
        />
      </View>

      <ConfirmSheet
        visible={closeOpen}
        eyebrow="Destructive action"
        title="Close this swap listing?"
        body="Other businesses will no longer be able to propose a swap against it. Existing conversations stay available."
        confirmLabel="Close listing"
        destructive
        onClose={() => setCloseOpen(false)}
        onConfirm={() => {
          setCloseOpen(false);
          setStep('closed');
        }}
      />
    </Screen>
  );
}

function splitWants(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
