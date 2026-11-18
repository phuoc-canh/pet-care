import { memo, useCallback } from 'react';
import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText, Chip, TextField } from '@/components/ui';
import { PERSONALITIES, PET_LIMITS, SPECIES } from '@/constants/pet';
import { strings } from '@/constants/strings';
import { spacing } from '@/theme/theme';
import type { Personality, Species } from '@/types/services-type/pet.type';
import type { PetFormInput, PetFormOutput } from '@/utils/validation';

const s = strings.petForm;

export interface PetFormFieldsProps {
  control: Control<PetFormInput, unknown, PetFormOutput>;
  errors: FieldErrors<PetFormInput>;
  /** Chỉ hiện lỗi khi field đã chạm hoặc đã submit — tránh đỏ cả form khi vừa mở. */
  showError: (field: keyof PetFormInput) => boolean;
}

function FieldLabel({ text, hint }: { text: string; hint?: string }) {
  return (
    <View style={styles.labelRow}>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {text}
      </AppText>
      {hint ? (
        <AppText variant="caption" tone="secondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
      {message}
    </AppText>
  );
}

function SpeciesField({ value, onChange }: { value: Species | undefined; onChange: (v: Species) => void }) {
  return (
    <View style={styles.chips}>
      {SPECIES.map((sp) => (
        <Chip key={sp.value} value={sp.value} label={sp.label} leading={sp.emoji} selected={value === sp.value} onToggle={onChange} />
      ))}
    </View>
  );
}

function PersonalityField({ value, onChange }: { value: Personality[]; onChange: (v: Personality[]) => void }) {
  const toggle = useCallback(
    (p: Personality) => {
      if (value.includes(p)) onChange(value.filter((x) => x !== p));
      else if (value.length < PET_LIMITS.personalitiesMax) onChange([...value, p]);
    },
    [onChange, value],
  );
  return (
    <View style={styles.chips}>
      {PERSONALITIES.map((p) => (
        <Chip key={p.value} value={p.value} label={p.label} selected={value.includes(p.value)} onToggle={toggle} />
      ))}
    </View>
  );
}

/** Field của form thú cưng, tách khỏi view để tái dùng cho tạo mới & sửa. */
function PetFormFieldsBase({ control, errors, showError }: PetFormFieldsProps) {
  const err = (field: keyof PetFormInput): string | undefined =>
    showError(field) ? errors[field]?.message : undefined;

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            label={s.name}
            placeholder={s.namePlaceholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={err('name')}
            maxLength={PET_LIMITS.nameMax + 5}
            autoCapitalize="words"
            returnKeyType="next"
          />
        )}
      />

      <View style={styles.group}>
        <FieldLabel text={s.species} />
        <Controller
          control={control}
          name="species"
          render={({ field: { value, onChange } }) => <SpeciesField value={value} onChange={onChange} />}
        />
        <ErrorText message={err('species')} />
      </View>

      <Controller
        control={control}
        name="breed"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            label={s.breed}
            placeholder={s.breedPlaceholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={err('breed')}
            maxLength={PET_LIMITS.breedMax + 5}
          />
        )}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Controller
            control={control}
            name="ageYears"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={s.age}
                placeholder={s.agePlaceholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={err('ageYears')}
                keyboardType="decimal-pad"
                maxLength={5}
              />
            )}
          />
        </View>
        <View style={styles.flex}>
          <Controller
            control={control}
            name="weightKg"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label={s.weight}
                placeholder={s.weightPlaceholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={err('weightKg')}
                keyboardType="decimal-pad"
                maxLength={6}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.group}>
        <FieldLabel text={s.personality} hint={s.personalityHint(PET_LIMITS.personalitiesMax)} />
        <Controller
          control={control}
          name="personalities"
          render={({ field: { value, onChange } }) => <PersonalityField value={value} onChange={onChange} />}
        />
        <ErrorText message={err('personalities')} />
      </View>
    </View>
  );
}

export const PetFormFields = memo(PetFormFieldsBase);

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  group: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
