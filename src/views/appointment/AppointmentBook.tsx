import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateStrip, nextDays } from '@/components/appointment/DateStrip';
import { ServiceCard } from '@/components/appointment/ServiceCard';
import { SuccessCheck } from '@/components/appointment/SuccessCheck';
import { TimeSlotGrid } from '@/components/appointment/TimeSlotGrid';
import { PetSelector } from '@/components/pet/PetSelector';
import { AppText, Avatar, Button, Card, EmptyState, IconButton, Pill } from '@/components/ui';
import { SERVICE_MAP, SERVICES, TIME_SLOTS } from '@/constants/appointment';
import { strings } from '@/constants/strings';
import { useBookAppointment, useBusySlots } from '@/hooks/services/useAppointments';
import { haptic } from '@/hooks/useHaptic';
import { useSelectedPet } from '@/hooks/useSelectedPet';
import { AppError } from '@/libs/http';
import { colors, spacing } from '@/theme/theme';
import type { ServiceId } from '@/types/services-type/appointment.type';
import { formatDateLong, formatVnd, toDateKey } from '@/utils/format';

type Step = 'select' | 'confirm' | 'success';

/** Giờ đã qua trong ngày hôm nay (cộng 30 phút chuẩn bị). */
function pastSlots(dateKey: string): string[] {
  const now = new Date();
  if (dateKey !== toDateKey(now)) return [];
  const minutes = now.getHours() * 60 + now.getMinutes() + 30;
  return TIME_SLOTS.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0) < minutes;
  });
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      <AppText variant={strong ? 'subtitle' : 'bodyStrong'} tone={strong ? 'primary' : 'navy'} style={styles.summaryValue}>
        {value}
      </AppText>
    </View>
  );
}

