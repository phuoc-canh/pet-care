import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguagePills } from '@/components/common/LanguageSheet';
import { AppText, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/hooks/useHaptic';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppStore } from '@/store/app.store';
import { colors, radius, spacing } from '@/theme/theme';

interface Slide {
  key: 'slide1' | 'slide2' | 'slide3';
  emoji: string;
}

const SLIDES: Slide[] = [
  { key: 'slide1', emoji: '🐾' },
  { key: 'slide2', emoji: '💬' },
  { key: 'slide3', emoji: '📅' },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Slide>);

function Dot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const progress = scrollX.get() / width;
    const w = interpolate(progress, [index - 1, index, index + 1], [8, 24, 8], 'clamp');
    const opacity = interpolate(progress, [index - 1, index, index + 1], [0.35, 1, 0.35], 'clamp');
    return { width: w, opacity };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function SlideTitle({ title, highlight }: { title: string; highlight: string }) {
  const idx = title.indexOf(highlight);
  if (idx < 0) return <AppText variant="heading" tone="navy" center>{title}</AppText>;
  return (
    <AppText variant="heading" tone="navy" center accessibilityRole="header">
      {title.slice(0, idx)}
      <AppText variant="heading" tone="primary">
        {highlight}
      </AppText>
      {title.slice(idx + highlight.length)}
    </AppText>
  );
}

export default function Onboarding() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const { language, setLanguage } = useLanguage();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const slides = SLIDES;
  const isLast = index === slides.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.set(e.contentOffset.x);
  });

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width)),
    [width],
  );

  const finish = useCallback(() => {
    haptic.success();
    // Stack.Protected ở root layout tự chuyển sang tabs khi cờ này bật.
    completeOnboarding();
  }, [completeOnboarding]);

  const next = useCallback(() => {
    if (isLast) return finish();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  }, [finish, index, isLast]);

  const renderItem = useCallback<ListRenderItem<Slide>>(
    ({ item }) => (
      <View style={[styles.slide, { width }]}>
        <LinearGradient colors={colors.heroGradient} style={styles.illustration}>
          <Text style={styles.emoji} allowFontScaling={false}>
            {item.emoji}
          </Text>
        </LinearGradient>
        <SlideTitle title={t(`onboarding.${item.key}.title`)} highlight={t(`onboarding.${item.key}.highlight`)} />
        <AppText variant="bodyStrong" tone="secondary" center style={styles.body}>
          {t(`onboarding.${item.key}.body`)}
        </AppText>
        {item.key === 'slide1' ? (
          <View style={styles.language}>
            <LanguagePills value={language} onSelect={setLanguage} />
          </View>
        ) : null}
      </View>
    ),
    [language, setLanguage, t, width],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.topRow}>
        <AppText variant="subtitle" tone="primary">
          🐾 {t('common.appName')}
        </AppText>
      </View>

      <AnimatedFlatList
        ref={listRef}
        data={slides}
        extraData={language}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        style={styles.list}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <Dot key={s.key} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Button title={isLast ? t('onboarding.start') : t('onboarding.next')} onPress={next} />
        {/* "Bỏ qua" ở dưới (không ở góc trên phải — vùng iOS giữ cho cử chỉ hệ thống). */}
        <View style={styles.skipSlot}>
          {!isLast ? <Button title={t('onboarding.skip')} variant="ghost" onPress={finish} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  skipSlot: { height: 52, marginTop: -spacing.sm },
  list: { flex: 1 },
  language: { marginTop: spacing.md },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  illustration: {
    width: 220,
    height: 220,
    borderRadius: radius.card * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 96, lineHeight: 116 },
  body: { maxWidth: 320, fontWeight: '400' },
  footer: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
});
