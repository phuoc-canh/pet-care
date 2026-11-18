import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, LinearTransition, type SharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { AppText, Card, PressableScale } from '@/components/ui';
import { SERVICE_MAP } from '@/constants/appointment';
import { useTranslation } from 'react-i18next';
import { haptic } from '@/hooks/useHaptic';
import { colors, radius, spacing } from '@/theme/theme';
import type { Appointment } from '@/types/services-type/appointment.type';
import { formatDateLong, formatDayMonth, formatVnd, fromDateKey, weekdayShort } from '@/utils/format';

const ACTION_WIDTH = 96;

function CancelAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const { t } = useTranslation();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.6, 1], [0, 0.6, 1], 'clamp'),
    transform: [{ scale: interpolate(progress.get(), [0, 1], [0.8, 1], 'clamp') }],
  }));
  return (
    <Animated.View style={[styles.actionWrap, style]}>
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={t('appointment.cancel')} style={styles.action}>
        <Ionicons name="close-circle" size={24} color={colors.white} />
        <AppText variant="caption" tone="inverse" style={styles.actionText}>
          {t('appointment.cancel')}
        </AppText>
      </PressableScale>
    </Animated.View>
  );
}

export interface AppointmentListItemProps {
  appointment: Appointment;
  onRequestCancel: (appointment: Appointment, close: () => void) => void;
}

/** Item lịch hẹn: vuốt sang trái hiện nút "Hủy lịch" (gesture-handler + reanimated). */
function AppointmentListItemBase({ appointment, onRequestCancel }: AppointmentListItemProps) {
  const { t } = useTranslation();
  const ref = useRef<SwipeableMethods>(null);
  const service = SERVICE_MAP[appointment.serviceId];
  const serviceName = t(`appointment.services.${service.id}.name`);
  const date = fromDateKey(appointment.date);
  const when = t('appointment.at', { time: appointment.time, date: formatDateLong(appointment.date) });
  const pending = appointment.id.startsWith('temp_');

  const close = useCallback(() => ref.current?.close(), []);
  const requestCancel = useCallback(() => {
    haptic.warning();
    onRequestCancel(appointment, close);
  }, [appointment, close, onRequestCancel]);

  const renderRightActions = useCallback(
    (progress: SharedValue<number>) => <CancelAction progress={progress} onPress={requestCancel} />,
    [requestCancel],
  );

  return (
    <Animated.View entering={FadeIn.duration(220)} layout={LinearTransition.duration(220)}>
      <ReanimatedSwipeable
        ref={ref}
        friction={2}
        rightThreshold={ACTION_WIDTH / 2}
        overshootRight={false}
        enabled={!pending}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => haptic.light()}
        containerStyle={styles.swipe}
      >
        <Card
          style={[styles.card, pending && styles.pending]}
          accessibilityLabel={t('appointment.itemLabel', { service: serviceName, pet: appointment.petName, when })}
          accessibilityHint={t('appointment.swipeHint')}
        >
          <View style={styles.row}>
            <View style={styles.dateBox}>
              <AppText variant="caption" tone="primary" style={styles.bold}>
                {weekdayShort(date)}
              </AppText>
              <AppText variant="subtitle" tone="navy">
                {formatDayMonth(appointment.date)}
              </AppText>
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Ionicons name={service.icon} size={16} color={colors.primary} />
                <AppText variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                  {serviceName}
                </AppText>
              </View>
              <AppText variant="body" tone="secondary" numberOfLines={1}>
                {appointment.petName} · {appointment.time} · {formatVnd(appointment.price)}
              </AppText>
            </View>
            <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
          </View>
        </Card>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

export const AppointmentListItem = memo(AppointmentListItemBase);

const styles = StyleSheet.create({
  swipe: { borderRadius: radius.card, overflow: 'visible' },
  card: { padding: spacing.md },
  pending: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateBox: {
    width: 64,
    paddingVertical: spacing.xs,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
  },
  bold: { fontWeight: '800' },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  flex: { flex: 1 },
  actionWrap: { width: ACTION_WIDTH, paddingLeft: spacing.xs, justifyContent: 'center' },
  action: {
    flex: 1,
    borderRadius: radius.card,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionText: { fontWeight: '700' },
});
