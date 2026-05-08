'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/fetcher';
import type { Address } from './useProfile';

interface AddressPayload {
  first_name: string;
  last_name: string;
  country_id: number;
  street_address: string;
  apartment?: string;
  city: string;
  is_default?: boolean;
}

interface AddressListResponse {
  data: Address[];
  message: string;
}

interface AddressResponse {
  data: Address;
  message: string;
}

const addressKeys = {
  all: () => ['addresses'] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.all(),
    queryFn: () => get<AddressListResponse>('/user/addresses').then(r => r.data),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) =>
      post<AddressResponse>('/user/addresses', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AddressPayload & { id: number }) =>
      put<AddressResponse>(`/user/addresses/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/user/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => patch(`/user/addresses/${id}/set-default`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}
