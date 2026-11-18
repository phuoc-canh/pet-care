import type { Personality, Species } from '@/types/services-type/pet.type';

export interface SpeciesOption {
  value: Species;
  label: string;
  emoji: string;
}

export const SPECIES: readonly SpeciesOption[] = [
  { value: 'dog', label: 'Chó', emoji: '🐶' },
  { value: 'cat', label: 'Mèo', emoji: '🐱' },
  { value: 'rabbit', label: 'Thỏ', emoji: '🐰' },
  { value: 'hamster', label: 'Hamster', emoji: '🐹' },
];

export const SPECIES_MAP: Record<Species, SpeciesOption> = {
  dog: SPECIES[0],
  cat: SPECIES[1],
  rabbit: SPECIES[2],
  hamster: SPECIES[3],
};

export const PERSONALITIES: readonly { value: Personality; label: string }[] = [
  { value: 'playful', label: 'Ham chơi' },
  { value: 'calm', label: 'Điềm tĩnh' },
  { value: 'curious', label: 'Tò mò' },
  { value: 'shy', label: 'Nhút nhát' },
  { value: 'energetic', label: 'Năng động' },
  { value: 'affectionate', label: 'Tình cảm' },
  { value: 'independent', label: 'Độc lập' },
  { value: 'foodie', label: 'Ham ăn' },
];

export const PERSONALITY_LABEL: Record<Personality, string> = Object.fromEntries(
  PERSONALITIES.map((p) => [p.value, p.label]),
) as Record<Personality, string>;

export const PET_LIMITS = {
  nameMax: 30,
  breedMax: 40,
  ageMax: 30,
  weightMin: 0.05,
  weightMax: 100,
  personalitiesMin: 1,
  personalitiesMax: 4,
} as const;
