import { localizeSeedPet, seedPets } from '@/data/seed';
import { currentLanguage } from '@/i18n';
import { AppError } from '@/libs/http';
import { STORAGE_KEYS, storage } from '@/libs/storage';
import type { CreatePetInput, Pet, UpdatePetInput } from '@/types/services-type/pet.type';
import { createId, mockLatency, nowIso } from '@/utils/helpers';

/**
 * Mock repository lưu AsyncStorage, có độ trễ 300–600ms như API thật.
 * Khi có backend: chỉ thay phần thân các hàm bằng `request<Pet[]>(...)` từ libs/http —
 * chữ ký hàm giữ nguyên nên hook/view không phải sửa.
 */

async function readAll(): Promise<Pet[]> {
  const stored = await storage.get<Pet[]>(STORAGE_KEYS.pets);
  if (stored) return stored;
  const seed = seedPets(currentLanguage());
  await storage.set(STORAGE_KEYS.pets, seed);
  return seed;
}

/** Như backend trả dữ liệu theo Accept-Language: thú cưng mẫu chưa sửa → giống theo ngôn ngữ hiện tại. */
function localize(pet: Pet): Pet {
  return localizeSeedPet(pet, currentLanguage());
}

async function writeAll(pets: Pet[]): Promise<void> {
  await storage.set(STORAGE_KEYS.pets, pets);
}

async function getAll(): Promise<Pet[]> {
  await mockLatency();
  return (await readAll()).map(localize);
}

async function getById(id: string): Promise<Pet> {
  await mockLatency();
  const pet = (await readAll()).find((p) => p.id === id);
  if (!pet) throw new AppError('NOT_FOUND');
  return localize(pet);
}

async function create(input: CreatePetInput): Promise<Pet> {
  await mockLatency();
  const now = nowIso();
  const pet: Pet = { ...input, id: createId('pet_'), createdAt: now, updatedAt: now };
  const pets = await readAll();
  await writeAll([...pets, pet]);
  return pet;
}

async function update(id: string, input: UpdatePetInput): Promise<Pet> {
  await mockLatency();
  const pets = await readAll();
  const index = pets.findIndex((p) => p.id === id);
  if (index < 0) throw new AppError('NOT_FOUND');
  const updated: Pet = { ...pets[index], ...input, id, updatedAt: nowIso() };
  const next = pets.slice();
  next[index] = updated;
  await writeAll(next);
  return updated;
}

async function remove(id: string): Promise<void> {
  await mockLatency();
  const pets = await readAll();
  if (!pets.some((p) => p.id === id)) throw new AppError('NOT_FOUND');
  await writeAll(pets.filter((p) => p.id !== id));
}

export const petService = { getAll, getById, create, update, delete: remove };
