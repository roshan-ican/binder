import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabs, BusinessTrustGate, type BusinessMatchItem, type TabKey } from '../components';
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
// Job-seeker-only screen disabled — Binder is business-only for now.
// import { JobSeekerOnboardingScreen } from '../screens/JobSeekerOnboardingScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { OpportunitiesScreen } from '../screens/OpportunitiesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { EnquiryFlowScreen } from '../screens/EnquiryFlowScreen';
import { SwapDetailScreen } from '../screens/SwapDetailScreen';
import { SwapListingFlowScreen } from '../screens/SwapListingFlowScreen';
import { SwapsScreen } from '../screens/SwapsScreen';
import { BusinessDocumentsScreen, BusinessProfileEditorScreen, SavedBusinessesScreen, TeamScreen } from '../screens/BusinessManagementScreens';
// Job-seeker-only screens disabled — Binder is business-only for now.
// import { ApplicationDetailScreen, ApplyFlowScreen, CandidateDocumentsScreen, CandidateProfileEditorScreen, JobDetailScreen, SavedJobsScreen } from '../screens/JobFlowScreens';
import { AccountPrivacyScreen, ConversationDetailsScreen, NotificationPreferencesScreen, SavedSearchesScreen, SettingsHubScreen, SignInScreen, StateGalleryScreen } from '../screens/SharedScreens';

/**
 * A deliberately small navigator. The prototype covers the three V1 journeys
 * without pulling in a navigation library — swap this for expo-router or
 * react-navigation when the real routes land.
 */
type Route =
  | { name: 'welcome' }
  | { name: 'business-onboarding' }
  | { name: 'business-verification'; source: 'onboarding' | 'gate' | 'profile' }
  // Job-seeker-only routes disabled — Binder is business-only for now.
  // | { name: 'job-seeker-onboarding' }
  | { name: 'tabs' }
  | { name: 'search' }
  | { name: 'business'; id: string }
  | { name: 'enquiry'; id: string }
  | { name: 'opportunities' }
  | { name: 'conversation'; id: string }
  | { name: 'sign-in' }
  | { name: 'enquiry-compose'; mode: 'create' | 'edit' }
  | { name: 'swap'; id: string }
  | { name: 'swap-compose'; mode: 'create' | 'edit' }
  | { name: 'saved-businesses' }
  | { name: 'business-profile-edit' }
  | { name: 'business-profile-preview' }
  | { name: 'business-documents' }
  | { name: 'team' }
  // Job-seeker-only routes disabled — Binder is business-only for now.
  // | { name: 'job'; id: string }
  // | { name: 'apply'; id: string }
  // | { name: 'saved-jobs' }
  // | { name: 'application' }
  // | { name: 'candidate-profile-edit' }
  // | { name: 'candidate-profile-preview' }
  // | { name: 'candidate-documents' }
  | { name: 'settings' }
  | { name: 'saved-searches' }
  | { name: 'notifications' }
  | { name: 'account' }
  | { name: 'conversation-details'; member: string }
  | { name: 'states' };

const sessionStorageKey = 'binder.session.v1';

type StoredSession = {
  role: UserRole;
};

