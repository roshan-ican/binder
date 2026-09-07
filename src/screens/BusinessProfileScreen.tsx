import { View } from 'react-native';
import {
  BackHeader,
  Button,
  Chip,
  Divider,
  Icon,
  Logo,
  MatchLabel,
  Screen,
  SectionHeader,
  SwapCard,
  Text,
  TrustBadge,
} from '../components';
import { businesses } from '../data/mock';
import { publicBusinessEnquiries } from '../data/businessActivity';
import { BusinessEnquiryActivity } from '../components/BusinessEnquiryActivity';
import { swapListings } from '../data/swaps';
import { colors, rhythm, size, spacing } from '../theme';

/**
 * Editorial sections divided by rules — not every section boxed in its own
 * card. The question this screen answers: can I judge whether I trust them?
 */
export function BusinessProfileScreen({
  businessId,
  onBack,
  onConnect,
  onOpenSwap,
}: {
  businessId: string;
  onBack: () => void;
  onConnect: (id: string) => void;
  onOpenSwap?: (id: string) => void;
}) {
  const business = businesses.find((item) => item.id === businessId) ?? businesses[0];
  const publicActivity = publicBusinessEnquiries.filter((item) => item.businessId === business.id);
  const currentNeeds = publicActivity.filter((item) => item.status === 'active');
  const pastEnquiries = publicActivity.filter((item) => item.status !== 'active');
  const activeSwapListings = swapListings.filter((listing) => listing.businessId === business.id && listing.status === 'active');

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <Button label="Save" variant="secondary" fullWidth={false} style={{ flex: 1 }} />
          <Button label="Connect" onPress={() => onConnect(business.id)} fullWidth={false} style={{ flex: 2 }} />
        </View>
      }
    >
      <BackHeader onBack={onBack} />

      <View style={{ gap: spacing[4], paddingTop: spacing[2] }}>
        <Logo name={business.name} size="xl" />
        <View style={{ gap: spacing[2] }}>
          <Text variant="heading1" accessibilityRole="header">
            {business.name}
          </Text>
          <Text variant="body" tone="secondary">
            {business.role}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <Icon name="mapPin" size={size.iconSm} color={colors.text.tertiary} />
          <Text variant="bodySmall" tone="secondary">
            {business.city}, {business.region} · {business.activity}
          </Text>
        </View>

        {business.trust ? <TrustBadge signal={business.trust} detail="12 Aug 2026" /> : null}
      </View>

      <Divider tone="chrome" style={{ marginTop: rhythm.sectionToSection }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Why this matches" />
        {business.whyItMatches.map((reason) => (
          <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
            <Icon name="check" size={size.iconSm} color={colors.chrome[300]} />
            <Text variant="body" tone="secondary" style={{ flex: 1 }}>
              {reason}
            </Text>
          </View>
        ))}
        <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[2] }}>
          Based on your requirement: 500 leather jackets
        </Text>
        <View style={{ marginTop: spacing[1] }}>
          <MatchLabel quality={business.match ?? 'good'} />
        </View>
      </View>

      <Divider style={{ marginTop: spacing[6] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="What they do" />
        <Text variant="body" tone="secondary">
          {business.about}
        </Text>
      </View>

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="What they offer" />
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          {business.offers.map((offer) => (
            <Chip key={offer} label={offer} />
          ))}
        </View>
      </View>

      <Divider style={{ marginTop: spacing[6] }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Current needs" supporting="Open public enquiries from this business." />
        {currentNeeds.length ? currentNeeds.map((enquiry) => (
          <BusinessEnquiryActivity key={enquiry.id} enquiry={enquiry} onRespond={() => onConnect(business.id)} />
        )) : <Text variant="body" tone="secondary">No public enquiries open right now.</Text>}
      </View>

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Past enquiries" supporting="Public enquiry history. Closed does not mean a deal was completed." />
        {pastEnquiries.length ? pastEnquiries.map((enquiry) => (
          <BusinessEnquiryActivity key={enquiry.id} enquiry={enquiry} onRespond={() => onConnect(business.id)} />
        )) : <Text variant="body" tone="secondary">No past public enquiries to show yet.</Text>}
      </View>

      {activeSwapListings.length > 0 ? (
        <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
          <SectionHeader
            title="Swaps"
            action={activeSwapListings.length > 2 ? 'View all' : undefined}
            onAction={() => onOpenSwap?.(activeSwapListings[0].id)}
          />
          {activeSwapListings.slice(0, 2).map((listing) => (
            <SwapCard key={listing.id} kind="listing" listing={listing} onPress={() => onOpenSwap?.(listing.id)} />
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Capabilities" />
        <DetailRow label="Minimum order" value={business.moq} />
        <DetailRow label="Monthly capacity" value={business.capacity} />
        <DetailRow label="Serves" value={business.serves.join(', ')} />
      </View>

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Documents" />
        <TrustBadge signal="documents" detail="GST, company registration" />
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3], paddingVertical: spacing[2] }}>
      <Text variant="body" tone="tertiary">
        {label}
      </Text>
      <Text variant="body" style={{ flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
