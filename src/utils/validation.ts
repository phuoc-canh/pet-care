import * as v from 'valibot';

import { PET_LIMITS } from '@/constants/pet';
import { strings } from '@/constants/strings';

const e = strings.petForm.errors;

/** Ô nhập số dạng chuỗi (bàn phím VN có thể gõ dấu phẩy) → number. */
function numericString(required: string, invalid: string, min: number, max: number, rangeMsg: string) {
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
    v.nonEmpty(e.nameRequired),
    v.maxLength(PET_LIMITS.nameMax, e.nameMax(PET_LIMITS.nameMax)),
  ),
  species: v.picklist(['dog', 'cat', 'rabbit', 'hamster'], e.speciesRequired),
  breed: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty(e.breedRequired),
    v.maxLength(PET_LIMITS.breedMax, e.breedMax(PET_LIMITS.breedMax)),
  ),
  ageYears: numericString(e.ageRequired, e.ageInvalid, 0, PET_LIMITS.ageMax, e.ageRange(PET_LIMITS.ageMax)),
  weightKg: numericString(
    e.weightRequired,
    e.weightInvalid,
    PET_LIMITS.weightMin,
    PET_LIMITS.weightMax,
    e.weightRange(PET_LIMITS.weightMin, PET_LIMITS.weightMax),
  ),
  personalities: v.pipe(
    v.array(v.picklist(['playful', 'calm', 'curious', 'shy', 'energetic', 'affectionate', 'independent', 'foodie'])),
    v.minLength(PET_LIMITS.personalitiesMin, e.personalityMin),
    v.maxLength(PET_LIMITS.personalitiesMax, e.personalityMax(PET_LIMITS.personalitiesMax)),
  ),
});

/** Giá trị trong form (chưa parse): số được nhập dưới dạng chuỗi. */
export type PetFormInput = v.InferInput<typeof petFormSchema>;
/** Giá trị sau validate, khớp CreatePetInput. */
export type PetFormOutput = v.InferOutput<typeof petFormSchema>;
