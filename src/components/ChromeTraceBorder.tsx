import { useEffect, useId, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors, motion, radius, size } from '../theme';

type Edge = 'top' | 'right' | 'bottom' | 'left';

type Layout = {
  width: number;
  height: number;
};

type TraceTransform =
  | { translateX: Animated.AnimatedInterpolation<string | number> }
  | { translateY: Animated.AnimatedInterpolation<string | number> };

export function ChromeTraceBorder({
  borderRadius = radius.md,
  active = true,
}: {
  borderRadius?: number;
  active?: boolean;
}) {
  const rawId = useId().replace(/:/g, '');
  const topProgress = useRef(new Animated.Value(0)).current;
  const rightProgress = useRef(new Animated.Value(0.5)).current;
  const bottomProgress = useRef(new Animated.Value(0)).current;
  const leftProgress = useRef(new Animated.Value(0.5)).current;
  const [layout, setLayout] = useState<Layout>({ width: 0, height: 0 });

  useEffect(() => {
    if (!active) return undefined;

    const loops = [
      startTraceLoop(topProgress, 0),
      startTraceLoop(rightProgress, 0.5),
      startTraceLoop(bottomProgress, 0),
      startTraceLoop(leftProgress, 0.5),
    ];

    return () => loops.forEach((loop) => loop.stop());
  }, [active, bottomProgress, leftProgress, rightProgress, topProgress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const beamLength = Math.max(36, layout.width * 0.42);
  const verticalBeamLength = Math.max(24, layout.height * 0.72);
  const line = Math.max(2, size.hairline);

  return (
    <View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: size.hairline,
          borderColor: 'rgba(244,244,242,0.28)',
        },
      ]}
    >
      {layout.width > 0 && layout.height > 0 ? (
        <>
          <Trace
            id={`${rawId}-top`}
            edge="top"
            length={beamLength}
            thickness={line}
            transform={{
              translateX: topProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [layout.width, -beamLength],
              }),
            }}
          />
          <Trace
            id={`${rawId}-right`}
            edge="right"
            length={verticalBeamLength}
            thickness={line}
            transform={{
              translateY: rightProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [layout.height, -verticalBeamLength],
              }),
            }}
          />
          <Trace
            id={`${rawId}-bottom`}
            edge="bottom"
            length={beamLength}
            thickness={line}
            transform={{
              translateX: bottomProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [-beamLength, layout.width],
              }),
            }}
          />
          <Trace
            id={`${rawId}-left`}
            edge="left"
            length={verticalBeamLength}
            thickness={line}
            transform={{
              translateY: leftProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [-verticalBeamLength, layout.height],
              }),
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function startTraceLoop(value: Animated.Value, phase: number) {
  value.setValue(phase);

  const completeCurrentPass = Animated.sequence([
    Animated.timing(value, {
      toValue: 1,
      duration: Math.max(1, motion.trace * (1 - phase)),
      useNativeDriver: true,
      isInteraction: false,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
      isInteraction: false,
    }),
  ]);

  const fullPass = Animated.sequence([
    Animated.timing(value, {
      toValue: 1,
      duration: motion.trace,
      useNativeDriver: true,
      isInteraction: false,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
      isInteraction: false,
    }),
  ]);

  const loop = Animated.sequence([completeCurrentPass, Animated.loop(fullPass)]);
  loop.start();
  return loop;
}

function Trace({
  id,
  edge,
  length,
  thickness,
  transform,
}: {
  id: string;
  edge: Edge;
  length: number;
  thickness: number;
  transform: TraceTransform;
}) {
  const isHorizontal = edge === 'top' || edge === 'bottom';
  const gradient = `trace-${id}`;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: edge === 'top' ? 0 : undefined,
        right: edge === 'right' ? 0 : undefined,
        bottom: edge === 'bottom' ? 0 : undefined,
        left: edge === 'left' || isHorizontal ? 0 : undefined,
        width: isHorizontal ? length : thickness,
        height: isHorizontal ? thickness : length,
        transform: [transform],
      }}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient
            id={gradient}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? '100%' : '0%'}
            y2={isHorizontal ? '0%' : '100%'}
          >
            <Stop offset="0%" stopColor={colors.chrome[600]} stopOpacity={0} />
            <Stop offset="36%" stopColor={colors.chrome[100]} stopOpacity={0.18} />
            <Stop offset="72%" stopColor={colors.chrome[100]} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={colors.chrome[300]} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradient})`} />
      </Svg>
    </Animated.View>
  );
}
