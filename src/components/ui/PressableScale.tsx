import { memo, useCallback } from 'react';
import { type GestureResponderEvent, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/theme/theme';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/** Pressable có hiệu ứng scale nhẹ (chạy trên UI thread bằng reanimated). */
function PressableScaleBase({ style, scaleTo = motion.pressScale, onPressIn, onPressOut, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handleIn = useCallback(
    (e: GestureResponderEvent) => {
      scale.set(withSpring(scaleTo, motion.spring));
      onPressIn?.(e);
    },
    [onPressIn, scale, scaleTo],
  );
  const handleOut = useCallback(
    (e: GestureResponderEvent) => {
      scale.set(withSpring(1, motion.spring));
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  return (
    <Pressable onPressIn={handleIn} onPressOut={handleOut} {...rest}>
      {(state) => (
        <Animated.View style={[style, animatedStyle]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export const PressableScale = memo(PressableScaleBase);
