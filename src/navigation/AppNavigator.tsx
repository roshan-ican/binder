import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabs, BusinessTrustGate, type TabKey } from '../components';
import type { BusinessProfileData, JobSeekerProfileData, UserRole } from '../data/mock';
import { colors, motion } from '../theme';
import { BusinessProfileScreen } from '../screens/BusinessProfileScreen';
import { BusinessVerificationScreen } from '../screens/BusinessVerificationScreen';
import { BusinessOnboardingScreen } from '../screens/BusinessOnboardingScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { EnquiriesScreen } from '../screens/EnquiriesScreen';
import { EnquiryDetailScreen } from '../screens/EnquiryDetailScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { JobSeekerOnboardingScreen } from '../screens/JobSeekerOnboardingScreen';
import { OpportunitiesScreen } from '../screens/OpportunitiesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

/**
 * A deliberately small navigator. The prototype covers the three V1 journeys
 * without pulling in a navigation library — swap this for expo-router or
 * react-navigation when the real routes land.
 */
type Route =
  | { name: 'welcome' }
  | { name: 'business-onboarding' }
  | { name: 'business-verification'; source: 'onboarding' | 'gate' | 'profile' }
  | { name: 'job-seeker-onboarding' }
  | { name: 'tabs' }
  | { name: 'search' }
  | { name: 'business'; id: string }
  | { name: 'enquiry'; id: string }
  | { name: 'opportunities' }
  | { name: 'conversation'; id: string };

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const [stack, setStack] = useState<Route[]>([{ name: 'welcome' }]);
  const [tab, setTab] = useState<TabKey>('discover');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<UserRole>('business');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfileData | null>(null);
  const [jobSwipeCreditsUsed, setJobSwipeCreditsUsed] = useState(0);
  const [trustGateOpen, setTrustGateOpen] = useState(false);
  const pendingTrustAction = useRef<null | (() => void)>(null);

  const route = stack[stack.length - 1];
  const push = (next: Route) => setStack((current) => [...current, next]);
  const pop = () => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  const reset = (next: Route) => setStack([next]);
  const runTrustAction = (action: () => void) => {
    if (role !== 'business' || businessProfile?.verificationStatus === 'verified') return action();
    pendingTrustAction.current = action;
    setTrustGateOpen(true);
  };

  if (route.name === 'welcome') {
    return (
      <WelcomeScreen
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          reset({ name: nextRole === 'business' ? 'business-onboarding' : 'job-seeker-onboarding' });
        }}
        onExplore={() => reset({ name: 'tabs' })}
      />
    );
  }

  if (route.name === 'business-onboarding') {
    return <BusinessOnboardingScreen onComplete={(profile) => { setBusinessProfile(profile); reset({ name: 'business-verification', source: 'onboarding' }); }} />;
  }

  if (route.name === 'business-verification' && businessProfile) {
    const finish = () => {
      if (route.source === 'onboarding') { setTab('discover'); reset({ name: 'tabs' }); return; }
      pop();
      const action = pendingTrustAction.current;
      pendingTrustAction.current = null;
      action?.();
    };
    return (
      <BusinessVerificationScreen
        profile={businessProfile}
        allowSkip={route.source === 'onboarding'}
        onBack={route.source === 'onboarding' ? undefined : () => { pendingTrustAction.current = null; pop(); }}
        onVerified={(profile) => {
          setBusinessProfile(profile);
        }}
        onSkip={finish}
      />
    );
  }

  if (route.name === 'job-seeker-onboarding') {
    return (
      <JobSeekerOnboardingScreen
        onComplete={setJobSeekerProfile}
        onExplore={() => {
          setTab('discover');
          reset({ name: 'tabs' });
        }}
      />
    );
  }

  const screen = (() => {
    switch (route.name) {
      case 'search':
        return (
          <SearchResultsScreen
            query={query}
            role={role}
            onQueryChange={setQuery}
            onBack={pop}
            onOpenBusiness={(id) => push({ name: 'business', id })}
          />
        );
      case 'business':
        return (
          <BusinessProfileScreen
            businessId={route.id}
            onBack={pop}
            onConnect={() => runTrustAction(() => push({ name: 'conversation', id: 'abc-leather' }))}
          />
        );
      case 'enquiry':
        return (
          <EnquiryDetailScreen
            enquiryId={route.id}
            onBack={pop}
            onOpenBusiness={(id) => push({ name: 'business', id })}
          />
        );
      case 'opportunities':
        return <OpportunitiesScreen role={role} onBack={pop} />;
      case 'conversation':
          return <ConversationScreen role={role} conversationId={route.id} onBack={pop} onTrustAction={runTrustAction} />;
      case 'tabs':
      default:
        return (
          <TabScreen
            tab={tab}
            role={role}
            query={query}
            onQueryChange={setQuery}
            onSearch={() => push({ name: 'search' })}
            onOpenBusiness={(id) => push({ name: 'business', id })}
            onOpenEnquiry={(id) => push({ name: 'enquiry', id })}
            onOpenOpportunities={() => push({ name: 'opportunities' })}
            onOpenConversation={(id) => push({ name: 'conversation', id })}
            businessProfile={businessProfile}
            jobSeekerProfile={jobSeekerProfile}
            jobSwipeCreditsUsed={jobSwipeCreditsUsed}
            onJobSwipe={() => setJobSwipeCreditsUsed((count) => Math.min(count + 1, 10))}
            onTrustAction={runTrustAction}
            onVerifyBusiness={() => push({ name: 'business-verification', source: 'profile' })}
          />
        );
    }
  })();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <RouteFrame routeKey={routeKey(route, tab)}>{screen}</RouteFrame>
      {route.name === 'tabs' ? (
        <BottomTabs role={role} active={tab} onChange={setTab} bottomInset={insets.bottom} />
      ) : null}
      <BusinessTrustGate visible={trustGateOpen} onClose={() => { setTrustGateOpen(false); pendingTrustAction.current = null; }} onVerify={() => { setTrustGateOpen(false); businessProfile ? push({ name: 'business-verification', source: 'gate' }) : reset({ name: 'business-onboarding' }); }} />
    </View>
  );
}

