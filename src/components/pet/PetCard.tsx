import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Card, Pill, Skeleton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';
import { formatAge, formatWeight } from '@/utils/format';

export interface PetCardProps {
  pet: Pet;
  onPress?: (id: string) => void;
  onPressIn?: (id: string) => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="bodyStrong" tone="navy" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

/** Card thông tin thú cưng: giống, tuổi, cân nặng, tính cách dạng pill. */
function PetCardBase({ pet, onPress, onPressIn }: PetCardProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => onPress?.(pet.id), [onPress, pet.id]);
  const handlePressIn = useCallback(() => onPressIn?.(pet.id), [onPressIn, pet.id]);

  return (
    <Card
      onPress={onPress ? handlePress : undefined}
      onPressIn={onPressIn ? handlePressIn : undefined}
      accessibilityLabel={`${pet.name}, ${t(`pet.species.${pet.species}`)} ${pet.breed}, ${formatAge(pet.ageYears)}, ${formatWeight(pet.weightKg)}`}
      accessibilityHint={t('pet.home.viewDetail')}
    >
      <Pill label={t('pet.home.profileTag')} icon="paw" />
      <View style={styles.header}>
        <Avatar species={pet.species} size={60} />
        <View style={styles.titleWrap}>
          <AppText variant="title" numberOfLines={1}>
            {pet.name}
          </AppText>
          <AppText variant="body" tone="secondary" numberOfLines={1}>
            {t(`pet.species.${pet.species}`)} · {pet.breed}
          </AppText>
        </View>
        {onPress ? <Ionicons name="chevron-forward" size={22} color={colors.textMuted} /> : null}
      </View>

      <View style={styles.stats}>
        <Stat label={t('pet.home.age')} value={formatAge(pet.ageYears)} />
        <View style={styles.divider} />
        <Stat label={t('pet.home.weight')} value={formatWeight(pet.weightKg)} />
      </View>

      <View style={styles.tags}>
        {pet.personalities.map((p) => (
          <Pill key={p} label={t(`pet.personality.${p}`)} tone="soft" />
        ))}
      </View>
    </Card>
  );
}

export const PetCard = memo(PetCardBase);

export function PetCardSkeleton() {
  return (
    <Card>
      <Skeleton width={70} height={22} rounded={radius.pill} />
      <View style={styles.header}>
        <Skeleton width={60} height={60} rounded={30} />
        <View style={styles.titleWrap}>
          <Skeleton width="50%" height={22} />
          <Skeleton width="70%" height={14} />
        </View>
      </View>
      <Skeleton height={64} rounded={radius.input} style={styles.skeletonStats} />
      <View style={styles.tags}>
        <Skeleton width={80} height={26} rounded={radius.pill} />
        <Skeleton width={70} height={26} rounded={radius.pill} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  titleWrap: { flex: 1, gap: spacing.xxs },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.input,
    paddingVertical: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  skeletonStats: { marginTop: spacing.md },
});
