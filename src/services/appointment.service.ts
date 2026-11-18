import { SERVICE_MAP, TIME_SLOTS } from '@/constants/appointment';
import { SEED_PET_IDS } from '@/data/seed';
import { i18n } from '@/i18n';
import { AppError } from '@/libs/http';
import { STORAGE_KEYS, storage } from '@/libs/storage';
import type { Appointment, CreateAppointmentInput } from '@/types/services-type/appointment.type';
import { toDateKey } from '@/utils/format';
import { createId, mockLatency, nowIso } from '@/utils/helpers';

/** Mock repository lịch hẹn (AsyncStorage). Đổi sang API thật chỉ cần sửa file này. */

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function seedAppointments(): Appointment[] {
  const pet = SEED_PET_IDS[0] ?? { id: 'pet_milo', name: 'Milo' };
  const now = nowIso();
  return [
    {
      id: 'apt_seed_1',
      petId: pet.id,
      petName: pet.name,
      serviceId: 'spa',
      date: addDays(2),
      time: '09:00',
      price: SERVICE_MAP.spa.price,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function readAll(): Promise<Appointment[]> {
  const stored = await storage.get<Appointment[]>(STORAGE_KEYS.appointments);
  if (stored) return stored;
  const seed = seedAppointments();
  await storage.set(STORAGE_KEYS.appointments, seed);
  return seed;
}

function startsAt(a: Pick<Appointment, 'date' | 'time'>): number {
  const [y, m, d] = a.date.split('-').map(Number);
  const [hh, mm] = a.time.split(':').map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0).getTime();
}

/** Giờ đã kín do "khách khác" đặt — sinh cố định theo ngày để demo có slot bị disable. */
function othersBusy(date: string): string[] {
  let hash = 0;
  for (const ch of date) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const a = TIME_SLOTS[hash % TIME_SLOTS.length];
  const b = TIME_SLOTS[(hash >> 3) % TIME_SLOTS.length];
  return [a, b].filter((x): x is string => Boolean(x));
}

/** Lịch sắp tới (chưa qua), sắp xếp theo thời gian. */
async function getAll(): Promise<Appointment[]> {
  await mockLatency();
  const now = Date.now();
  return (await readAll()).filter((a) => startsAt(a) >= now - 30 * 60_000).sort((x, y) => startsAt(x) - startsAt(y));
}

async function getById(id: string): Promise<Appointment> {
  await mockLatency();
  const found = (await readAll()).find((a) => a.id === id);
  if (!found) throw new AppError('NOT_FOUND');
  return found;
}

/** Các giờ đã kín trong ngày (lịch của mình + khách khác). */
async function getBusySlots(date: string): Promise<string[]> {
  await mockLatency();
  const mine = (await readAll()).filter((a) => a.date === date).map((a) => a.time);
  return Array.from(new Set([...othersBusy(date), ...mine]));
}

async function create(input: CreateAppointmentInput): Promise<Appointment> {
  await mockLatency();
  const all = await readAll();
  const taken = othersBusy(input.date).includes(input.time) || all.some((a) => a.date === input.date && a.time === input.time);
  if (taken) throw new AppError('BAD_REQUEST', i18n.t('appointment.slotTaken'));
  const now = nowIso();
  const created: Appointment = { ...input, id: createId('apt_'), createdAt: now, updatedAt: now };
  await storage.set(STORAGE_KEYS.appointments, [...all, created]);
  return created;
}

async function update(id: string, input: Partial<CreateAppointmentInput>): Promise<Appointment> {
  await mockLatency();
  const all = await readAll();
  const index = all.findIndex((a) => a.id === id);
  const current = all[index];
  if (!current) throw new AppError('NOT_FOUND');
  const updated: Appointment = { ...current, ...input, id, updatedAt: nowIso() };
  const next = all.slice();
  next[index] = updated;
  await storage.set(STORAGE_KEYS.appointments, next);
  return updated;
}

/** Hủy lịch = xóa khỏi danh sách. */
async function remove(id: string): Promise<void> {
  await mockLatency();
  const all = await readAll();
  if (!all.some((a) => a.id === id)) throw new AppError('NOT_FOUND');
  await storage.set(
    STORAGE_KEYS.appointments,
    all.filter((a) => a.id !== id),
  );
}

export const appointmentService = { getAll, getById, getBusySlots, create, update, delete: remove };
