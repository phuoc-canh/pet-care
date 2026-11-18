/** Query key factory — một nguồn duy nhất để invalidate/optimistic update chính xác. */
export const queryKeys = {
  pets: {
    all: ['pets'] as const,
    list: () => [...queryKeys.pets.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.pets.all, 'detail', id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: () => [...queryKeys.appointments.all, 'list'] as const,
  },
} as const;
