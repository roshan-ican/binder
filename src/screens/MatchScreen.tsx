import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessMatchDeck, JobSwipeDeck, TopTabs, type BusinessMatchItem } from '../components';
import {
  businesses,
  jobOpportunities,
  me,
  opportunities,
  type BusinessProfileData,
  type JobSeekerProfileData,
  type UserRole,
} from '../data/mock';
import { colors, pagePadding, spacing } from '../theme';
import { keywordMatches, normalise } from '../data/matching';
import { rankJobs } from './DiscoverScreen';
import { SwapScreen } from './SwapScreen';

/** The business role has two ways to match: the deck, and swaps. */
type MatchMode = 'matches' | 'swaps';

export function MatchScreen({
  role,
  businessProfile,
  jobSeekerProfile,
  businessSwipeCreditsUsed,
  jobSwipeCreditsUsed,
  onBusinessDecision,
  onJobSwipe,
  onOpenBusiness,
  onOpenEnquiry,
  onOpenJob,
  swapOpen,
  onSwapOpenChange,
  onOpenSwapMatch,
  onCreateSwapListing,
  onEditSwapProfile,
  onOpenConversation,
}: {
  role: UserRole;
  businessProfile: BusinessProfileData | null;
  jobSeekerProfile: JobSeekerProfileData | null;
  businessSwipeCreditsUsed: number;
  jobSwipeCreditsUsed: number;
  onBusinessDecision: (decision: 'pass' | 'interested', item: BusinessMatchItem) => void;
  onJobSwipe: () => void;
  onOpenBusiness: (id: string) => void;
  onOpenEnquiry: (id: string) => void;
  onOpenJob: (id: string) => void;
  swapOpen: boolean;
  onSwapOpenChange: (value: boolean) => void;
  onOpenSwapMatch: (id: string) => void;
  onCreateSwapListing: () => void;
  onEditSwapProfile: () => void;
  onOpenConversation: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<MatchMode>('matches');
  const businessItems = useMemo(() => buildBusinessMatchItems(businessProfile), [businessProfile]);

  if (role === 'job-seeker') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
        <JobSwipeDeck
          jobs={rankJobs(jobOpportunities, jobSeekerProfile)}
          creditsUsed={jobSwipeCreditsUsed}
          onDecision={onJobSwipe}
          onOpenJob={(job) => onOpenJob(job.id)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: pagePadding.default, paddingTop: spacing[2] }}>
        <TopTabs
          items={[
            { key: 'matches', label: 'Business matches' },
            { key: 'swaps', label: 'Swaps' },
          ]}
          active={mode}
          onChange={setMode}
        />
      </View>

      {mode === 'matches' ? (
        <BusinessMatchDeck
          items={businessItems}
          creditsUsed={businessSwipeCreditsUsed}
          city={businessProfile?.city || me.city}
          topInset={spacing[4]}
          onDecision={onBusinessDecision}
          onOpenItem={(item) =>
            item.kind === 'business' ? onOpenBusiness(item.business.id) : onOpenEnquiry(item.enquiry.id)
          }
        />
      ) : (
        <SwapScreen
          profile={businessProfile}
          swapOpen={swapOpen}
          onSwapOpenChange={onSwapOpenChange}
          onOpenMatch={onOpenSwapMatch}
          onCreateListing={onCreateSwapListing}
          onEditSwapProfile={onEditSwapProfile}
          onOpenConversation={onOpenConversation}
        />
      )}
    </View>
  );
}

function buildBusinessMatchItems(profile: BusinessProfileData | null): BusinessMatchItem[] {
  const city = normalise(profile?.city || me.city);
  const needs = (profile?.needs ?? me.needs).map(normalise);
  const offers = (profile?.offers ?? me.offers).map(normalise);

  const rankedBusinesses = businesses
    .map((business, index) => ({
      business,
      index,
      score:
        (normalise(business.city) === city ? 100 : 0) +
        keywordMatches(`${business.role} ${business.capability} ${business.offers.join(' ')}`, needs) * 10,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ business }) => business);

  const rankedEnquiries = opportunities
    .map((enquiry, index) => ({
      enquiry,
      index,
      score:
        (normalise(enquiry.location) === city ? 100 : 0) +
        keywordMatches(`${enquiry.title} ${enquiry.fitNote} ${enquiry.whyItFits.join(' ')}`, offers) * 10,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ enquiry }) => enquiry);

  const result: BusinessMatchItem[] = [];
  const length = Math.max(rankedBusinesses.length, rankedEnquiries.length);
  for (let index = 0; index < length; index += 1) {
    const business = rankedBusinesses[index];
    const enquiry = rankedEnquiries[index];
    if (business) result.push({ kind: 'business', id: `business:${business.id}`, business });
    if (enquiry) result.push({ kind: 'enquiry', id: `enquiry:${enquiry.id}`, enquiry });
  }
  return result;
}