export function AppNavigator() {
  const insets = useSafeAreaInsets();
  const [stack, setStack] = useState<Route[]>([{ name: 'welcome' }]);
  const [sessionReady, setSessionReady] = useState(false);
  const [tab, setTab] = useState<TabKey>('match');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<UserRole>('business');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileData | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfileData | null>(null);
  const [jobSwipeCreditsUsed, setJobSwipeCreditsUsed] = useState(0);
  const [businessSwipeCreditsUsed, setBusinessSwipeCreditsUsed] = useState(0);
  const [trustGateOpen, setTrustGateOpen] = useState(false);
  const pendingTrustAction = useRef<null | (() => void)>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(sessionStorageKey);
        if (!stored) return;
        const session = JSON.parse(stored) as StoredSession;
        if (session.role === 'business' || session.role === 'job-seeker') {
          setRole(session.role);
          setStack([{ name: 'tabs' }]);
        }
      } catch {
        // A malformed or unavailable local session should never block entry.
      } finally {
        setSessionReady(true);
      }
    };
    void restoreSession();
  }, []);

  const route = stack[stack.length - 1];
  const push = (next: Route) => setStack((current) => [...current, next]);
  const pop = () => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  const reset = (next: Route) => setStack([next]);
  const persistSession = (nextRole: UserRole) => {
    setRole(nextRole);
    void AsyncStorage.setItem(sessionStorageKey, JSON.stringify({ role: nextRole } satisfies StoredSession));
  };
  const clearSession = () => {
    void AsyncStorage.removeItem(sessionStorageKey);
  };
  const runTrustAction = (action: () => void) => {
    if (role !== 'business' || businessProfile?.verificationStatus === 'verified') return action();
    pendingTrustAction.current = action;
    setTrustGateOpen(true);
  };

  if (!sessionReady) {
    return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;
  }

  if (route.name === 'welcome') {
    return (
      <WelcomeScreen
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          // Job-seeker path disabled — Binder is business-only for now.
          // reset({ name: nextRole === 'business' ? 'business-onboarding' : 'job-seeker-onboarding' });
          reset({ name: 'business-onboarding' });
        }}
        onExplore={() => { setTab('discover'); reset({ name: 'tabs' }); }}
        onSignIn={() => push({ name: 'sign-in' })}
      />
    );
  }

  if (route.name === 'sign-in') {
    return <SignInScreen onBack={pop} onContinue={(nextRole) => { persistSession(nextRole); setTab('match'); reset({ name: 'tabs' }); }} />;
  }

  if (route.name === 'business-onboarding') {
    return <BusinessOnboardingScreen onComplete={(profile) => { setBusinessProfile(profile); reset({ name: 'business-verification', source: 'onboarding' }); }} />;
  }

  if (route.name === 'business-verification' && businessProfile) {
    const finish = () => {
      if (route.source === 'onboarding') { persistSession(role); setTab('match'); reset({ name: 'tabs' }); return; }
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

  // Job-seeker path disabled — Binder is business-only for now.
  // if (route.name === 'job-seeker-onboarding') {
  //   return (
  //     <JobSeekerOnboardingScreen
  //       onComplete={setJobSeekerProfile}
  //       onExplore={() => {
  //         persistSession('job-seeker');
  //         setTab('match');
  //         reset({ name: 'tabs' });
  //       }}
  //     />
  //   );
  // }

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
            onOpenSwap={(id) => push({ name: 'swap', id })}
          />
        );
      case 'enquiry':
        return (
          <EnquiryDetailScreen
            enquiryId={route.id}
            onBack={pop}
            onOpenBusiness={(id) => push({ name: 'business', id })}
            onEdit={() => push({ name: 'enquiry-compose', mode: 'edit' })}
          />
        );
      case 'opportunities':
        return <OpportunitiesScreen role={role} onBack={pop} />;
      case 'conversation':
          return <ConversationScreen role={role} conversationId={route.id} onBack={pop} onTrustAction={runTrustAction} onDetails={(member) => push({ name: 'conversation-details', member })} />;
      case 'conversation-details':
        return <ConversationDetailsScreen name={route.member} onBack={pop} />;
      case 'enquiry-compose':
        return <EnquiryFlowScreen mode={route.mode} onBack={pop} onDone={() => { setTab('enquiries'); reset({ name: 'tabs' }); }} />;
      case 'swap':
        return (
          <SwapDetailScreen
            id={route.id}
            onBack={pop}
            onPropose={(conversationId) => runTrustAction(() => push({ name: 'conversation', id: conversationId }))}
            onEdit={() => push({ name: 'swap-compose', mode: 'edit' })}
          />
        );
      case 'swap-compose':
        return <SwapListingFlowScreen mode={route.mode} onBack={pop} onDone={() => { setTab('swaps'); reset({ name: 'tabs' }); }} />;
      case 'saved-businesses':
        return <SavedBusinessesScreen onBack={pop} onOpenBusiness={(id) => push({ name: 'business', id })} />;
      case 'business-profile-edit':
        return <BusinessProfileEditorScreen profile={businessProfile} onBack={pop} onPreview={() => push({ name: 'business-profile-preview' })} onSave={(profile) => { setBusinessProfile(profile); pop(); }} />;
      case 'business-profile-preview':
        return <BusinessProfileEditorScreen profile={businessProfile} previewOnly onBack={pop} />;
      case 'business-documents':
        return <BusinessDocumentsScreen onBack={pop} />;
      case 'team':
        return <TeamScreen onBack={pop} />;
      // Job-seeker-only routes disabled — Binder is business-only for now.
      // case 'job':
      //   return <JobDetailScreen jobId={route.id} onBack={pop} onApply={(id) => push({ name: 'apply', id })} />;
      // case 'apply':
      //   return <ApplyFlowScreen jobId={route.id} onBack={pop} onDone={() => push({ name: 'application' })} />;
      // case 'saved-jobs':
      //   return <SavedJobsScreen onBack={pop} onOpenJob={(id) => push({ name: 'job', id })} />;
      // case 'application':
      //   return <ApplicationDetailScreen onBack={pop} onOpenConversation={() => push({ name: 'conversation', id: 'job-abc-leather' })} />;
      // case 'candidate-profile-edit':
      //   return <CandidateProfileEditorScreen profile={jobSeekerProfile} onBack={pop} onPreview={() => push({ name: 'candidate-profile-preview' })} onSave={(profile) => { setJobSeekerProfile(profile); pop(); }} />;
      // case 'candidate-profile-preview':
      //   return <CandidateProfileEditorScreen profile={jobSeekerProfile} previewOnly onBack={pop} />;
      // case 'candidate-documents':
      //   return <CandidateDocumentsScreen onBack={pop} />;
      case 'settings':
        return <SettingsHubScreen role={role} onBack={pop} onOpen={(key) => {
          // Job-seeker branches disabled — Binder is business-only for now.
          // if (key === 'saved') push({ name: role === 'business' ? 'saved-businesses' : 'saved-jobs' });
          // else if (key === 'documents') push({ name: role === 'business' ? 'business-documents' : 'candidate-documents' });
          if (key === 'saved') push({ name: 'saved-businesses' });
          else if (key === 'documents') push({ name: 'business-documents' });
          else if (key === 'team') push({ name: 'team' });
          else if (key === 'searches') push({ name: 'saved-searches' });
          else if (key === 'notifications') push({ name: 'notifications' });
          else push({ name: 'account' });
        }} />;
      case 'saved-searches':
        return <SavedSearchesScreen role={role} onBack={pop} />;
      case 'notifications':
        return <NotificationPreferencesScreen onBack={pop} />;
      case 'account':
        return <AccountPrivacyScreen onBack={pop} onSignOut={() => { clearSession(); reset({ name: 'welcome' }); }} />;
      case 'states':
        return <StateGalleryScreen onBack={pop} />;
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
            onCreateEnquiry={() => runTrustAction(() => push({ name: 'enquiry-compose', mode: 'create' }))}
            onOpenSwap={(id) => push({ name: 'swap', id })}
            onCreateSwap={() => runTrustAction(() => push({ name: 'swap-compose', mode: 'create' }))}
            onManageSwaps={() => { setTab('swaps'); reset({ name: 'tabs' }); }}
            // Job-seeker routes disabled — Binder is business-only for now.
            // onOpenJob={(id) => push({ name: 'job', id })}
            // onOpenApplication={() => push({ name: 'application' })}
            onOpenJob={() => {}}
            onOpenApplication={() => {}}
            // onEditProfile={() => push({ name: role === 'business' ? 'business-profile-edit' : 'candidate-profile-edit' })}
            // onPreviewProfile={() => push({ name: role === 'business' ? 'business-profile-preview' : 'candidate-profile-preview' })}
            onEditProfile={() => push({ name: 'business-profile-edit' })}
            onPreviewProfile={() => push({ name: 'business-profile-preview' })}
            onManage={() => push({ name: 'settings' })}
            businessProfile={businessProfile}
            jobSeekerProfile={jobSeekerProfile}
            jobSwipeCreditsUsed={jobSwipeCreditsUsed}
            businessSwipeCreditsUsed={businessSwipeCreditsUsed}
            onJobSwipe={() => setJobSwipeCreditsUsed((count) => Math.min(count + 1, 10))}
            onBusinessDecision={(decision, item) => {
              setBusinessSwipeCreditsUsed((count) => Math.min(count + 1, 10));
              if (decision === 'interested') {
                runTrustAction(() => item.kind === 'business'
                  ? push({ name: 'business', id: item.business.id })
                  : push({ name: 'enquiry', id: item.enquiry.id }));
              }
            }}
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
  onCreateEnquiry,
  onOpenSwap,
  onCreateSwap,
  onManageSwaps,
  onOpenJob,
  onOpenApplication,
  onEditProfile,
  onPreviewProfile,
  onManage,
  businessProfile,
  jobSeekerProfile,
  jobSwipeCreditsUsed,
  businessSwipeCreditsUsed,
  onJobSwipe,
  onBusinessDecision,
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
  onCreateEnquiry: () => void;
  onOpenSwap: (id: string) => void;
  onCreateSwap: () => void;
  onManageSwaps: () => void;
  onOpenJob: (id: string) => void;
  onOpenApplication: () => void;
  onEditProfile: () => void;
  onPreviewProfile: () => void;
  onManage: () => void;
  businessProfile: BusinessProfileData | null;
  jobSeekerProfile: JobSeekerProfileData | null;
  jobSwipeCreditsUsed: number;
  businessSwipeCreditsUsed: number;
  onJobSwipe: () => void;
  onBusinessDecision: (decision: 'pass' | 'interested', item: BusinessMatchItem) => void;
  onTrustAction: (action: () => void) => void;
  onVerifyBusiness: () => void;
}) {
  switch (tab) {
    case 'match':
      return <MatchScreen role={role} businessProfile={businessProfile} jobSeekerProfile={jobSeekerProfile} businessSwipeCreditsUsed={businessSwipeCreditsUsed} jobSwipeCreditsUsed={jobSwipeCreditsUsed} onBusinessDecision={onBusinessDecision} onJobSwipe={onJobSwipe} onOpenBusiness={onOpenBusiness} onOpenEnquiry={onOpenEnquiry} onOpenJob={onOpenJob} />;
    case 'enquiries':
      return <EnquiriesScreen role={role} onOpenEnquiry={onOpenEnquiry} onCreateEnquiry={onCreateEnquiry} onOpenJob={onOpenJob} onOpenApplication={onOpenApplication} />;
    case 'swaps':
      return <SwapsScreen onOpenSwap={onOpenSwap} onCreateSwap={onCreateSwap} />;
    case 'inbox':
      return <InboxScreen role={role} onOpenConversation={onOpenConversation} />;
    case 'profile':
      return <ProfileScreen role={role} businessProfile={businessProfile} jobSeekerProfile={jobSeekerProfile} onVerifyBusiness={onVerifyBusiness} onEditProfile={onEditProfile} onPreviewProfile={onPreviewProfile} onManage={onManage} onManageSwaps={onManageSwaps} />;
    case 'discover':
    default:
      return (
        <DiscoverScreen
          query={query}
          role={role}
          jobSeekerProfile={jobSeekerProfile}
          jobSwipeCreditsUsed={jobSwipeCreditsUsed}
          onJobSwipe={onJobSwipe}
          onOpenJob={onOpenJob}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
          onOpenBusiness={onOpenBusiness}
          onOpenEnquiry={onOpenEnquiry}
          onOpenOpportunities={onOpenOpportunities}
        />
      );
  }
}
