import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, Chip, ConfirmSheet, DetailRow, Divider, Icon, Input, Screen, ScreenHeading, SectionHeader, StatusNotice, Text, TextButton } from '../components';
import { colors, rhythm, size, spacing } from '../theme';

export type EnquiryDraft = {
  title: string; category: string; quantity: string; unit: string; budget: string;
  neededBy: string; location: string; description: string; attachments: string[];
};

const initialDraft: EnquiryDraft = {
  title: 'Recycled garment boxes for winter collection', category: 'Packaging', quantity: '10000', unit: 'boxes',
  budget: '₹18–₹26 per box', neededBy: '18 Oct 2026', location: 'Kanpur, Uttar Pradesh',
  description: 'Rigid recycled board, matte black finish, four-colour logo on lid. Supplier must provide a pre-production sample.',
  attachments: ['box-dimensions.pdf'],
};

export function EnquiryFlowScreen({ mode = 'create', onBack, onDone }: {
  mode?: 'create' | 'edit'; onBack: () => void; onDone: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState<'form' | 'preview' | 'published' | 'closed'>('form');
  const [closeOpen, setCloseOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const field = (key: keyof EnquiryDraft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Describe what your business needs.';
    if (!draft.quantity.trim()) next.quantity = 'Enter the required quantity.';
    if (!draft.neededBy.trim()) next.neededBy = 'Enter when you need it.';
    if (!draft.description.trim()) next.description = 'Add enough detail for suppliers to respond.';
    setErrors(next);
    if (!Object.keys(next).length) setStep('preview');
  };

  if (step === 'published' || step === 'closed') {
    const closed = step === 'closed';
    return (
      <Screen density="hero" scroll={false} footer={<Button label={closed ? 'Back to enquiries' : 'View enquiry'} onPress={onDone} />}>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[6] }}>
          <Icon name={closed ? 'close' : 'check'} size={size.logoLg} color={closed ? colors.text.tertiary : colors.semantic.success} />
          <View style={{ gap: spacing[3] }}>
            <Text variant="micro" tone={closed ? 'tertiary' : 'chrome'}>{closed ? 'Closed' : 'Active'}</Text>
            <Text variant="displayMedium">{closed ? 'Enquiry closed.' : 'Your enquiry is live.'}</Text>
            <Text variant="body" tone="secondary">{closed ? 'Suppliers can no longer express interest. Your conversations remain available.' : 'Binder is matching relevant suppliers now. You can edit or close it at any time.'}</Text>
          </View>
          <StatusNotice title={closed ? 'Closed successfully' : 'Published successfully'} body={draft.title} tone={closed ? 'warning' : 'success'} />
        </View>
      </Screen>
    );
  }

  if (step === 'preview') {
    return (
      <Screen footer={<View style={{ gap: spacing[2] }}><Button label={mode === 'edit' ? 'Save changes' : 'Publish enquiry'} onPress={() => setStep('published')} /><Button label="Save draft" variant="tertiary" onPress={onDone} /></View>}>
        <BackHeader title="Preview enquiry" onBack={() => setStep('form')} action={<TextButton label="Edit" onPress={() => setStep('form')} />} />
        <View style={{ paddingTop: spacing[3], gap: spacing[2] }}><Text variant="micro" tone="chrome">Draft preview</Text><Text variant="heading1">{draft.title}</Text><Text variant="body" tone="secondary">{draft.category} · {draft.location}</Text></View>
        <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />
        <View style={{ marginTop: spacing[6], gap: spacing[2] }}>
          <SectionHeader title="Requirement" />
          <DetailRow label="Quantity" value={`${draft.quantity} ${draft.unit}`} />
          <DetailRow label="Budget" value={draft.budget} />
          <DetailRow label="Needed by" value={draft.neededBy} />
          <DetailRow label="Service area" value={draft.location} />
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}><SectionHeader title="Specification" /><Text variant="body" tone="secondary">{draft.description}</Text></View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}><SectionHeader title="Attachments" />{draft.attachments.map((name) => <Text key={name} variant="body">⌑ {name}</Text>)}</View>
      </Screen>
    );
  }

  return (
    <Screen footer={<View style={{ flexDirection: 'row', gap: spacing[3] }}><Button label="Save draft" variant="secondary" onPress={onDone} fullWidth={false} style={{ flex: 1 }} /><Button label="Preview" onPress={validate} fullWidth={false} style={{ flex: 1 }} /></View>}>
      <BackHeader title={mode === 'edit' ? 'Edit enquiry' : 'Create enquiry'} onBack={onBack} action={mode === 'edit' ? <TextButton label="Close" tone="danger" onPress={() => setCloseOpen(true)} /> : undefined} />
      <ScreenHeading title={mode === 'edit' ? 'Refine your requirement.' : 'What does your business need?'} supporting="Clear details help the right suppliers respond." />
      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <Input label="Title or requirement" value={draft.title} onChangeText={field('title')} error={errors.title} />
        <View style={{ gap: spacing[2] }}><Text variant="label" tone="secondary">Category</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>{['Packaging', 'Manufacturing', 'Logistics', 'Services'].map((item) => <Chip key={item} label={item} selected={draft.category === item} onPress={() => field('category')(item)} />)}</View></View>
        <View style={{ flexDirection: 'row', gap: spacing[3] }}><View style={{ flex: 1 }}><Input label="Quantity" value={draft.quantity} onChangeText={field('quantity')} keyboardType="numeric" error={errors.quantity} /></View><View style={{ flex: 1 }}><Input label="Unit" value={draft.unit} onChangeText={field('unit')} /></View></View>
        <Input label="Budget or price range" value={draft.budget} onChangeText={field('budget')} helper="You can use a total or per-unit range." />
        <Input label="Needed by" value={draft.neededBy} onChangeText={field('neededBy')} error={errors.neededBy} />
        <Input label="Location or service area" value={draft.location} onChangeText={field('location')} />
        <Input label="Description and specification" value={draft.description} onChangeText={field('description')} multiline error={errors.description} />
        <View style={{ gap: spacing[3] }}><SectionHeader title="Attachments" supporting="PDF, image, or spreadsheet · up to 10 MB" />{draft.attachments.map((name) => <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}><Icon name="document" /><Text variant="body" style={{ flex: 1 }}>{name}</Text><TextButton label="Remove" tone="danger" onPress={() => setDraft((current) => ({ ...current, attachments: [] }))} /></View>)}<Button label="Add attachment" variant="secondary" icon={<Icon name="upload" />} onPress={() => setDraft((current) => ({ ...current, attachments: [...current.attachments, 'reference-finish.jpg'] }))} /></View>
      </View>
      <ConfirmSheet visible={closeOpen} eyebrow="Destructive action" title="Close this enquiry?" body="Suppliers will no longer be able to express interest. Existing conversations will stay available." confirmLabel="Close enquiry" destructive onClose={() => setCloseOpen(false)} onConfirm={() => { setCloseOpen(false); setStep('closed'); }} />
    </Screen>
  );
}
