import { useMemo, useState } from 'react';
import { Modal, View } from 'react-native';
import {
  AnimatedPressable,
  BrowseSlider,
  Card,
  Divider,
  EmptyState,
  EnquiryCard,
  Icon,
  ProfileCard,
  Screen,
  SearchField,
  SectionHeader,
  Text,
  TrustBadge,
} from '../components';
import {
  businesses,
  candidate,
  jobOpportunities,
  me,
  opportunities,
  myEnquiries,
  type Business,
  type Enquiry,
  type JobOpportunity,
  type JobSeekerProfileData,
  type UserRole,
} from '../data/mock';
import { colors, rhythm, size, spacing } from '../theme';

type BusinessBrowseKey = 'businesses' | 'manufacturers' | 'shopkeepers' | 'suppliers' | 'services' | 'jobs';
type JobBrowseKey = 'all-jobs' | 'full-time' | 'part-time' | 'contract' | 'internship' | 'nearby';
type LocationKey = 'kanpur-up' | 'lucknow-up' | 'delhi-dl' | 'jaipur-rj' | 'uttar-pradesh' | 'delhi' | 'rajasthan';

const businessBrowseItems = [
  { key: 'businesses', label: 'Businesses' },
  { key: 'manufacturers', label: 'Manufacturers' },
  { key: 'shopkeepers', label: 'Shopkeepers' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'services', label: 'Services' },
  { key: 'jobs', label: 'Jobs' },
] satisfies { key: BusinessBrowseKey; label: string }[];

const jobBrowseItems = [
  { key: 'all-jobs', label: 'All jobs' },
  { key: 'full-time', label: 'Full-time' },
  { key: 'part-time', label: 'Part-time' },
  { key: 'contract', label: 'Contract' },
  { key: 'internship', label: 'Internship' },
  { key: 'nearby', label: 'Nearby' },
] satisfies { key: JobBrowseKey; label: string }[];

