import { memo, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText, PressableScale } from '@/components/ui';
import { BOOKING_DAYS } from '@/constants/appointment';
import { strings } from '@/constants/strings';
import { haptic } from '@/hooks/useHaptic';
import { colors, radius, shadow, spacing } from '@/theme/theme';
import { formatDateLong, toDateKey, weekdayShort } from '@/utils/format';

interface DayItem {
  key: string;
  weekday: string;
  day: number;
}

/** 7 ngày tới, bắt đầu từ hôm nay. */
export function nextDays(count = BOOKING_DAYS): DayItem[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return { key: toDateKey(d), weekday: i === 0 ? strings.appointment.today : weekdayShort(d), day: d.getDate() };
  });
}

const Day = memo(function Day({ item, selected, onSelect }: { item: DayItem; selected: boolean; onSelect: (k: string) => void }) {
  const handlePress = useCallback(() => {
    if (!selected) haptic.selection();
    onSelect(item.key);
  }, [item.key, onSelect, selected]);
  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={formatDateLong(item.key)}
      style={[styles.day, selected && styles.daySelected]}
    >
      <AppText variant="caption" tone={selected ? 'inverse' : 'secondary'} style={styles.weekday}>
        {item.weekday}
      </AppText>
      <AppText variant="title" tone={selected ? 'inverse' : 'navy'}>
        {item.day}
      </AppText>
    </PressableScale>
  );
});

export interface DateStripProps {
  value: string;
  onChange: (dateKey: string) => void;
}

function DateStripBase({ value, onChange }: DateStripProps) {
  const days = useMemo(() => nextDays(), []);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="radiogroup">
      {days.map((d) => (
        <Day key={d.key} item={d} selected={d.key === value} onSelect={onChange} />
      ))}
    </ScrollView>
  );
}

export const DateStrip = memo(DateStripBase);

const styles = StyleSheet.create({
  row: { gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.xxs },
  day: {
    width: 62,
    height: 76,
    borderRadius: radius.button + 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...shadow.soft,
  },
  daySelected: { backgroundColor: colors.primary },
  weekday: { fontWeight: '700' },
});
