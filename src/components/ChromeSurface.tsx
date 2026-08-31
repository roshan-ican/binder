import { useEffect, useId, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { motion, radius } from '../theme';

type ChromeIntensity = 'soft' | 'strong';

const strongStops = [
  ['0%', '#7A7875'],
  ['8%', '#F7F4EF'],
  ['17%', '#A7A29E'],
  ['29%', '#FFFFFF'],
  ['42%', '#8A8783'],
  ['54%', '#DCD7D1'],
  ['66%', '#6E6C69'],
  ['78%', '#F1EEE9'],
  ['90%', '#A09D99'],
  ['100%', '#E8E3DE'],
] as const;

const softStops = [
  ['0%', '#565452'],
  ['12%', '#BDB8B3'],
  ['28%', '#F1EDE8'],
  ['45%', '#898681'],
  ['62%', '#CEC8C2'],
  ['78%', '#676562'],
  ['100%', '#D8D2CC'],
] as const;

const brushedBands = [5, 9, 13, 24, 31, 38, 47, 53, 59, 68, 76, 84, 91];

export function ChromeSurface({
  borderRadius = radius.md,
  intensity = 'strong',
  style,
  animated = true,
}: {
  borderRadius?: number;
  intensity?: ChromeIntensity;
  style?: ViewStyle;
  animated?: boolean;
}) {
  const rawId = useId().replace(/:/g, '');
  const gradientId = `chrome-${rawId}`;
  const shineId = `chrome-shine-${rawId}`;
  const waterId = `chrome-water-${rawId}`;
  const floatId = `chrome-float-${rawId}`;
  const stops = intensity === 'strong' ? strongStops : softStops;
  const drift = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return undefined;

    drift.setValue(0);
    float.setValue(0);
    const driftLoop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: motion.water,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: motion.water * 0.58,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: motion.water * 0.58,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );

    driftLoop.start();
    floatLoop.start();
    return () => {
      driftLoop.stop();
      floatLoop.stop();
    };
  }, [animated, drift, float]);

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, 72],
  });
  const counterTranslateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [58, -58],
  });
  const floatTranslateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -5],
  });
  const floatScaleX = float.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: intensity === 'strong' ? '#D8D4CF' : '#9E9994',
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {stops.map(([offset, color]) => (
              <Stop key={`${offset}-${color}`} offset={offset} stopColor={color} />
            ))}
          </LinearGradient>
          <LinearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.62} />
            <Stop offset="34%" stopColor="#FFFFFF" stopOpacity={0.12} />
            <Stop offset="58%" stopColor="#000000" stopOpacity={0.1} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.26} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${shineId})`} />
        {brushedBands.map((x, index) => (
          <Rect
            key={x}
            x={`${x}%`}
            y="0"
            width={index % 3 === 0 ? '1.2%' : '0.7%'}
            height="100%"
            fill={index % 2 === 0 ? '#FFFFFF' : '#000000'}
            opacity={index % 2 === 0 ? 0.22 : 0.1}
          />
        ))}
      </Svg>
      {animated ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-40%',
            width: '180%',
            opacity: intensity === 'strong' ? 0.9 : 0.58,
            transform: [{ translateX }],
          }}
        >
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={waterId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                <Stop offset="24%" stopColor="#FFFFFF" stopOpacity={0.14} />
                <Stop offset="44%" stopColor="#FFFFFF" stopOpacity={0.02} />
                <Stop offset="62%" stopColor="#000000" stopOpacity={0.1} />
                <Stop offset="82%" stopColor="#FFFFFF" stopOpacity={0.22} />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${waterId})`} />
            <Rect x="14%" y="0" width="10%" height="100%" fill="#FFFFFF" opacity={0.12} />
            <Rect x="46%" y="0" width="16%" height="100%" fill="#000000" opacity={0.08} />
            <Rect x="76%" y="0" width="9%" height="100%" fill="#FFFFFF" opacity={0.16} />
          </Svg>
        </Animated.View>
      ) : null}
      {animated ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: '-18%',
            bottom: '-18%',
            left: '-55%',
            width: '210%',
            opacity: intensity === 'strong' ? 0.72 : 0.48,
            transform: [
              { translateX: counterTranslateX },
              { translateY: floatTranslateY },
              { scaleX: floatScaleX },
            ],
          }}
        >
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={floatId} x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                <Stop offset="20%" stopColor="#FFFFFF" stopOpacity={0.08} />
                <Stop offset="34%" stopColor="#000000" stopOpacity={0.12} />
                <Stop offset="48%" stopColor="#FFFFFF" stopOpacity={0.24} />
                <Stop offset="62%" stopColor="#FFFFFF" stopOpacity={0.06} />
                <Stop offset="78%" stopColor="#000000" stopOpacity={0.1} />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="18%" width="100%" height="64%" fill={`url(#${floatId})`} />
            <Rect x="32%" y="0" width="14%" height="100%" fill="#FFFFFF" opacity={0.1} />
            <Rect x="58%" y="0" width="20%" height="100%" fill="#000000" opacity={0.07} />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}