const locationOptions = [
  { key: 'kanpur-up', city: 'Kanpur', state: 'Uttar Pradesh', label: 'Kanpur, Uttar Pradesh' },
  { key: 'lucknow-up', city: 'Lucknow', state: 'Uttar Pradesh', label: 'Lucknow, Uttar Pradesh' },
  { key: 'delhi-dl', city: 'Delhi', state: 'Delhi', label: 'Delhi, Delhi' },
  { key: 'jaipur-rj', city: 'Jaipur', state: 'Rajasthan', label: 'Jaipur, Rajasthan' },
  { key: 'uttar-pradesh', state: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { key: 'delhi', state: 'Delhi', label: 'Delhi' },
  { key: 'rajasthan', state: 'Rajasthan', label: 'Rajasthan' },
] satisfies { key: LocationKey; city?: string; state: string; label: string }[];

/**
 * Binder's most important screen. Both sides of the network are visible:
 * what I can find, and who needs what I offer.
 */
export function DiscoverScreen({
  query,
  role,
  jobSeekerProfile,
  jobSwipeCreditsUsed = 0,
  onJobSwipe,
  onOpenJob,
  onQueryChange,
  onSearch,
  onOpenBusiness,
  onOpenOpportunities,
  onOpenEnquiry,
}: {
  query: string;
  role: UserRole;
  jobSeekerProfile?: JobSeekerProfileData | null;
  jobSwipeCreditsUsed?: number;
  onJobSwipe?: () => void;
  onOpenJob?: (id: string) => void;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onOpenBusiness: (id: string) => void;
  onOpenOpportunities: () => void;
  onOpenEnquiry: (id: string) => void;
}) {
  const isJobSeeker = role === 'job-seeker';
  const [businessBrowse, setBusinessBrowse] = useState<BusinessBrowseKey>('businesses');
  const [jobBrowse, setJobBrowse] = useState<JobBrowseKey>('all-jobs');
  const [location, setLocation] = useState<LocationKey>('kanpur-up');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const selectedLocation = locationOptions.find((item) => item.key === location) ?? locationOptions[0];

  const filteredBusinesses = useMemo(
    () =>
      businesses.filter((business) => {
        if (!matchesBusinessLocation(business, location)) return false;
        if (businessBrowse === 'businesses') return true;
        if (businessBrowse === 'jobs') return false;
        return business.category === businessCategoryForBrowse(businessBrowse);
      }),
    [businessBrowse, location],
  );

  const filteredJobs = useMemo(
    () => {
      const filtered = jobOpportunities.filter((job) => {
        if (jobBrowse === 'nearby') return matchesNearbyCity(job.city);
        if (!matchesJobLocation(job, location)) return false;
        if (jobBrowse === 'all-jobs') return true;
        return job.jobType === jobBrowse;
      });
      return rankJobs(filtered, jobSeekerProfile);
    },
    [jobBrowse, jobSeekerProfile, location],
  );

  const filteredOpportunities = useMemo(
    () => opportunities.filter((opportunity) => matchesOpportunityLocation(opportunity, location)),
    [location],
  );

  const showingBusinessJobs = !isJobSeeker && businessBrowse === 'jobs';
  const strongMatches = filteredOpportunities.filter((opportunity) => opportunity.match === 'strong').length;
  const strongJobs = filteredJobs.filter((job) => job.match === 'strong').length;
  const primaryCount = isJobSeeker || showingBusinessJobs ? strongJobs : strongMatches;
  const primaryLabel = primaryCount === 1 ? 'strong match today' : 'strong matches today';

  return (
    <Screen>
      <View style={{ paddingTop: spacing[4], gap: spacing[1] }}>
        <Text variant="micro" style={{ color: colors.chrome[200] }}>
          Binder
        </Text>
        <Text variant="heading1" accessibilityRole="header">
          Good morning, {isJobSeeker ? (jobSeekerProfile?.fullName ?? candidate.person) : me.person}
        </Text>
      </View>

      <View style={{ marginTop: rhythm.titleToContent }}>
        <SearchField
          value={query}
          onChangeText={onQueryChange}
          onSubmit={onSearch}
          placeholder={isJobSeeker ? 'Search jobs, companies, skills...' : undefined}
        />
      </View>

      <View style={{ marginTop: spacing[5], gap: spacing[3] }}>
        <BrowseSlider
          items={isJobSeeker ? jobBrowseItems : businessBrowseItems}
          active={isJobSeeker ? jobBrowse : businessBrowse}
          onChange={(key) => {
            if (isJobSeeker) {
              setJobBrowse(key as JobBrowseKey);
            } else {
              setBusinessBrowse(key as BusinessBrowseKey);
            }
          }}
          accessibilityLabel={isJobSeeker ? 'Browse jobs' : 'Browse businesses'}
        />
        <LocationSelector
          label={selectedLocation.label}
          onPress={() => setLocationPickerOpen(true)}
        />
      </View>
      <LocationPicker
        visible={locationPickerOpen}
        selected={location}
        onSelect={(nextLocation) => {
          setLocation(nextLocation);
          setLocationPickerOpen(false);
        }}
        onClose={() => setLocationPickerOpen(false)}
      />

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader
          title={isJobSeeker || showingBusinessJobs ? 'New jobs' : 'New opportunities'}
          action="View all"
          onAction={onOpenOpportunities}
        />
        <Card onPress={onOpenOpportunities} accessibilityLabel={`${primaryCount} ${primaryLabel}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: spacing[1] }}>
              <Text variant="heading3">
                {primaryCount} {primaryLabel}
              </Text>
              <Text variant="bodySmall" tone="secondary">
                {isJobSeeker || showingBusinessJobs
                  ? 'Hiring teams looking for the right people'
                  : 'Businesses looking for what you manufacture'}
              </Text>
            </View>
            <Icon name="chevronRight" size={size.icon} color={colors.text.tertiary} />
          </View>
        </Card>
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={sectionTitle(isJobSeeker, businessBrowse)} />
        {isJobSeeker || showingBusinessJobs ? (
          <JobList jobs={filteredJobs} />
        ) : (
          <BusinessList businesses={filteredBusinesses} onOpenBusiness={onOpenBusiness} />
        )}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={isJobSeeker ? 'Your applications' : 'Your active needs'} />
        {isJobSeeker ? (
          <Card accessibilityLabel="Production Supervisor application">
            <Text variant="labelLarge">Production Supervisor</Text>
            <Divider style={{ marginVertical: spacing[3] }} />
            <Text variant="bodySmall" tone="secondary">
              ABC Leather Works · Application viewed today
            </Text>
          </Card>
        ) : (
          myEnquiries
            .filter((enquiry) => enquiry.status === 'active')
            .map((enquiry) => (
              <Card key={enquiry.id} onPress={() => onOpenEnquiry(enquiry.id)} accessibilityLabel={enquiry.title}>
                <Text variant="labelLarge">{enquiry.title}</Text>
                <Divider style={{ marginVertical: spacing[3] }} />
                <Text variant="bodySmall" tone="secondary">
                  {enquiry.relevant} matching businesses · {enquiry.interested} interested
                </Text>
              </Card>
            ))
        )}
      </View>

      <View style={{ marginTop: rhythm.sectionToSection, gap: spacing[3] }}>
        <SectionHeader title={isJobSeeker ? 'Companies hiring near you' : 'Open demand near you'} />
        {isJobSeeker
          ? filteredBusinesses.slice(0, 2).map((business) => (
              <ProfileCard key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
            ))
          : filteredOpportunities.slice(0, 2).map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} onPress={onOpenOpportunities} />
            ))}
      </View>
    </Screen>
  );
}

function BusinessList({
  businesses: shown,
  onOpenBusiness,
}: {
  businesses: Business[];
  onOpenBusiness: (id: string) => void;
}) {
  if (shown.length === 0) {
    return (
      <EmptyState
        title="No businesses here yet."
        body="Try another category or location to see more Binder profiles."
      />
    );
  }

  return (
    <>
      {shown.slice(0, 3).map((business) => (
        <ProfileCard key={business.id} business={business} onPress={() => onOpenBusiness(business.id)} />
      ))}
    </>
  );
}

function JobList({ jobs }: { jobs: JobOpportunity[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs here yet."
        body="Try another job type or location to see more roles."
      />
    );
  }

  return (
    <>
      {jobs.slice(0, 3).map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </>
  );
}

function JobCard({ job }: { job: JobOpportunity }) {
  return (
    <Card accessibilityLabel={`${job.title} at ${job.company}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing[3] }}>
        <View style={{ flex: 1, gap: spacing[1] }}>
          <Text variant="labelLarge">{job.title}</Text>
          <Text variant="bodySmall" tone="secondary">
            {job.company} · {job.city}
          </Text>
          <TrustBadge signal={job.trust} />
        </View>
        <Icon name="chevronRight" size={size.icon} color={colors.text.tertiary} />
      </View>

      <Divider style={{ marginVertical: spacing[4] }} />

      <Text variant="bodySmall" tone="secondary">
        {job.workType} · {job.salary}
      </Text>
      <Text variant="bodySmall" tone="tertiary" style={{ marginTop: spacing[1] }}>
        {job.fitNote} · {job.activity}
      </Text>
    </Card>
  );
}

