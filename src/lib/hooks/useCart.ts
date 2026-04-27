import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/fetcher';

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  price: number;
}

export interface CartVariant {
  id: number;
  sku: string;
  size: string;
  color_hexa: string;
}

export interface CartItem {
  cart_item_id: number;
  quantity: number;
  product: CartProduct;
  variant: CartVariant;
  total_item_price: number;
}

export interface CartSummary {
  subtotal: string;
  tax: string;
  total: string;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
}

export interface CartResponse {
  data: CartData;
  message: string;
}

const cartKeys = {
  all: () => ['cart'] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.all(),
    queryFn: () => get<CartResponse>('/user/cart'),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { variant_id: number; product_id: number }) =>
      post('/user/cart', vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all() });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, action }: { itemId: number; action: 'plus' | 'minus' }) =>
      put('/user/cart', { cart_item_id: itemId, action }),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => del(`/user/cart/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}
