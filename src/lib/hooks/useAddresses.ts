'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/fetcher';
import type { Address } from './useProfile';
import { useHasAuthToken } from '@/lib/auth-token';

interface AddressPayload {
  first_name: string;
  last_name: string;
  phone: string;
  country_id: number;
  street_address: string;
  apartment?: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
  bosta_city_id?: string | null;
  bosta_city_name?: string | null;
  bosta_district_id?: string | null;
  bosta_district_name?: string | null;
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

/**
 * `cartAmount`: send it when a coupon is applied (subtotal − discount), so each address's
 * shipping fee and free shipping follow the discounted amount. Otherwise the server uses the cart total.
 */
export function useAddresses({ cartAmount }: { cartAmount?: number } = {}) {
  const loggedIn = useHasAuthToken();
  const amount = cartAmount != null ? Math.round(cartAmount * 100) / 100 : null;
  return useQuery({
    queryKey: amount != null ? [...addressKeys.all(), { cart_amount: amount }] : addressKeys.all(),
    queryFn: () =>
      get<AddressListResponse>(amount != null ? `/user/addresses?cart_amount=${amount}` : '/user/addresses').then(r => r.data),
    enabled: loggedIn,
    placeholderData: keepPreviousData,
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
    onSettled: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/user/addresses/${id}`),
    onSettled: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => patch(`/user/addresses/${id}/set-default`, {}),
    onSettled: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}
