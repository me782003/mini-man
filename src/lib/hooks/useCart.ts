import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/fetcher';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  color: string;
  size: number;
  price: string;
  quantity: number;
}
  
export interface Cart {
  items: CartItem[];
  total: string;
}

const cartKeys = {
  all: () => ['cart'] as const,
};

export function useCart() {
  return useQuery({
    queryKey: cartKeys.all(),
    queryFn:  () => get<Cart>('/api/cart'),
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; colorIndex: number; size: number }) =>
      post<CartItem>('/api/cart', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      patch(`/api/cart/${itemId}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => del(`/api/cart/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => del('/api/cart'),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all() }),
  });
}
