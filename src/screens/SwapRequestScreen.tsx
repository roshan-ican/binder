import { useState } from 'react';
import { View } from 'react-native';
import {
  BackHeader,
  Button,
  Chip,
  ConfirmSheet,
  DetailRow,
  Divider,
  EmptyState,
  Icon,
  Input,
  Screen,
  ScreenHeading,
  SectionHeader,
  StatusNotice,
  SwapCard,
  Text,
  TextButton,
} from '../components';
import { mySwapRequests, type BusinessProfileData, type SwapKind } from '../data/mock';
import { describeSwaps, findRequestSwaps, swapKindHelper, swapKindShortLabel, swapKinds } from '../data/swapMatching';
import { colors, rhythm, size, spacing } from '../theme';

type OfferDraft = { id: string; kind: SwapKind; label: string; indicativeValue: string };

type RequestDraft = {
  needTitle: string;
  needCategory: string;
  needValue: string;
  needDescription: string;
  neededBy: string;
  canOffer: OfferDraft[];
};

const initialDraft: RequestDraft = {
  needTitle: '₹1 lakh of packaging',
  needCategory: 'Packaging',
  needValue: '₹1,00,000',
  needDescription:
    'Printed rigid garment boxes and mailers for the winter drop. Four-colour lid, recycled board, pre-production sample required.',
  neededBy: '18 Oct 2026',
  canOffer: [
    { id: '1', kind: 'product', label: 'Leather goods', indicativeValue: '₹1,00,000 retail value' },
    { id: '2', kind: 'promotion', label: 'Advertising & promotion', indicativeValue: '14,000 reach' },
  ],
};

/**
 * B2B procurement. A listing says what you have; a request says what you need
 * and lists several things you would give for it. Any one of them can close the
 * deal, so a request reaches businesses a single listing never would.
 *
 * Same three steps as an enquiry — form, preview, published — so the two stay
 * learnable as one flow.
 */
