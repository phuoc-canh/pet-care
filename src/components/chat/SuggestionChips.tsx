import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, PressableScale } from '@/components/ui';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, shadow, spacing } from '@/theme/theme';

interface ChipProps {
  text: string;
  index: number;
  onPick: (text: string) => void;
}

const SuggestionChip = memo(function SuggestionChip({ text, index, onPick }: ChipProps) {
  const handlePress = useCallback(() => {
    haptic.selection();
    onPick(text);
  }, [onPick, text]);
  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).duration(260)}>
      <PressableScale onPress={handlePress} accessibilityRole="button" accessibilityLabel={text} style={styles.chip}>
        <AppText variant="body" style={styles.text}>
          {text}
        </AppText>
        <Ionicons name="arrow-up-circle" size={22} color={colors.primary} />
      </PressableScale>
    </Animated.View>
  );
});

/** Câu hỏi gợi ý — bấm là gửi luôn. */
function SuggestionChipsBase({ suggestions, onPick }: { suggestions: string[]; onPick: (text: string) => void }) {
  return (
    <View style={styles.list}>
      {suggestions.map((s, i) => (
        <SuggestionChip key={s} text={s} index={i} onPick={onPick} />
      ))}
    </View>
  );
}

export const SuggestionChips = memo(SuggestionChipsBase);

const styles = StyleSheet.create({
  list: { gap: spacing.xs, alignSelf: 'stretch' },
  chip: {
    minHeight: layout.minTouch + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  text: { flex: 1, fontWeight: '600', color: colors.navy },
});
