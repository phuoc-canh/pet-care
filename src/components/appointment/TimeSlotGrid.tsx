import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, PressableScale, Skeleton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, spacing } from '@/theme/theme';

interface SlotProps {
  time: string;
  busy: boolean;
  selected: boolean;
  onSelect: (time: string) => void;
}

const Slot = memo(function Slot({ time, busy, selected, onSelect }: SlotProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => {
    haptic.selection();
    onSelect(time);
  }, [onSelect, time]);
  return (
    <PressableScale
      onPress={handlePress}
      disabled={busy}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: busy }}
      accessibilityLabel={busy ? t('appointment.slotBusyLabel', { time }) : time}
      style={[styles.slot, selected && styles.selected, busy && styles.busy]}
    >
      <AppText
        variant="bodyStrong"
        tone={selected ? 'inverse' : busy ? 'muted' : 'navy'}
        style={busy ? styles.busyText : undefined}
      >
        {time}
      </AppText>
      {busy ? (
        <AppText variant="caption" tone="muted">
          {t('appointment.slotBusy')}
        </AppText>
      ) : null}
    </PressableScale>
  );
});

export interface TimeSlotGridProps {
  slots: readonly string[];
  busy: readonly string[];
  value: string | null;
  loading?: boolean;
  onChange: (time: string) => void;
}

/** Lưới giờ 3 cột — giờ đã kín / đã qua thì disable. */
function TimeSlotGridBase({ slots, busy, value, loading = false, onChange }: TimeSlotGridProps) {
  if (loading) {
    return (
      <View style={styles.grid}>
        {slots.map((s) => (
          <View key={s} style={styles.cell}>
            <Skeleton height={56} rounded={radius.input} />
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {slots.map((s) => (
        <View key={s} style={styles.cell}>
          <Slot time={s} busy={busy.includes(s)} selected={value === s} onSelect={onChange} />
        </View>
      ))}
    </View>
  );
}

export const TimeSlotGrid = memo(TimeSlotGridBase);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xxs },
  cell: { width: '33.333%', padding: spacing.xxs },
  slot: {
    minHeight: layout.minTouch + 12,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  busy: { backgroundColor: colors.background, borderStyle: 'dashed' },
  busyText: { textDecorationLine: 'line-through' },
});
