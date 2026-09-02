import { useMemo } from 'react';
import { View } from 'react-native';
import { BusinessMatchDeck, JobSwipeDeck, type BusinessMatchItem } from '../components';
import {
  businesses,
  jobOpportunities,
  me,
  opportunities,
  type BusinessProfileData,
  type JobSeekerProfileData,
  type UserRole,
} from '../data/mock';
import { colors } from '../theme';
import { rankJobs } from './DiscoverScreen';

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
}) {
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
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <BusinessMatchDeck
        items={businessItems}
        creditsUsed={businessSwipeCreditsUsed}
        city={businessProfile?.city || me.city}
        onDecision={onBusinessDecision}
        onOpenItem={(item) =>
          item.kind === 'business' ? onOpenBusiness(item.business.id) : onOpenEnquiry(item.enquiry.id)
        }
      />
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

function keywordMatches(text: string, keywords: string[]) {
  const normalisedText = normalise(text);
  return keywords.filter((keyword) => keyword.length > 2 && normalisedText.includes(keyword)).length;
}

function normalise(value: string) {
  return value.trim().toLowerCase();
}