function routeKey(route: Route, tab: TabKey) {
  if (route.name === 'tabs') return `tabs:${tab}`;
  if ('id' in route) return `${route.name}:${route.id}`;
  return route.name;
}

function RouteFrame({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  const entry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entry.setValue(0);
    Animated.timing(entry, {
      toValue: 1,
      duration: motion.small,
      useNativeDriver: true,
    }).start();
  }, [entry, routeKey]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: entry,
        transform: [
          {
            translateY: entry.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function TabScreen({
  tab,
  role,
  query,
  onQueryChange,
  onSearch,
  onOpenBusiness,
  onOpenEnquiry,
  onOpenOpportunities,
  onOpenConversation,
  businessProfile,
  jobSeekerProfile,
  jobSwipeCreditsUsed,
  onJobSwipe,
  onTrustAction,
  onVerifyBusiness,
}: {
  tab: TabKey;
  role: UserRole;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onOpenBusiness: (id: string) => void;
  onOpenEnquiry: (id: string) => void;
  onOpenOpportunities: () => void;
  onOpenConversation: (id: string) => void;
  businessProfile: BusinessProfileData | null;
  jobSeekerProfile: JobSeekerProfileData | null;
  jobSwipeCreditsUsed: number;
  onJobSwipe: () => void;
  onTrustAction: (action: () => void) => void;
  onVerifyBusiness: () => void;
}) {
  switch (tab) {
    case 'enquiries':
      return <EnquiriesScreen role={role} onOpenEnquiry={onOpenEnquiry} onCreateEnquiry={() => onTrustAction(() => undefined)} />;
    case 'inbox':
      return <InboxScreen role={role} onOpenConversation={onOpenConversation} />;
    case 'profile':
      return <ProfileScreen role={role} businessProfile={businessProfile} jobSeekerProfile={jobSeekerProfile} onVerifyBusiness={onVerifyBusiness} />;
    case 'discover':
    default:
      return (
        <DiscoverScreen
          query={query}
          role={role}
          jobSeekerProfile={jobSeekerProfile}
          jobSwipeCreditsUsed={jobSwipeCreditsUsed}
          onJobSwipe={onJobSwipe}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
          onOpenBusiness={onOpenBusiness}
          onOpenEnquiry={onOpenEnquiry}
          onOpenOpportunities={onOpenOpportunities}
        />
      );
  }
}