function sectionTitle(isJobSeeker: boolean, businessBrowse: BusinessBrowseKey) {
  if (isJobSeeker) return 'Recommended jobs';

  switch (businessBrowse) {
    case 'manufacturers':
      return 'Manufacturers';
    case 'shopkeepers':
      return 'Shopkeepers';
    case 'suppliers':
      return 'Suppliers';
    case 'services':
      return 'Services';
    case 'jobs':
      return 'Jobs around you';
    case 'businesses':
    default:
      return 'Recommended for you';
  }
}

function businessCategoryForBrowse(key: BusinessBrowseKey) {
  switch (key) {
    case 'manufacturers':
      return 'manufacturer';
    case 'shopkeepers':
      return 'shopkeeper';
    case 'suppliers':
      return 'supplier';
    case 'services':
      return 'service';
    default:
      return undefined;
  }
}

function matchesBusinessLocation(business: Business, location: LocationKey) {
  const selected = locationOptions.find((item) => item.key === location);
  if (!selected) return true;
  if (selected.city) return business.city === selected.city;
  return business.region === selected.state;
}

function matchesJobLocation(job: JobOpportunity, location: LocationKey) {
  const selected = locationOptions.find((item) => item.key === location);
  if (!selected) return true;
  if (selected.city) return job.city === selected.city;
  return job.region === selected.state;
}

