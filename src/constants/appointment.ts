import type Ionicons from '@expo/vector-icons/Ionicons';

import type { ServiceId } from '@/types/services-type/appointment.type';

export interface ServiceOption {
  id: ServiceId;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Giá mock (VND) */
  price: number;
  durationMin: number;
}

export const SERVICES: readonly ServiceOption[] = [
  {
    id: 'spa',
    name: 'Spa & tắm sấy',
    description: 'Tắm, sấy, chải lông, cắt móng, vệ sinh tai',
    icon: 'sparkles',
    price: 250_000,
    durationMin: 60,
  },
  {
    id: 'checkup',
    name: 'Khám thú y',
    description: 'Khám tổng quát với bác sĩ thú y',
    icon: 'medkit',
    price: 300_000,
    durationMin: 30,
  },
  {
    id: 'vaccine',
    name: 'Tiêm phòng',
    description: 'Tiêm vắc-xin định kỳ, có sổ theo dõi',
    icon: 'shield-checkmark',
    price: 180_000,
    durationMin: 20,
  },
];

export const SERVICE_MAP: Record<ServiceId, ServiceOption> = {
  spa: SERVICES[0],
  checkup: SERVICES[1],
  vaccine: SERVICES[2],
};

export const TIME_SLOTS: readonly string[] = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:30',
  '14:30',
  '15:30',
  '16:30',
  '17:30',
];

export const BOOKING_DAYS = 7;
