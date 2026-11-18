import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, type ListRenderItem, RefreshControl, StyleSheet, View } from 'react-native';

import { AppointmentListItem } from '@/components/appointment/AppointmentListItem';
import { DialogConfirm } from '@/components/common/DialogConfirm';
import { AppText, Button, EmptyState, ErrorState, IconButton, Screen, Skeleton } from '@/components/ui';
import { SERVICE_MAP } from '@/constants/appointment';
import { strings } from '@/constants/strings';
import { useAppointments, useCancelAppointment } from '@/hooks/services/useAppointments';
import { haptic } from '@/hooks/useHaptic';
import { colors, radius, spacing } from '@/theme/theme';
import type { Appointment as AppointmentModel } from '@/types/services-type/appointment.type';
import { formatDateLong } from '@/utils/format';

const keyExtractor = (a: AppointmentModel) => a.id;
const Separator = () => <View style={styles.separator} />;

export default function Appointment() {
  const router = useRouter();
  const { data, isPending, isError, error, refetch, isRefetching } = useAppointments();
  const cancel = useCancelAppointment();
  const [target, setTarget] = useState<AppointmentModel | null>(null);
  const closeSwipeRef = useRef<(() => void) | null>(null);

  const goBook = useCallback(() => router.push('/appointment/book'), [router]);
  const onRefresh = useCallback(() => void refetch(), [refetch]);

  const requestCancel = useCallback((apt: AppointmentModel, closeSwipe: () => void) => {
    closeSwipeRef.current = closeSwipe;
    setTarget(apt);
  }, []);

  const dismiss = useCallback(() => {
    closeSwipeRef.current?.();
    closeSwipeRef.current = null;
    setTarget(null);
  }, []);

  const confirmCancel = useCallback(() => {
    if (!target) return;
    // Optimistic: item biến mất ngay; lỗi → hook rollback và item quay lại.
    cancel.mutateAsync(target).then(haptic.success, () => {
      haptic.error();
      closeSwipeRef.current?.();
    });
    setTarget(null);
  }, [cancel, target]);

  const renderItem = useCallback<ListRenderItem<AppointmentModel>>(
    ({ item }) => <AppointmentListItem appointment={item} onRequestCancel={requestCancel} />,
    [requestCancel],
  );

  const appointments = data ?? [];
  const header = (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <AppText variant="heading" tone="navy" accessibilityRole="header">
          {strings.appointment.title}
        </AppText>
        <AppText variant="body" tone="secondary">
          {strings.appointment.subtitle}
        </AppText>
      </View>
      <IconButton icon="add" variant="primary" onPress={goBook} accessibilityLabel={strings.appointment.book} />
    </View>
  );

  return (
    <Screen>
      {isPending ? (
        <View style={styles.content}>
          {header}
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={84} rounded={radius.card} style={styles.skeleton} />
          ))}
        </View>
      ) : isError && appointments.length === 0 ? (
        <View style={styles.flex}>
          {header}
          <ErrorState message={error.message} onRetry={onRefresh} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <>
              {header}
              {appointments.length > 0 ? (
                <AppText variant="caption" tone="secondary" style={styles.section}>
                  {strings.appointment.upcoming} · {strings.appointment.swipeHint}
                </AppText>
              ) : null}
            </>
          }
          ListEmptyComponent={
            <EmptyState
              emoji="📅"
              title={strings.appointment.emptyTitle}
              description={strings.appointment.emptyBody}
              actionLabel={strings.appointment.bookNow}
              onAction={goBook}
            />
          }
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {appointments.length > 0 ? (
        <View style={styles.footer}>
          <Button title={strings.appointment.book} icon="calendar" onPress={goBook} />
        </View>
      ) : null}

      <DialogConfirm
        visible={target !== null}
        emoji="📅"
        title={strings.appointment.cancelTitle}
        message={
          target
            ? strings.appointment.cancelBody(
                SERVICE_MAP[target.serviceId].name,
                target.petName,
                strings.appointment.at(target.time, formatDateLong(target.date)),
              )
            : undefined
        }
        confirmLabel={strings.appointment.cancelConfirm}
        cancelLabel={strings.appointment.keep}
        destructive
        onConfirm={confirmCancel}
        onCancel={dismiss}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, gap: spacing.sm },
  headerText: { flex: 1, gap: spacing.xxs },
  section: { fontWeight: '700', marginBottom: spacing.sm },
  separator: { height: spacing.sm },
  skeleton: { marginBottom: spacing.sm },
  footer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.background },
});
