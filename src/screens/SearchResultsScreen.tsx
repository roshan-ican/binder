import { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  BackHeader,
  Chip,
  EnquiryCard,
  ProfileCard,
  Screen,
  SearchField,
  SkeletonCard,
  Text,
  TopTabs,
} from '../components';
import { businesses, opportunities } from '../data/mock';
import { spacing } from '../theme';

type ResultTab = 'profiles' | 'enquiries';

/**
 * The query stays visible, filters stay visible, the count updates, and a
 * zero-result search is explained honestly rather than shown blank.
 */
export function SearchResultsScreen({
  query,
  onQueryChange,
  onBack,
  onOpenBusiness,
  loading = false,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onBack: () => void;
  onOpenBusiness: (id: string) => void;
  loading?: boolean;
}) {
  const [tab, setTab] = useState<ResultTab>('profiles');
  const [cityOnly, setCityOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return businesses.filter((business) => {
      const matchesTerm =
        term.length === 0 ||
        `${business.name} ${business.role} ${business.capability} ${business.city}`.toLowerCase().includes(term);
      const matchesCity = !cityOnly || business.city === 'Kanpur';
      const matchesTrust = !verifiedOnly || business.trust === 'verified';
      return matchesTerm && matchesCity && matchesTrust;
    });
  }, [query, cityOnly, verifiedOnly]);

  // Never an empty screen: widen the region and say so.
  const widened = results.length === 0 && cityOnly;
  const shown = widened
    ? businesses.filter((business) => business.region === 'Uttar Pradesh')
    : results;

  return (
    <Screen density="dense">
      <BackHeader onBack={onBack} />

      <SearchField value={query} onChangeText={onQueryChange} placeholder="Search Binder" />

      <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3], flexWrap: 'wrap' }}>
        <Chip label="Filters" icon="sliders" />
        <Chip label="Kanpur" selected={cityOnly} onPress={() => setCityOnly((value) => !value)} />
        <Chip label="Verified" selected={verifiedOnly} onPress={() => setVerifiedOnly((value) => !value)} />
      </View>

      <View style={{ marginTop: spacing[2] }}>
        <TopTabs
          items={[
            { key: 'profiles', label: 'Profiles' },
            { key: 'enquiries', label: 'Enquiries' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </View>

      {loading ? (
        <View style={{ gap: spacing[3], marginTop: spacing[4] }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : tab === 'profiles' ? (
        <View style={{ gap: spacing[3], marginTop: spacing[4] }}>
          {widened ? (
            <Text variant="body" tone="secondary" style={{ marginBottom: spacing[1] }}>
              No exact matches in Kanpur.{'\n'}Showing results across Uttar Pradesh.
            </Text>
          ) : (
            <Text variant="bodySmall" tone="tertiary">
              {shown.length} {shown.length === 1 ? 'result' : 'results'}
              {cityOnly && !widened ? ' in Kanpur' : ''}
            </Text>
          )}

          {shown.map((business) => (
            <ProfileCard key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
          ))}

          {shown.length === 0 ? (
            <View style={{ gap: spacing[3], paddingVertical: spacing[8] }}>
              <Text variant="heading3">We don't have this supply yet.</Text>
              <Text variant="body" tone="secondary">
                Save this search and we'll alert you when a matching business joins.
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ gap: spacing[3], marginTop: spacing[4] }}>
          <Text variant="bodySmall" tone="tertiary">
            {opportunities.length} open enquiries
          </Text>
          {opportunities.map((enquiry) => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
        </View>
      )}
    </Screen>
  );
}
