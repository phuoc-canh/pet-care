import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { petService } from '@/services/pet.service';
import type { CreatePetInput, Pet, UpdatePetInput } from '@/types/services-type/pet.type';
import { nowIso } from '@/utils/helpers';

import { queryKeys } from './queryKeys';

export function usePets() {
  return useQuery({
    queryKey: queryKeys.pets.list(),
    queryFn: petService.getAll,
    placeholderData: keepPreviousData,
  });
}

export function usePet(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.pets.detail(id ?? ''),
    queryFn: () => petService.getById(id ?? ''),
    enabled: Boolean(id),
    // Hiện ngay dữ liệu từ cache danh sách → màn chi tiết không nháy skeleton.
    initialData: () => queryClient.getQueryData<Pet[]>(queryKeys.pets.list())?.find((p) => p.id === id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.pets.list())?.dataUpdatedAt,
  });
}

/** Prefetch chi tiết khi người dùng nhấn (onPressIn) vào card. */
export function usePrefetchPet() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: string) => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.pets.detail(id),
        queryFn: () => petService.getById(id),
        staleTime: 30_000,
      });
    },
    [queryClient],
  );
}

interface ListSnapshot {
  previous?: Pet[];
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation<Pet, Error, CreatePetInput, ListSnapshot & { tempId: string }>({
    mutationFn: petService.create,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pets.list() });
      const previous = queryClient.getQueryData<Pet[]>(queryKeys.pets.list());
      const tempId = `temp_${Date.now()}`;
      const now = nowIso();
      const optimistic: Pet = { ...input, id: tempId, createdAt: now, updatedAt: now };
      queryClient.setQueryData<Pet[]>(queryKeys.pets.list(), (old) => [...(old ?? []), optimistic]);
      return { previous, tempId };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.pets.list(), ctx.previous);
    },
    onSuccess: (pet, _input, ctx) => {
      queryClient.setQueryData<Pet[]>(queryKeys.pets.list(), (old) =>
        (old ?? []).map((p) => (p.id === ctx?.tempId ? pet : p)),
      );
      queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.list() }),
  });
}

interface UpdateVars {
  id: string;
  input: UpdatePetInput;
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  return useMutation<Pet, Error, UpdateVars, ListSnapshot & { previousDetail?: Pet }>({
    mutationFn: ({ id, input }) => petService.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pets.all });
      const previous = queryClient.getQueryData<Pet[]>(queryKeys.pets.list());
      const previousDetail = queryClient.getQueryData<Pet>(queryKeys.pets.detail(id));
      queryClient.setQueryData<Pet[]>(queryKeys.pets.list(), (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...input } : p)),
      );
      if (previousDetail) queryClient.setQueryData<Pet>(queryKeys.pets.detail(id), { ...previousDetail, ...input });
      return { previous, previousDetail };
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.pets.list(), ctx.previous);
      if (ctx?.previousDetail) queryClient.setQueryData(queryKeys.pets.detail(id), ctx.previousDetail);
    },
    onSuccess: (pet) => queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.list() }),
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, ListSnapshot>({
    mutationFn: petService.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pets.list() });
      const previous = queryClient.getQueryData<Pet[]>(queryKeys.pets.list());
      queryClient.setQueryData<Pet[]>(queryKeys.pets.list(), (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.pets.list(), ctx.previous);
    },
    onSuccess: (_data, id) => queryClient.removeQueries({ queryKey: queryKeys.pets.detail(id) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.list() }),
  });
}
