import * as v from 'valibot';

import { PET_LIMITS } from '@/constants/pet';
import { i18n } from '@/i18n';
import type vi from '@/i18n/locales/vi.json';

/** Message dạng hàm → dịch tại thời điểm validate, đổi ngôn ngữ là lỗi đổi theo. */
type FormErrorKey = keyof typeof vi.pet.formErrors;
const msg = (key: FormErrorKey, params?: Record<string, number>) => () => i18n.t(`pet.formErrors.${key}`, params ?? {});

/** Ô nhập số dạng chuỗi (bàn phím VN có thể gõ dấu phẩy) → number. */
function numericString(
  required: () => string,
  invalid: () => string,
  min: number,
  max: number,
  rangeMsg: () => string,
) {
  return v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(required),
    v.transform((raw) => Number(raw.replace(',', '.'))),
    v.number(invalid),
    v.check((n) => !Number.isNaN(n), invalid),
    v.minValue(min, rangeMsg),
    v.maxValue(max, rangeMsg),
  );
}

export const petFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(msg('nameRequired')),
    v.maxLength(PET_LIMITS.nameMax, msg('nameMax', { max: PET_LIMITS.nameMax })),
  ),
  species: v.picklist(['dog', 'cat', 'rabbit', 'hamster'], msg('speciesRequired')),
  breed: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(msg('breedRequired')),
    v.maxLength(PET_LIMITS.breedMax, msg('breedMax', { max: PET_LIMITS.breedMax })),
  ),
  ageYears: numericString(
    msg('ageRequired'),
    msg('ageInvalid'),
    0,
    PET_LIMITS.ageMax,
    msg('ageRange', { max: PET_LIMITS.ageMax }),
  ),
  weightKg: numericString(
    msg('weightRequired'),
    msg('weightInvalid'),
    PET_LIMITS.weightMin,
    PET_LIMITS.weightMax,
    msg('weightRange', { min: PET_LIMITS.weightMin, max: PET_LIMITS.weightMax }),
  ),
  personalities: v.pipe(
    v.array(v.picklist(['playful', 'calm', 'curious', 'shy', 'energetic', 'affectionate', 'independent', 'foodie'])),
    v.minLength(PET_LIMITS.personalitiesMin, msg('personalityMin')),
    v.maxLength(PET_LIMITS.personalitiesMax, msg('personalityMax', { max: PET_LIMITS.personalitiesMax })),
  ),
});

/** Giá trị trong form (chưa parse): số được nhập dưới dạng chuỗi. */
export type PetFormInput = v.InferInput<typeof petFormSchema>;
/** Giá trị sau validate, khớp CreatePetInput. */
export type PetFormOutput = v.InferOutput<typeof petFormSchema>;
