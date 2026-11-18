import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { AppText, PressableScale } from '@/components/ui';
import { type Language, LANGUAGES, type LanguageOption } from '@/i18n/languages';
import { colors, layout, radius, spacing } from '@/theme/theme';

const Row = memo(function Row({
  option,
  selected,
  onPick,
}: {
  option: LanguageOption;
  selected: boolean;
  onPick: (code: Language) => void;
}) {
  const handlePress = useCallback(() => onPick(option.code), [onPick, option.code]);
  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={option.nativeName}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <Text style={styles.flag} allowFontScaling={false}>
        {option.flag}
      </Text>
      <AppText variant="bodyStrong" style={styles.flex}>
        {option.nativeName}
      </AppText>
      {selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
    </PressableScale>
  );
});

export interface LanguageSheetProps {
  visible: boolean;
  value: Language;
  onSelect: (code: Language) => void;
  onClose: () => void;
}

/** Bottom sheet chọn ngôn ngữ: 🇻🇳 Tiếng Việt · 🇺🇸 English · 🇰🇷 한국어. */
function LanguageSheetBase({ visible, value, onSelect, onClose }: LanguageSheetProps) {
  const { t } = useTranslation();
  const pick = useCallback(
    (code: Language) => {
      onSelect(code);
      onClose();
    },
    [onClose, onSelect],
  );

  return (
    <BottomSheet visible={visible} title={t('language.pick')} onClose={onClose}>
      <View style={styles.list} accessibilityRole="radiogroup">
        {LANGUAGES.map((option) => (
          <Row key={option.code} option={option} selected={option.code === value} onPick={pick} />
        ))}
      </View>
    </BottomSheet>
  );
}

export const LanguageSheet = memo(LanguageSheetBase);

/** Hàng chip chọn ngôn ngữ inline (dùng ở onboarding). */
function LanguagePillsBase({ value, onSelect }: { value: Language; onSelect: (code: Language) => void }) {
  return (
    <View style={styles.pills} accessibilityRole="radiogroup">
      {LANGUAGES.map((option) => {
        const selected = option.code === value;
        return (
          <PressableScale
            key={option.code}
            onPress={() => onSelect(option.code)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.nativeName}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={styles.pillFlag} allowFontScaling={false}>
              {option.flag}
            </Text>
            <AppText variant="caption" tone={selected ? 'inverse' : 'navy'} style={styles.pillText} numberOfLines={1}>
              {option.nativeName}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

export const LanguagePills = memo(LanguagePillsBase);

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  row: {
    minHeight: layout.minTouch + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  rowSelected: { borderColor: colors.primary },
  flag: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
  pill: {
    minHeight: layout.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillFlag: { fontSize: 16, lineHeight: 20 },
  pillText: { fontWeight: '700' },
});
