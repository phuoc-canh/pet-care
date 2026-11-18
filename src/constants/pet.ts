import type { Personality, Species } from '@/types/services-type/pet.type';

/** Chỉ giữ giá trị + emoji; tên hiển thị lấy từ i18n: t(`pet.species.${value}`). */
export interface SpeciesOption {
  value: Species;
  emoji: string;
}

export const SPECIES: readonly SpeciesOption[] = [
  { value: 'dog', emoji: '🐶' },
  { value: 'cat', emoji: '🐱' },
  { value: 'rabbit', emoji: '🐰' },
  { value: 'hamster', emoji: '🐹' },
];

export const SPECIES_EMOJI: Record<Species, string> = { dog: '🐶', cat: '🐱', rabbit: '🐰', hamster: '🐹' };

/** Tên hiển thị: t(`pet.personality.${value}`) */
export const PERSONALITIES: readonly Personality[] = [
  'playful',
  'calm',
  'curious',
  'shy',
  'energetic',
  'affectionate',
  'independent',
  'foodie',
];

export const PET_LIMITS = {
  nameMax: 30,
  breedMax: 40,
  ageMax: 30,
  weightMin: 0.05,
  weightMax: 100,
  personalitiesMin: 1,
  personalitiesMax: 4,
} as const;