export function SwapRequestScreen({
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

  const field = (key: 'needTitle' | 'needCategory' | 'needValue' | 'needDescription' | 'neededBy') =>
    (value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const updateOffer = (id: string, patch: Partial<OfferDraft>) =>
    setDraft((current) => ({
      ...current,
      canOffer: current.canOffer.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));

  const addOffer = () =>
    setDraft((current) => ({
      ...current,
      canOffer: [
        ...current.canOffer,
        { id: String(current.canOffer.length + 1), kind: 'service', label: '', indicativeValue: '' },
      ],
    }));

  const removeOffer = (id: string) =>
    setDraft((current) => ({ ...current, canOffer: current.canOffer.filter((item) => item.id !== id) }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.needTitle.trim()) next.needTitle = 'Say what you need.';
    if (!draft.needCategory.trim()) next.needCategory = 'Add a category so Binder can match it.';
    if (!draft.needDescription.trim()) next.needDescription = 'Add enough detail for a supplier to judge it.';
    const filled = draft.canOffer.filter((item) => item.label.trim());
    if (!filled.length) next.canOffer = 'Offer at least one thing in place of cash.';
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
            <Text variant="displayMedium">{closed ? 'Request closed.' : 'Your request is live.'}</Text>
            <Text variant="body" tone="secondary">
              {closed
                ? 'Businesses can no longer answer it. Existing conversations stay available.'
                : 'Binder is looking for businesses that can cover it and want any one of the things you offered.'}
            </Text>
          </View>
          <StatusNotice
            title={closed ? 'Closed successfully' : 'Published successfully'}
            body={draft.needTitle}
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
            <Button label={mode === 'edit' ? 'Save changes' : 'Post request'} onPress={() => setStep('published')} />
            <Button label="Save draft" variant="tertiary" onPress={onDone} />
          </View>
        }
      >
        <BackHeader
          title="Preview request"
          onBack={() => setStep('form')}
          action={<TextButton label="Edit" onPress={() => setStep('form')} />}
        />
        <View style={{ paddingTop: spacing[3], gap: spacing[2] }}>
          <Text variant="micro" tone="chrome">Draft preview</Text>
          <Text variant="heading1">{draft.needTitle}</Text>
          <Text variant="body" tone="secondary">{draft.needCategory} · needed by {draft.neededBy}</Text>
        </View>
        <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />
        <View style={{ marginTop: spacing[6], gap: spacing[2] }}>
          <SectionHeader title="What you need" />
          <DetailRow label="Category" value={draft.needCategory} />
          <DetailRow label="Indicative value" value={draft.needValue || 'Not stated'} />
          <DetailRow label="Needed by" value={draft.neededBy} />
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader title="Specification" />
          <Text variant="body" tone="secondary">{draft.needDescription}</Text>
        </View>
        <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
          <SectionHeader
            title="What you can give instead"
            supporting="Any one of these can close the deal."
          />
          {draft.canOffer
            .filter((item) => item.label.trim())
            .map((item) => (
              <View key={item.id} style={{ gap: spacing[1] }}>
                <Text variant="body">{item.label}</Text>
                <Text variant="bodySmall" tone="tertiary">
                  {swapKindShortLabel[item.kind]}
                  {item.indicativeValue ? ` · ${item.indicativeValue}` : ''}
                </Text>
              </View>
            ))}
        </View>
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
        title={mode === 'edit' ? 'Edit request' : 'Post a request'}
        onBack={onBack}
        action={mode === 'edit' ? <TextButton label="Close" tone="danger" onPress={() => setCloseOpen(true)} /> : undefined}
      />
      <ScreenHeading
        title="What do you need, and what can you give for it?"
        supporting="List more than one thing you could give. Any single one of them can close the deal."
      />

      <View style={{ gap: spacing[5], marginTop: spacing[8] }}>
        <Input label="What you need" value={draft.needTitle} onChangeText={field('needTitle')} error={errors.needTitle} />
        <Input
          label="Category"
          value={draft.needCategory}
          onChangeText={field('needCategory')}
          helper="One word is enough — Packaging, Printing, Logistics."
          error={errors.needCategory}
        />
        <Input
          label="Indicative value"
          value={draft.needValue}
          onChangeText={field('needValue')}
          helper="Optional. A guide for the other side, not a price."
        />
        <Input label="Needed by" value={draft.neededBy} onChangeText={field('neededBy')} />
        <Input
          label="Specification"
          value={draft.needDescription}
          onChangeText={field('needDescription')}
          multiline
          error={errors.needDescription}
        />
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[4] }}>
        <SectionHeader
          title="What you can give instead of cash"
          supporting="Binder matches on all of them. A supplier only has to want one."
        />
        {errors.canOffer ? (
          <Text variant="bodySmall" tone="danger">{errors.canOffer}</Text>
        ) : null}
        {draft.canOffer.map((item, index) => (
          <View key={item.id} style={{ gap: spacing[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="micro" tone="tertiary">Option {index + 1}</Text>
              {draft.canOffer.length > 1 ? (
                <TextButton label="Remove" tone="danger" onPress={() => removeOffer(item.id)} />
              ) : null}
            </View>
            <Input
              label="What you would give"
              value={item.label}
              onChangeText={(value) => updateOffer(item.id, { label: value })}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
              {swapKinds.map((kind) => (
                <Chip
                  key={kind}
                  label={swapKindShortLabel[kind]}
                  selected={item.kind === kind}
                  onPress={() => updateOffer(item.id, { kind })}
                />
              ))}
            </View>
            <Text variant="bodySmall" tone="tertiary">{swapKindHelper[item.kind]}</Text>
            <Input
              label="Indicative value"
              value={item.indicativeValue}
              onChangeText={(value) => updateOffer(item.id, { indicativeValue: value })}
            />
            {index < draft.canOffer.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <Button label="Add another option" variant="secondary" icon={<Icon name="plus" />} onPress={addOffer} />
      </View>

      <ConfirmSheet
        visible={closeOpen}
        eyebrow="Destructive action"
        title="Close this request?"
        body="Businesses will no longer be able to answer it. Existing conversations stay available."
        confirmLabel="Close request"
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

/** A posted request and the businesses that can answer it. */
export function SwapRequestDetailScreen({
  requestId,
  profile,
  onBack,
  onOpenMatch,
  onEdit,
}: {
  requestId: string;
  profile: BusinessProfileData | null;
  onBack: () => void;
  onOpenMatch: (id: string) => void;
  onEdit: () => void;
}) {
  const request = mySwapRequests.find((item) => item.id === requestId);

  if (!request) {
    return (
      <Screen>
        <BackHeader title="Request" onBack={onBack} />
        <EmptyState
          title="This request is no longer available."
          body="It may have been closed. Go back to see your current requests."
          actionLabel="Back to swaps"
          onAction={onBack}
        />
      </Screen>
    );
  }

  const matches = describeSwaps(findRequestSwaps(request, profile), profile);

  return (
    <Screen>
      <BackHeader title="Request" onBack={onBack} action={<TextButton label="Edit" onPress={onEdit} />} />

      <View style={{ paddingTop: spacing[2], gap: spacing[2] }}>
        <Text variant="micro" tone="chrome">Procurement request</Text>
        <Text variant="heading1" accessibilityRole="header">{request.needTitle}</Text>
        <Text variant="body" tone="secondary">
          {request.needCategory} · needed by {request.neededBy}
        </Text>
      </View>

      <Divider tone="chrome" style={{ marginTop: rhythm.titleToContent }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Specification" />
        <Text variant="body" tone="secondary">{request.needDescription}</Text>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader
          title="What you offered instead of cash"
          supporting="A supplier only has to want one of these."
        />
        {request.canOffer.map((offer) => (
          <View key={offer.id} style={{ gap: spacing[1] }}>
            <Text variant="body">{offer.label}</Text>
            <Text variant="bodySmall" tone="tertiary">
              {swapKindShortLabel[offer.kind]} · {offer.indicativeValue}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader
          title={matches.length ? `${matches.length} business${matches.length === 1 ? '' : 'es'} can answer this` : 'Answers'}
        />
        {matches.length ? (
          matches.map((summary) => (
            <SwapCard key={summary.id} summary={summary} onPress={() => onOpenMatch(summary.id)} />
          ))
        ) : (
          <EmptyState
            title="Nobody can answer this yet."
            body="Widen the category, or add another thing you could give — a supplier only has to want one of them."
            actionLabel="Edit request"
            onAction={onEdit}
          />
        )}
      </View>
    </Screen>
  );
}
