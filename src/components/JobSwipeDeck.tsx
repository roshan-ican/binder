import { useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { JobOpportunity } from '../data/mock';
import { colors, radius, size, spacing } from '../theme';
import { Button } from './Button';
import { AnimatedPressable } from './AnimatedPressable';
import { Card } from './Card';
import { Chip } from './Chip';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Text } from './Text';
import { TrustBadge } from './TrustBadge';

type Decision = 'pass' | 'interested';

export function JobSwipeDeck({
  jobs,
  creditsUsed,
  creditLimit = 10,
  onDecision,
}: {
  jobs: JobOpportunity[];
  creditsUsed: number;
  creditLimit?: number;
  onDecision: (decision: Decision, job: JobOpportunity) => void;
}) {
  const [cardIndex, setCardIndex] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = screenHeight < 860;
  const locked = creditsUsed >= creditLimit;
  const currentJob = jobs[cardIndex % Math.max(jobs.length, 1)];
  const nextJob = jobs[(cardIndex + 1) % Math.max(jobs.length, 1)];

  const commit = (decision: Decision) => {
    if (!currentJob || locked) {
      setPremiumOpen(true);
      return;
    }

    const direction = decision === 'interested' ? 1 : -1;
    Animated.timing(position, {
      toValue: { x: direction * screenWidth * 1.25, y: 12 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCardIndex((value) => value + 1);
      onDecision(decision, currentJob);
      if (creditsUsed + 1 >= creditLimit) setPremiumOpen(true);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          if (!locked) position.setValue({ x: gesture.dx, y: gesture.dy * 0.12 });
        },
        onPanResponderRelease: (_, gesture) => {
          const projectedX = gesture.dx + gesture.vx * 120;
          if (projectedX > 110) commit('interested');
          else if (projectedX < -110) commit('pass');
          else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              damping: 20,
              stiffness: 220,
              mass: 0.9,
              velocity: gesture.vx,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            damping: 20,
            stiffness: 220,
            useNativeDriver: true,
          }).start();
        },
      }),
    [creditLimit, creditsUsed, currentJob, locked, onDecision, position, screenWidth],
  );

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });
  const passOpacity = position.x.interpolate({ inputRange: [-100, -32, 0], outputRange: [1, 0.35, 0], extrapolate: 'clamp' });
  const interestedOpacity = position.x.interpolate({ inputRange: [0, 32, 100], outputRange: [0, 0.35, 1], extrapolate: 'clamp' });

  if (!currentJob) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><Text variant="heading3">No jobs available yet.</Text></View>;
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: spacing[4], paddingTop: Math.max(insets.top, spacing[4]), gap: spacing[3] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="micro" tone="chrome">Binder matches</Text>
          <Text variant="heading2">Jobs for you</Text>
        </View>
        <Card style={{ paddingVertical: spacing[2], paddingHorizontal: spacing[3] }}>
          <Text variant="labelLarge" tone={locked ? 'warning' : 'chrome'}>{Math.max(creditLimit - creditsUsed, 0)} swipes left</Text>
        </Card>
      </View>

      <View style={{ flex: 1, minHeight: 0, paddingBottom: spacing[3] }}>
        {nextJob ? (
          <View style={{ position: 'absolute', inset: 8, top: 14, opacity: 0.55 }}>
            <JobSwipeCard job={nextJob} compact={compact} />
          </View>
        ) : null}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            inset: 0,
            transform: [...position.getTranslateTransform(), { rotate }],
          }}
        >
          <JobSwipeCard
            job={currentJob}
            compact={compact}
            actions={
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[8] }}>
                <DecisionButton kind="pass" onPress={() => commit('pass')} />
                <DecisionButton kind="interested" locked={locked} onPress={() => locked ? setPremiumOpen(true) : commit('interested')} />
              </View>
            }
          />
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: spacing[5], top: spacing[6], opacity: passOpacity, borderWidth: 2, borderColor: colors.chrome[500], borderRadius: radius.sm, padding: spacing[2] }}>
            <Text variant="heading3" tone="secondary">PASS</Text>
          </Animated.View>
          <Animated.View pointerEvents="none" style={{ position: 'absolute', right: spacing[5], top: spacing[6], opacity: interestedOpacity, borderWidth: 2, borderColor: colors.chrome[100], borderRadius: radius.sm, padding: spacing[2] }}>
            <Text variant="heading3" tone="chrome">INTERESTED</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <PremiumPrompt visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </View>
  );
}

