import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/fetcher';
import type { Product } from '@/lib/types';

const wishlistKeys = {
  all: () => ['wishlist'] as const,
};

export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.all(),
    queryFn:  () => get<Product[]>('/api/wishlist'),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => post('/api/wishlist', { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.all() }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => del(`/api/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.all() }),
  });
}
