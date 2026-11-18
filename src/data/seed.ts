import type { Pet } from '@/types/services-type/pet.type';

const created = '2026-01-10T08:00:00.000Z';

export const SEED_PETS: Pet[] = [
  {
    id: 'pet_milo',
    name: 'Milo',
    species: 'dog',
    breed: 'Corgi',
    ageYears: 2,
    weightKg: 11.5,
    personalities: ['playful', 'foodie', 'affectionate'],
    createdAt: created,
    updatedAt: created,
  },
  {
    id: 'pet_mochi',
    name: 'Mochi',
    species: 'cat',
    breed: 'Mèo Anh lông ngắn',
    ageYears: 0.5,
    weightKg: 2.8,
    personalities: ['curious', 'shy'],
    createdAt: created,
    updatedAt: created,
  },
];