function JobSwipeCard({ job, compact, actions }: { job: JobOpportunity; compact: boolean; actions?: React.ReactNode }) {
  return (
    <View style={{ flex: 1, borderRadius: radius.lg, backgroundColor: colors.bg.raised, borderWidth: size.hairline, borderColor: colors.border.strong, padding: spacing[5], overflow: 'hidden' }}>
      <View style={{ gap: spacing[2] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
          <Logo name={job.company} size={compact ? 'md' : 'lg'} />
          <View style={{ flex: 1, gap: spacing[1] }}>
            <Text variant="labelLarge">{job.company}</Text>
            <TrustBadge signal={job.trust} detail="company" />
          </View>
        </View>
        <Text variant="heading1">{job.title}</Text>
        <Text variant="heading3" tone="chrome">{job.salary}</Text>
        <Text variant="body" tone="secondary">{job.company} · {job.city}, {job.region}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] }}>
        <Chip label={job.workType} />
        <Chip label={job.fitNote} selected />
      </View>

      <Divider style={{ marginVertical: compact ? spacing[3] : spacing[5] }} />
      <Text variant="micro" tone="tertiary">Why this matches</Text>
      <View style={{ gap: spacing[2], marginTop: spacing[3] }}>
        {job.whyItFits.slice(0, compact ? 2 : 3).map((reason) => <Text key={reason} variant="body" tone="secondary">✓ {reason}</Text>)}
      </View>

      {!compact ? <View style={{ marginTop: spacing[6], gap: spacing[2] }}>
        <Text variant="micro" tone="tertiary">Role overview</Text>
        <Text variant="body" tone="secondary">
          Connect with {job.company} to learn about responsibilities, qualifications, and the interview process for this role.
        </Text>
      </View> : null}

      <View style={{ marginTop: 'auto', gap: spacing[3], paddingTop: spacing[3] }}>
        {actions}
      <Text variant="bodySmall" tone="tertiary" style={{ textAlign: 'center' }}>
        Swipe left to pass · Swipe right if interested
      </Text>
      </View>
    </View>
  );
}

function DecisionButton({
  kind,
  locked = false,
  onPress,
}: {
  kind: Decision;
  locked?: boolean;
  onPress: () => void;
}) {
  const interested = kind === 'interested';
  const color = interested ? colors.chrome[100] : colors.chrome[500];
  const label = interested ? (locked ? 'View premium' : 'Interested') : 'Pass';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      pressedScale={0.9}
      style={{
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: interested ? colors.bg.elevated : colors.bg.secondary,
        borderWidth: 2,
        borderColor: color,
        shadowColor: color,
        shadowOpacity: 0.22,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <Icon name={interested ? 'heart' : 'close'} size={30} color={color} />
    </AnimatedPressable>
  );
}

function PremiumPrompt({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' }}>
        <View style={{ backgroundColor: colors.bg.raised, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderWidth: size.hairline, borderColor: colors.border.strong, padding: spacing[6], paddingBottom: spacing[8], gap: spacing[5] }}>
          <View style={{ gap: spacing[2] }}>
            <Text variant="micro" tone="chrome">Binder Premium</Text>
            <Text variant="heading1">You’ve used today’s 10 swipes.</Text>
            <Text variant="body" tone="secondary">Upgrade to keep exploring matched jobs and unlock more opportunities.</Text>
          </View>
          <Button label="Explore premium" onPress={onClose} />
          <Button label="Maybe later" variant="tertiary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
