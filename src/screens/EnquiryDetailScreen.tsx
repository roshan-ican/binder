import { View } from 'react-native';
import {
  BackHeader,
  Divider,
  Metric,
  MetricRow,
  ProfileRow,
  Screen,
  SectionHeader,
  Text,
  TextButton,
} from '../components';
import { businesses, myEnquiries, opportunities } from '../data/mock';
import { rhythm, spacing } from '../theme';

export function EnquiryDetailScreen({
  enquiryId,
  onBack,
  onOpenBusiness,
}: {
  enquiryId: string;
  onBack: () => void;
  onOpenBusiness: (id: string) => void;
}) {
  const enquiry =
    myEnquiries.find((item) => item.id === enquiryId) ??
    opportunities.find((item) => item.id === enquiryId) ??
    myEnquiries[0];

  return (
    <Screen>
      <BackHeader onBack={onBack} action={<TextButton label="Edit" />} />

      <View style={{ gap: spacing[3], paddingTop: spacing[2] }}>
        <Text variant="heading1" accessibilityRole="header">
          {enquiry.title}
        </Text>
        <Text variant="micro" tone="chrome">
          {enquiry.status}
        </Text>
      </View>

      <View style={{ marginTop: rhythm.titleToContent }}>
        <MetricRow>
          <Metric value={enquiry.relevant} label="Relevant" />
          <Metric value={enquiry.interested} label="Interested" />
          <Metric value={enquiry.connected} label="Connected" />
        </MetricRow>
      </View>

      <Divider style={{ marginTop: rhythm.sectionToSection }} />

      <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
        <SectionHeader title="Requirement" />
        <DetailRow label="Quantity" value={enquiry.quantity} />
        <DetailRow label="Budget" value={enquiry.budget} />
        <DetailRow label="Needed by" value={enquiry.neededBy} />
        <DetailRow label="Location" value={enquiry.location} />
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Interested businesses" supporting={`${enquiry.interested} businesses are interested`} />
        {businesses.slice(0, 2).map((business) => (
          <ProfileRow key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Recommended businesses" />
        {businesses.slice(2).map((business) => (
          <ProfileRow key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
        ))}
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2] }}>
      <Text variant="body" tone="tertiary">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}
