import { useRef } from "react";
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { motion } from "../theme";

type AnimatedPressableProps = PressableProps & {
  pressedScale?: number;
  wrapperStyle?: StyleProp<ViewStyle>;
};

/**
 * Native-driver press feedback for shared controls. Keep this to transform
 * changes so it stays cheap and does not trigger layout work.
 */
export function AnimatedPressable({
  disabled,
  onPressIn,
  onPressOut,
  pressedScale = 0.98,
  wrapperStyle,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: motion.tap,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled && pressedScale !== 1) animateScale(pressedScale);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (!disabled && pressedScale !== 1) animateScale(1);
    onPressOut?.(event);
  };

  return (
    <Animated.View style={[wrapperStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    </Animated.View>
  );
}
