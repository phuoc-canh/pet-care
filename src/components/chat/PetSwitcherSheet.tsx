import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { AppText, Avatar, PressableScale } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/hooks/useHaptic';
import { colors, layout, radius, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';

interface RowProps {
  pet: Pet;
  selected: boolean;
  onPick: (id: string) => void;
}

const Row = memo(function Row({ pet, selected, onPick }: RowProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => onPick(pet.id), [onPick, pet.id]);
  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={pet.name}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <Avatar species={pet.species} size={44} />
      <View style={styles.rowText}>
        <AppText variant="bodyStrong">{pet.name}</AppText>
        <AppText variant="caption" tone="secondary">
          {t(`pet.species.${pet.species}`)} · {pet.breed}
        </AppText>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
    </PressableScale>
  );
});

export interface PetSwitcherSheetProps {
  visible: boolean;
  pets: Pet[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Có thì hiện dòng "Xóa cuộc trò chuyện" (thay cho nút 🗑 ở góc trên phải header). */
  onClear?: () => void;
}

/** Bottom sheet chọn thú cưng ngay tại header chat. */
function PetSwitcherSheetBase({ visible, pets, selectedId, onSelect, onClose, onClear }: PetSwitcherSheetProps) {
  const { t } = useTranslation();
  const pick = useCallback(
    (id: string) => {
      if (id !== selectedId) haptic.selection();
      onSelect(id);
      onClose();
    },
    [onClose, onSelect, selectedId],
  );

  return (
    <BottomSheet visible={visible} title={t('chat.pickPetTitle')} onClose={onClose}>
      <View style={styles.list}>
        {pets.map((p) => (
          <Row key={p.id} pet={p} selected={p.id === selectedId} onPick={pick} />
        ))}
      </View>
      {onClear ? (
        <PressableScale
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={t('chat.clear')}
          style={styles.clearRow}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <AppText variant="bodyStrong" tone="danger">
            {t('chat.clear')}
          </AppText>
        </PressableScale>
      ) : null}
    </BottomSheet>
  );
}

export const PetSwitcherSheet = memo(PetSwitcherSheetBase);

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  row: {
    minHeight: layout.minTouch + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  rowSelected: { borderColor: colors.primary },
  clearRow: {
    minHeight: layout.minTouch + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    borderRadius: radius.button,
    backgroundColor: colors.dangerSoft,
  },
  rowText: { flex: 1, gap: 2 },
});
