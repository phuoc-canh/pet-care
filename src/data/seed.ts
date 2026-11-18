import type { Language } from '@/i18n/languages';
import type { Pet } from '@/types/services-type/pet.type';

export const SEED_CREATED_AT = '2026-01-10T08:00:00.000Z';

/** Giống của thú cưng mẫu theo từng ngôn ngữ. */
const SEED_BREEDS: Record<string, Record<Language, string>> = {
  pet_milo: { vi: 'Corgi', en: 'Corgi', ko: '웰시코기' },
  pet_mochi: { vi: 'Mèo Anh lông ngắn', en: 'British Shorthair', ko: '브리티시 숏헤어' },
};

const BASE: Omit<Pet, 'breed'>[] = [
  {
    id: 'pet_milo',
    name: 'Milo',
    species: 'dog',
    ageYears: 2,
    weightKg: 11.5,
    personalities: ['playful', 'foodie', 'affectionate'],
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  },
  {
    id: 'pet_mochi',
    name: 'Mochi',
    species: 'cat',
    ageYears: 0.5,
    weightKg: 2.8,
    personalities: ['curious', 'shy'],
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_CREATED_AT,
  },
];

export function seedPets(language: Language): Pet[] {
  return BASE.map((p) => ({ ...p, breed: SEED_BREEDS[p.id]?.[language] ?? '' }));
}

/** Thú cưng mẫu chưa bị người dùng sửa → trả giống theo ngôn ngữ đang chọn. */
export function localizeSeedPet(pet: Pet, language: Language): Pet {
  const breeds = SEED_BREEDS[pet.id];
  if (!breeds || pet.updatedAt !== SEED_CREATED_AT) return pet;
  return { ...pet, breed: breeds[language] };
}

export const SEED_PET_IDS = BASE.map((p) => ({ id: p.id, name: p.name }));
