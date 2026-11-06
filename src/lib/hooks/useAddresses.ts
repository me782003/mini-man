'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/fetcher';
import { phonePayload } from '@/lib/countries';
import type { PaymentMethod } from '@/lib/hooks/useOrders';

const toBody = (payload: AddressPayload) => ({ ...payload, ...phonePayload(payload.phone) });
import type { Address } from './useProfile';
import { useHasAuthToken } from '@/lib/auth-token';

/** Body of POST / PUT /user/addresses. Egypt sends the Bosta fields; other countries governorate + city. */
export interface AddressPayload {
  title: string;
  country_id: number;
  street_address: string;
  landmark?: string;
  apartment?: string;
  /** The picker's value; sent as { phone, phone_code } (see phonePayload). */
  phone: string;
  is_default?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  bosta_city_id?: string;
  bosta_city_name?: string;
  bosta_district_id?: string;
  bosta_district_name?: string;
  governorate?: string | null;
  city?: string;
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
 * Each address comes with its shipping fee (`shipping_amount`, `shipping_fees`, `free_shipping`).
 * With a coupon applied send `couponCode` and `cartAmount` = subtotal - discount: the fee and free
 * shipping can change. `paymentMethod` picks which fee `shipping_amount` holds.
 */
export function useAddresses({ cartAmount, couponCode, paymentMethod }: { cartAmount?: number; couponCode?: string | null; paymentMethod?: PaymentMethod } = {}) {
  const loggedIn = useHasAuthToken();
  const params = new URLSearchParams();
  if (paymentMethod) params.set('payment_method', paymentMethod);
  if (cartAmount != null) params.set('cart_amount', String(Math.round(cartAmount * 100) / 100));
  if (couponCode) params.set('coupon_code', couponCode);
  const qs = params.toString();
  return useQuery({
    queryKey: qs ? [...addressKeys.all(), qs] : addressKeys.all(),
    queryFn: () => get<AddressListResponse>(qs ? `/user/addresses?${qs}` : '/user/addresses').then(r => r.data),
    enabled: loggedIn,
    placeholderData: keepPreviousData,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) =>
      post<AddressResponse>('/user/addresses', toBody(payload)),
    onSuccess: () => qc.invalidateQueries({ queryKey: addressKeys.all() }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AddressPayload & { id: number }) =>
      put<AddressResponse>(`/user/addresses/${id}`, toBody(payload)),
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
