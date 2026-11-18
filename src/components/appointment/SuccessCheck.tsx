import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/theme';

const SIZE = 112;

/** Checkmark "bật" ra + vòng sóng lan tỏa khi đặt lịch thành công. */
function SuccessCheckBase() {
  const scale = useSharedValue(0);
  const check = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    scale.set(withSpring(1, { damping: 11, stiffness: 180 }));
    check.set(withDelay(180, withSpring(1, { damping: 12, stiffness: 220 })));
    ring.set(
      withDelay(
        250,
        withRepeat(withSequence(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })), 3),
      ),
    );
  }, [check, ring, scale]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: check.get(), transform: [{ scale: 0.4 + check.get() * 0.6 }, { rotate: `${(1 - check.get()) * -30}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - ring.get()), transform: [{ scale: 1 + ring.get() * 0.7 }] }));

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.circle, circleStyle]}>
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark" size={64} color={colors.white} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export const SuccessCheck = memo(SuccessCheckBase);

const styles = StyleSheet.create({
  wrap: { width: SIZE * 1.8, height: SIZE * 1.8, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.success },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
