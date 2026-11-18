import { valibotResolver } from '@hookform/resolvers/valibot';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetFormFields } from '@/components/pet/PetFormFields';
import { AppText, Button, IconButton } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useCreatePet, usePet, useUpdatePet } from '@/hooks/services/usePets';
import { haptic } from '@/hooks/useHaptic';
import { useAppStore } from '@/store/app.store';
import { colors, spacing } from '@/theme/theme';
import type { Pet } from '@/types/services-type/pet.type';
import { type PetFormInput, type PetFormOutput, petFormSchema } from '@/utils/validation';

const EMPTY: PetFormInput = {
  name: '',
  species: 'dog',
  breed: '',
  ageYears: '',
  weightKg: '',
  personalities: [],
};

function toFormValues(pet: Pet): PetFormInput {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    ageYears: String(pet.ageYears),
    weightKg: String(pet.weightKg),
    personalities: pet.personalities,
  };
}

/** Form tạo mới (modal) — truyền `?id=` thì chuyển sang chế độ sửa. */
export default function PetCreate() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: existing } = usePet(id);
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const selectPet = useAppStore((s) => s.selectPet);

  const defaultValues = useMemo(() => (existing ? toFormValues(existing) : EMPTY), [existing]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty, touchedFields, isSubmitted },
  } = useForm<PetFormInput, unknown, PetFormOutput>({
    resolver: valibotResolver(petFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Mở form sửa khi cache chưa có dữ liệu → reset khi dữ liệu tới.
  useEffect(() => {
    if (existing && !isDirty) reset(toFormValues(existing));
  }, [existing, isDirty, reset]);

  const showError = useCallback(
    (field: keyof PetFormInput) => isSubmitted || Boolean(touchedFields[field]),
    [isSubmitted, touchedFields],
  );

  const close = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), [router]);

  const onSubmit = useCallback(
    (values: PetFormOutput) => {
      Keyboard.dismiss();
      // Optimistic update đã cập nhật UI → đóng modal ngay.
      // Dùng mutateAsync (promise) thay vì callback của mutate() vì callback đó
      // KHÔNG chạy nếu component đã unmount (modal đóng trước khi request xong).
      if (isEdit && id) {
        updatePet.mutateAsync({ id, input: values }).then(haptic.success, haptic.error);
      } else {
        createPet
          .mutateAsync(values)
          .then((pet) => {
            haptic.success();
            selectPet(pet.id);
          })
          .catch(haptic.error);
      }
      close();
    },
    [close, createPet, id, isEdit, selectPet, updatePet],
  );

  const submitting = createPet.isPending || updatePet.isPending;
  const canSubmit = isValid && (isEdit ? isDirty : true);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.flex}>
          <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + spacing.xs : spacing.md }]}>
            <View style={styles.grabber} />
            <View style={styles.headerRow}>
              <AppText variant="title" accessibilityRole="header">
                {isEdit ? t('pet.form.editTitle') : t('pet.form.createTitle')}
              </AppText>
              <IconButton icon="close" onPress={close} accessibilityLabel={t('pet.form.closeLabel')} />
            </View>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <PetFormFields control={control} errors={errors} showError={showError} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Button
              title={isEdit ? t('pet.form.submitEdit') : t('pet.form.submitCreate')}
              onPress={handleSubmit(onSubmit)}
              disabled={!canSubmit}
              loading={submitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    display: Platform.OS === 'ios' ? 'flex' : 'none',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
