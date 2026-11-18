import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, spacing } from '@/theme/theme';

import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ChipProps<T extends string> {
  value: T;
  label: string;
  selected: boolean;
  onToggle: (value: T) => void;
  leading?: string;
}

/** Chip chọn được (loài / tính cách). Generic để giữ type của value. */
function ChipBase<T extends string>({ value, label, selected, onToggle, leading }: ChipProps<T>) {
  const handlePress = useCallback(() => {
    haptic.selection();
    onToggle(value);
  }, [onToggle, value]);

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      <AppText variant="body" tone={selected ? 'inverse' : 'default'} style={styles.label}>
        {leading ? `${leading}  ` : ''}
        {label}
      </AppText>
    </PressableScale>
  );
}

export const Chip = memo(ChipBase) as typeof ChipBase;

const styles = StyleSheet.create({
  chip: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontWeight: '600' },
});
