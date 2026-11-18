import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { strings } from '@/constants/strings';
import { colors, shadow, spacing } from '@/theme/theme';

function Dot({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + progress.get() * 0.65,
    transform: [{ translateY: -3 * progress.get() }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

function useBounce(delay: number) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
            withTiming(0, { duration: 240 }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(v);
  }, [delay, v]);
  return v;
}

/** 3 chấm nhún khi đang chờ token đầu tiên (animation chạy trên UI thread). */
function TypingIndicatorBase() {
  const a = useBounce(0);
  const b = useBounce(150);
  const c = useBounce(300);
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.row}>
      <View style={styles.bubble} accessible accessibilityLabel={strings.chat.typing} accessibilityLiveRegion="polite">
        <Dot progress={a} />
        <Dot progress={b} />
        <Dot progress={c} />
      </View>
    </Animated.View>
  );
}

export const TypingIndicator = memo(TypingIndicatorBase);

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xxs, alignItems: 'flex-start' },
  bubble: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
