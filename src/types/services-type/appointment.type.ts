import type { CreateInput, Entity } from './common.type';

export type ServiceId = 'spa' | 'checkup' | 'vaccine';

export interface Appointment extends Entity {
  petId: string;
  /** Lưu tên lúc đặt để danh sách vẫn đọc được nếu hồ sơ bị xóa. */
  petName: string;
  serviceId: ServiceId;
  /** "YYYY-MM-DD" theo giờ địa phương */
  date: string;
  /** "HH:mm" */
  time: string;
  price: number;
}

export type CreateAppointmentInput = CreateInput<Appointment>;