export default function AppointmentBook() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pets, pet: defaultPet } = useSelectedPet();
  const book = useBookAppointment();

  const [step, setStep] = useState<Step>('select');
  const [petId, setPetId] = useState<string | undefined>(undefined);
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  // Mặc định ngày đầu tiên còn giờ trống (tối muộn thì nhảy sang ngày mai).
  const [date, setDate] = useState(
    () => nextDays().find((d) => pastSlots(d.key).length < TIME_SLOTS.length)?.key ?? toDateKey(new Date()),
  );
  const [time, setTime] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  /** Snapshot lúc đặt thành công (sau khi đặt, giờ đó thành "kín" nên không suy ra lại được). */
  const [bookedWhen, setBookedWhen] = useState('');

  const pet = pets.find((p) => p.id === petId) ?? defaultPet;
  const busyQuery = useBusySlots(date);
  const disabled = useMemo(
    () => Array.from(new Set([...(busyQuery.data ?? []), ...pastSlots(date)])),
    [busyQuery.data, date],
  );
  // Giờ đã chọn mà trở thành "kín" (đổi ngày) thì coi như chưa chọn — suy ra, không cần effect.
  const effectiveTime = time && !disabled.includes(time) ? time : null;
  const service = serviceId ? SERVICE_MAP[serviceId] : null;
  const canContinue = Boolean(pet && service && effectiveTime);

  const close = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/appointment')), [router]);
  const goConfirm = useCallback(() => {
    setErrorText(null);
    setStep('confirm');
  }, []);
  const goSelect = useCallback(() => setStep('select'), []);

  const submit = useCallback(() => {
    if (!pet || !service || !effectiveTime) return;
    setErrorText(null);
    book
      .mutateAsync({ petId: pet.id, petName: pet.name, serviceId: service.id, date, time: effectiveTime, price: service.price })
      .then(() => {
        haptic.success();
        setBookedWhen(strings.appointment.at(effectiveTime, formatDateLong(date)));
        setStep('success');
      })
      .catch((err: unknown) => {
        haptic.error();
        const slotTaken = err instanceof AppError && err.code === 'BAD_REQUEST';
        setErrorText(slotTaken ? strings.appointment.slotTaken : strings.appointment.bookFailed);
        if (slotTaken) {
          setTime(null);
          setStep('select');
        }
      });
  }, [book, date, effectiveTime, pet, service]);

  const when = effectiveTime ? strings.appointment.at(effectiveTime, formatDateLong(date)) : '';
  const topPad = Platform.OS === 'android' ? insets.top + spacing.xs : spacing.md;

  if (!pet) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: topPad }]}>
        <EmptyState emoji="🐾" title={strings.appointment.noPet} actionLabel={strings.petHome.addPet} onAction={() => router.replace('/pet/new')} />
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={[styles.root, styles.center, { paddingTop: topPad, paddingBottom: insets.bottom + spacing.lg }]}>
        <SuccessCheck />
        <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.successText}>
          <AppText variant="heading" tone="navy" center accessibilityRole="header">
            {strings.appointment.successTitle}
          </AppText>
          <AppText variant="bodyStrong" tone="secondary" center style={styles.successBody}>
            {strings.appointment.successBody(pet.name, bookedWhen)}
          </AppText>
        </Animated.View>
        <View style={styles.successAction}>
          <Button title={strings.appointment.done} onPress={close} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        {step === 'confirm' ? (
          <IconButton icon="chevron-back" onPress={goSelect} accessibilityLabel={strings.appointment.edit} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <AppText variant="subtitle" accessibilityRole="header">
          {step === 'confirm' ? strings.appointment.summaryTitle : strings.appointment.bookTitle}
        </AppText>
        <IconButton icon="close" onPress={close} accessibilityLabel={strings.appointment.close} />
      </View>

      {step === 'select' ? (
        <Animated.View key="select" entering={FadeInLeft.duration(220)} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <AppText variant="caption" tone="secondary" style={[styles.label, styles.padded]}>
              {strings.appointment.forPet}
            </AppText>
            <PetSelector pets={pets} selectedId={pet.id} onSelect={setPetId} />

            <AppText variant="caption" tone="secondary" style={[styles.label, styles.padded]}>
              1 · {strings.appointment.step1}
            </AppText>
            <View style={[styles.padded, styles.services]}>
              {SERVICES.map((s) => (
                <ServiceCard key={s.id} service={s} selected={serviceId === s.id} onSelect={setServiceId} />
              ))}
            </View>

            <AppText variant="caption" tone="secondary" style={[styles.label, styles.padded]}>
              2 · {strings.appointment.step2}
            </AppText>
            <DateStrip value={date} onChange={setDate} />

            <AppText variant="caption" tone="secondary" style={[styles.label, styles.padded]}>
              3 · {strings.appointment.step3}
            </AppText>
            <View style={styles.padded}>
              <TimeSlotGrid
                slots={TIME_SLOTS}
                busy={disabled}
                value={effectiveTime}
                loading={busyQuery.isPending}
                onChange={setTime}
              />
            </View>
            {errorText ? (
              <AppText variant="body" tone="danger" style={[styles.padded, styles.error]} accessibilityLiveRegion="polite">
                {errorText}
              </AppText>
            ) : null}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Button
              title={canContinue ? strings.appointment.continue : strings.appointment.pickAll}
              onPress={goConfirm}
              disabled={!canContinue}
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key="confirm" entering={FadeInRight.duration(220)} style={styles.flex}>
          <ScrollView contentContainerStyle={[styles.scroll, styles.padded]}>
            <Card>
              <Pill label={strings.appointment.summaryTitle} icon="calendar" />
              <View style={styles.summaryPet}>
                <Avatar species={pet.species} size={52} />
                <View>
                  <AppText variant="caption" tone="secondary">
                    {strings.appointment.summaryPet}
                  </AppText>
                  <AppText variant="title" tone="navy">
                    {pet.name}
                  </AppText>
                </View>
              </View>
              <View style={styles.divider} />
              <Row label={strings.appointment.summaryService} value={service?.name ?? ''} />
              <Row label={strings.appointment.summaryTime} value={when} />
              <View style={styles.divider} />
              <Row label={strings.appointment.summaryPrice} value={formatVnd(service?.price ?? 0)} strong />
            </Card>
            <AppText variant="caption" tone="secondary" center style={styles.note}>
              {strings.appointment.summaryNote}
            </AppText>
            {errorText ? (
              <AppText variant="body" tone="danger" center accessibilityLiveRegion="polite">
                {errorText}
              </AppText>
            ) : null}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Button title={strings.appointment.confirm} icon="checkmark-circle" onPress={submit} loading={book.isPending} />
            <Button title={strings.appointment.edit} variant="ghost" onPress={goSelect} disabled={book.isPending} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerSpacer: { width: 44 },
  scroll: { paddingBottom: spacing.xl, gap: spacing.xs },
  padded: { paddingHorizontal: spacing.lg },
  label: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing.md },
  services: { gap: spacing.xs },
  error: { marginTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  summaryPet: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.md },
  summaryValue: { flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  note: { marginTop: spacing.md, paddingHorizontal: spacing.md },
  successText: { gap: spacing.xs, alignItems: 'center' },
  successBody: { maxWidth: 320, fontWeight: '400' },
  successAction: { alignSelf: 'stretch', marginTop: spacing.xxl },
});
