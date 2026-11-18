import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuickActionCard } from '@/components/pet/QuickActionCard';
import { AppText, Skeleton } from '@/components/ui';
import { SERVICE_MAP } from '@/constants/appointment';
import { strings } from '@/constants/strings';
import { useAppointments } from '@/hooks/services/useAppointments';
import { colors, radius, spacing } from '@/theme/theme';
import { formatDateLong } from '@/utils/format';

interface UpcomingSummaryProps {
  petId: string;
  onPress: () => void;
}

/** Card "Lịch hẹn sắp tới" trên Home: lịch gần nhất của thú cưng đang chọn. */
function UpcomingSummaryBase({ petId, onPress }: UpcomingSummaryProps) {
  const { data, isPending } = useAppointments();
  const mine = useMemo(() => (data ?? []).filter((a) => a.petId === petId), [data, petId]);
  const next = mine[0];

  return (
    <QuickActionCard
      tag={strings.petHome.upcomingTag}
      title={strings.petHome.upcomingTitle}
      description={!isPending && !next ? strings.petHome.upcomingEmpty : undefined}
      icon="calendar"
      onPress={onPress}
    >
      {isPending ? (
        <Skeleton height={56} rounded={radius.input} style={styles.box} />
      ) : next ? (
        <View style={styles.box}>
          <View style={styles.iconWrap}>
            <Ionicons name={SERVICE_MAP[next.serviceId].icon} size={18} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {SERVICE_MAP[next.serviceId].name}
            </AppText>
            <AppText variant="body" tone="secondary" numberOfLines={1}>
              {strings.appointment.at(next.time, formatDateLong(next.date))}
            </AppText>
          </View>
          {mine.length > 1 ? (
            <AppText variant="caption" tone="primary" style={styles.more}>
              {strings.petHome.upcomingMore(mine.length - 1)}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </QuickActionCard>
  );
}

export const UpcomingSummary = memo(UpcomingSummaryBase);

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.input,
    backgroundColor: colors.background,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  more: { fontWeight: '700' },
});