function matchesOpportunityLocation(opportunity: Enquiry, location: LocationKey) {
  const selected = locationOptions.find((item) => item.key === location);
  if (!selected) return true;
  if (selected.city) return opportunity.location === selected.city;
  return selected.state === 'Uttar Pradesh'
    ? ['Kanpur', 'Lucknow'].includes(opportunity.location)
    : opportunity.location === selected.state;
}

function matchesNearbyCity(city: string) {
  return city === 'Kanpur' || city === 'Lucknow';
}

export function rankJobs(jobs: JobOpportunity[], profile?: JobSeekerProfileData | null) {
  if (!profile) return jobs;

  return jobs
    .map((job, index) => ({ job, index, score: jobMatchScore(job, profile) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ job }) => job);
}

function jobMatchScore(job: JobOpportunity, profile: JobSeekerProfileData) {
  const desiredRoleMatch = profile.desiredRoleIds.includes(job.roleId) ? 100 : 0;
  const professionMatch = profile.professionId === job.professionId ? 10 : 0;
  const skillMatches = job.requiredSkillIds.filter((id) => profile.skillIds.includes(id)).length;
  return desiredRoleMatch + professionMatch + skillMatches;
}

function LocationSelector({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="micro" tone="tertiary">
        Near you
      </Text>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Select location. Current location ${label}`}
        onPress={onPress}
        pressedScale={0.98}
        style={{
          minHeight: size.controlSm,
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        <Icon name="mapPin" size={size.iconSm} color={colors.chrome[200]} />
        <Text variant="labelLarge">{label}</Text>
        <Icon name="chevronRight" size={size.iconSm} color={colors.text.tertiary} />
      </AnimatedPressable>
    </View>
  );
}

function LocationPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: LocationKey;
  onSelect: (location: LocationKey) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Close location selector"
        onPress={onClose}
        pressedScale={1}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.62)',
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg.raised,
            borderTopWidth: size.hairline,
            borderTopColor: colors.border.strong,
            paddingHorizontal: spacing[6],
            paddingTop: spacing[5],
            paddingBottom: spacing[8],
            gap: spacing[3],
          }}
        >
          <Text variant="heading3">Select city or state</Text>
          <Text variant="bodySmall" tone="secondary">
            Browse Binder across India by city or state.
          </Text>
          <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
            {locationOptions.map((item) => {
              const active = selected === item.key;

              return (
                <AnimatedPressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={item.label}
                  onPress={() => onSelect(item.key)}
                  pressedScale={0.98}
                  style={{
                    minHeight: size.controlSm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing[3],
                    borderBottomWidth: size.hairline,
                    borderBottomColor: colors.border.subtle,
                  }}
                >
                  <Icon name="mapPin" size={size.iconSm} color={active ? colors.chrome[200] : colors.text.tertiary} />
                  <Text variant="body" tone={active ? 'primary' : 'secondary'} style={{ flex: 1 }}>
                    {item.label}
                  </Text>
                  {active ? <Icon name="check" size={size.iconSm} color={colors.chrome[200]} /> : null}
                </AnimatedPressable>
              );
            })}
          </View>
        </View>
      </AnimatedPressable>
    </Modal>
  );
}
