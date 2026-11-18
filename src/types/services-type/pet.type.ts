import type { CreateInput, Entity, UpdateInput } from './common.type';

export type Species = 'dog' | 'cat' | 'rabbit' | 'hamster';

export type Personality =
  | 'playful'
  | 'calm'
  | 'curious'
  | 'shy'
  | 'energetic'
  | 'affectionate'
  | 'independent'
  | 'foodie';

export interface Pet extends Entity {
  name: string;
  species: Species;
  breed: string;
  /** Tuổi tính theo năm, cho phép số lẻ (0.5 = 6 tháng). */
  ageYears: number;
  weightKg: number;
  personalities: Personality[];
}

export type CreatePetInput = CreateInput<Pet>;
export type UpdatePetInput = UpdateInput<Pet>;
