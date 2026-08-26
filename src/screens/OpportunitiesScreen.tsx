import { useState } from 'react';
import { View } from 'react-native';
import { BackHeader, Button, EmptyState, OpportunityCard, Screen, Text } from '../components';
import { opportunities } from '../data/mock';
import { spacing } from '../theme';

/**
 * Active demand, one card at a time. Not a dating app: no hearts, no
 * confetti, no red/green. Interest is a quiet confirmation and moves on.
 */
export function OpportunitiesScreen({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const enquiry = opportunities[index];
  const advance = () => {
    setSentTo(null);
    setIndex((current) => current + 1);
  };

  if (!enquiry) {
    return (
      <Screen scroll={false}>
        <BackHeader title="Opportunities" onBack={onBack} />
        <EmptyState
          title="That's everything for today."
          body="New enquiries matching what you offer will appear here. We'll notify you when a strong match arrives."
          actionLabel="Back to Discover"
          onAction={onBack}
        />
      </Screen>
    );
  }

  if (sentTo) {
    return (
      <Screen scroll={false}>
        <BackHeader title="Opportunities" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing[3] }}>
          <Text variant="heading2">Interest sent.</Text>
          <Text variant="body" tone="secondary">
            {sentTo} can now review your business profile.
          </Text>
          <Button label="Next opportunity" onPress={advance} style={{ marginTop: spacing[4] }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <BackHeader title={`Opportunity ${index + 1} of ${opportunities.length}`} onBack={onBack} />
      <View style={{ flex: 1, paddingBottom: spacing[6], paddingTop: spacing[2] }}>
        <OpportunityCard
          enquiry={enquiry}
          onPass={advance}
          onInterested={() => setSentTo(enquiry.buyer)}
        />
      </View>
    </Screen>
  );
}
