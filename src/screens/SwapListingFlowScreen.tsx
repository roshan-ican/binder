import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Chip, ConfirmSheet, DetailRow, Divider, Icon, Input, Screen, ScreenHeading, SectionHeader, StatusNotice, Text, TextButton } from '../components';
import { SWAP_CATEGORIES } from '../data/swaps';
import { colors, rhythm, size, spacing } from '../theme';

export type SwapDraft = {
  offeringTitle: string;
  offeringCategory: string;
  offeringDescription: string;
  offeringQuantity: string;
  seekingTitle: string;
  seekingCategory: string;
  seekingDescription: string;
  location: string;
};

const initialDraft: SwapDraft = {
  offeringTitle: 'Leftover cotton fabric rolls',
  offeringCategory: 'Textiles',
  offeringDescription: 'Roll-end cotton fabric offcuts from production, still usable for lining and small-batch runs.',
  offeringQuantity: '400 metres',
  seekingTitle: 'Garment boxes',
  seekingCategory: 'Packaging',
  seekingDescription: 'Rigid garment boxes for finished stock, any neutral finish.',
  location: 'Kanpur, Uttar Pradesh',
};

export function SwapListingFlowScreen({ mode = 'create', onBack, onDone }: {
  mode?: 'create' | 'edit'; onBack: () => void; onDone: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState<'form' | 'preview' | 'published' | 'closed'>('form');
  const [closeOpen, setCloseOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const field = (key: keyof SwapDraft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.offeringTitle.trim()) next.offeringTitle = 'Describe what your business has to offer.';
    if (!draft.offeringCategory.trim()) next.offeringCategory = 'Choose a category for what you offer.';
    if (!draft.seekingTitle.trim()) next.seekingTitle = 'Describe what your business needs in return.';
    if (!draft.seekingCategory.trim()) next.seekingCategory = 'Choose a category for what you need.';
    setErrors(next);
    if (!Object.keys(next).length) setStep('preview');
  };

  if (step === 'published' || step === 'closed') {
    const closed = step === 'closed';
    return (
      <Screen density="hero" scroll={false} footer={<Button label={closed ? 'Back to swaps' : 'View swap listing'} onPress={onDone} />}>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
          <Icon name={closed ? 'close' : 'check'} size={size.logoLg} color={closed ? colors.text.tertiary : colors.semantic.success} />
          <View style={{ gap: spacing[3] }}>
            <Text variant="micro" tone={closed ? 'tertiary' : 'chrome'}>{closed ? 'Closed' : 'Active'}</Text>
            <Text variant="displayMedium">{closed ? 'Swap listing closed.' : 'Your swap listing is live.'}</Text>
            <Text variant="body" tone="secondary">{closed ? 'Other businesses can no longer propose a swap. Your conversations remain available.' : 'Binder is matching relevant businesses now. You can edit or close it at any time.'}</Text>
          </View>
          <StatusNotice title={closed ? 'Closed successfully' : 'Published successfully'} body={draft.offeringTitle} tone={closed ? 'warning' : 'success'} />
        </View>
      </Screen>
    );
  }

  if (step === 'preview') {
    return (
      <Screen footer={<View style={{ gap: spacing[2] }}><Button label={mode === 'edit' ? 'Save changes' : 'Publish swap listing'} onPress={() => setStep('published')} /><Button label="Save draft" variant="tertiary" onPress={onDone} /></View>}>
        <BackHeader title="Preview swap listing" onBack={() => setStep('form')} action={<TextButton label="Edit" onPress={() => setStep('form')} />} />
        <View style={{ paddingTop: spacing[3], gap: spacing[2] }}><Text variant="micro" tone="chrome">Draft preview</Text><Text variant="heading1">{draft.offeringTitle}</Text><Text variant="body" tone="secondary">{draft.offeringCategory} · {draft.location}</Text></View>
        <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />
        <View style={{ marginTop: spacing[6], gap: spacing[2] }}>
          <SectionHeader title="You offer" />
          <DetailRow label="Item" value={draft.offeringTitle} />
          <DetailRow label="Category" value={draft.offeringCategory} />
          {draft.offeringQuantity ? <DetailRow label="Quantity" value={draft.offeringQuantity} /> : null}
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[2] }}>
          <SectionHeader title="You're seeking" />
          <DetailRow label="Item" value={draft.seekingTitle} />
          <DetailRow label="Category" value={draft.seekingCategory} />
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}><SectionHeader title="Details" /><Text variant="body" tone="secondary">{draft.offeringDescription}</Text></View>
      </Screen>
    );
  }

  return (
    <Screen footer={<View style={{ flexDirection: 'row', gap: spacing[3] }}><Button label="Save draft" variant="secondary" onPress={onDone} fullWidth={false} style={{ flex: 1 }} /><Button label="Preview" onPress={validate} fullWidth={false} style={{ flex: 1 }} /></View>}>
      <BackHeader title={mode === 'edit' ? 'Edit swap listing' : 'Create swap listing'} onBack={onBack} action={mode === 'edit' ? <TextButton label="Close" tone="danger" onPress={() => setCloseOpen(true)} /> : undefined} />
      <ScreenHeading title={mode === 'edit' ? 'Refine your swap.' : 'What can your business trade?'} supporting="Clear details help Binder find a business whose needs mirror yours." />
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <SectionHeader title="You offer" />
        <Input label="What are you offering" value={draft.offeringTitle} onChangeText={field('offeringTitle')} error={errors.offeringTitle} />
        <View style={{ gap: spacing[2] }}>
          <Text variant="label" tone="secondary">Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {SWAP_CATEGORIES.map((item) => <Chip key={item} label={item} selected={draft.offeringCategory === item} onPress={() => field('offeringCategory')(item)} />)}
          </View>
          {errors.offeringCategory ? <Text variant="bodySmall" tone="danger">{errors.offeringCategory}</Text> : null}
        </View>
        <Input label="Quantity (optional)" value={draft.offeringQuantity} onChangeText={field('offeringQuantity')} />
        <Input label="Description" value={draft.offeringDescription} onChangeText={field('offeringDescription')} multiline />

        <Divider style={{ marginVertical: spacing[2] }} />

        <SectionHeader title="You're seeking" />
        <Input label="What do you need in return" value={draft.seekingTitle} onChangeText={field('seekingTitle')} error={errors.seekingTitle} />
        <View style={{ gap: spacing[2] }}>
          <Text variant="label" tone="secondary">Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
            {SWAP_CATEGORIES.map((item) => <Chip key={item} label={item} selected={draft.seekingCategory === item} onPress={() => field('seekingCategory')(item)} />)}
          </View>
          {errors.seekingCategory ? <Text variant="bodySmall" tone="danger">{errors.seekingCategory}</Text> : null}
        </View>
        <Input label="Description" value={draft.seekingDescription} onChangeText={field('seekingDescription')} multiline />
        <Input label="Location" value={draft.location} onChangeText={field('location')} />
      </View>
      <ConfirmSheet visible={closeOpen} eyebrow="Destructive action" title="Close this swap listing?" body="Other businesses will no longer be able to propose a swap. Existing conversations will stay available." confirmLabel="Close listing" destructive onClose={() => setCloseOpen(false)} onConfirm={() => { setCloseOpen(false); setStep('closed'); }} />
    </Screen>
  );
}
