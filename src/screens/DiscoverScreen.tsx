import { View } from 'react-native';
import {
  Card,
  Divider,
  EnquiryCard,
  Icon,
  ProfileCard,
  Screen,
  SearchField,
  SectionHeader,
  Text,
} from '../components';
import { businesses, me, opportunities, myEnquiries } from '../data/mock';
import { colors, rhythm, size, spacing } from '../theme';

/**
 * Binder's most important screen. Both sides of the network are visible:
 * what I can find, and who needs what I offer.
 */
export function DiscoverScreen({
  query,
  onQueryChange,
  onSearch,
  onOpenBusiness,
  onOpenOpportunities,
  onOpenEnquiry,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onOpenBusiness: (id: string) => void;
  onOpenOpportunities: () => void;
  onOpenEnquiry: (id: string) => void;
}) {
  const strongMatches = opportunities.filter((o) => o.match === 'strong').length;

  return (
    <Screen>
      <View style={{ paddingTop: spacing[4], gap: spacing[1] }}>
        <Text variant="micro" style={{ color: colors.chrome[200] }}>
          Binder
        </Text>
        <Text variant="heading1" accessibilityRole="header">
          Good morning, {me.person}
        </Text>
      </View>

      <View style={{ marginTop: rhythm.titleToContent }}>
        <SearchField value={query} onChangeText={onQueryChange} onSubmit={onSearch} />
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="New opportunities" action="View all" onAction={onOpenOpportunities} />
        <Card onPress={onOpenOpportunities} accessibilityLabel={`${strongMatches} strong matches today`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: spacing[1] }}>
              <Text variant="heading3">{strongMatches} strong matches today</Text>
              <Text variant="bodySmall" tone="secondary">
                Businesses looking for what you manufacture
              </Text>
            </View>
            <Icon name="chevronRight" size={size.icon} color={colors.text.tertiary} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Recommended for you" />
        {businesses.slice(0, 2).map((business) => (
          <ProfileCard key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
        ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Your active needs" />
        {myEnquiries
          .filter((enquiry) => enquiry.status === 'active')
          .map((enquiry) => (
            <Card key={enquiry.id} onPress={() => onOpenEnquiry(enquiry.id)} accessibilityLabel={enquiry.title}>
              <Text variant="labelLarge">{enquiry.title}</Text>
              <Divider style={{ marginVertical: spacing[3] }} />
              <Text variant="bodySmall" tone="secondary">
                {enquiry.relevant} matching businesses · {enquiry.interested} interested
              </Text>
            </Card>
          ))}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title="Open demand near you" />
        {opportunities.slice(0, 1).map((enquiry) => (
          <EnquiryCard key={enquiry.id} enquiry={enquiry} onPress={onOpenOpportunities} />
        ))}
      </View>
    </Screen>
  );
}
