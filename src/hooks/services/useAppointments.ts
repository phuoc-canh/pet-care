import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { appointmentService } from '@/services/appointment.service';
import type { Appointment, CreateAppointmentInput } from '@/types/services-type/appointment.type';
import { nowIso } from '@/utils/helpers';

import { queryKeys } from './queryKeys';

function sortByTime(list: Appointment[]): Appointment[] {
  return list.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.list(),
    queryFn: appointmentService.getAll,
    placeholderData: keepPreviousData,
  });
}

export function useBusySlots(date: string) {
  return useQuery({
    queryKey: queryKeys.appointments.busy(date),
    queryFn: () => appointmentService.getBusySlots(date),
    // Đổi ngày → giữ grid cũ thay vì nháy skeleton.
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

interface Snapshot {
  previous?: Appointment[];
  previousBusy?: string[];
}

/** Đặt lịch — optimistic: lịch mới hiện ngay trong danh sách, rollback nếu lỗi (vd. slot vừa bị đặt). */
export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation<Appointment, Error, CreateAppointmentInput, Snapshot>({
    mutationFn: appointmentService.create,
    onMutate: async (input) => {
      const listKey = queryKeys.appointments.list();
      const busyKey = queryKeys.appointments.busy(input.date);
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.all });
      const previous = queryClient.getQueryData<Appointment[]>(listKey);
      const previousBusy = queryClient.getQueryData<string[]>(busyKey);
      const now = nowIso();
      const optimistic: Appointment = { ...input, id: `temp_${Date.now()}`, createdAt: now, updatedAt: now };
      queryClient.setQueryData<Appointment[]>(listKey, (old) => sortByTime([...(old ?? []), optimistic]));
      queryClient.setQueryData<string[]>(busyKey, (old) => [...(old ?? []), input.time]);
      return { previous, previousBusy };
    },
    onError: (_err, input, ctx) => {
      queryClient.setQueryData(queryKeys.appointments.list(), ctx?.previous);
      queryClient.setQueryData(queryKeys.appointments.busy(input.date), ctx?.previousBusy);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
  });
}

/** Hủy lịch — optimistic: item biến mất ngay, rollback nếu lỗi. */
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Appointment, Snapshot>({
    mutationFn: (apt) => appointmentService.delete(apt.id),
    onMutate: async (apt) => {
      const listKey = queryKeys.appointments.list();
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.all });
      const previous = queryClient.getQueryData<Appointment[]>(listKey);
      queryClient.setQueryData<Appointment[]>(listKey, (old) => old?.filter((a) => a.id !== apt.id));
      return { previous };
    },
    onError: (_err, _apt, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.appointments.list(), ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
  });
}
