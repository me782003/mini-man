import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post, del, get } from '@/lib/fetcher';
import { ProductDetailData } from '../types';

interface FavouriteResponse {
  data: ProductDetailData[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  message: string;
  error: string;
  errors: string[];
}

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => get<FavouriteResponse>('/user/favorites'),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      post<FavouriteResponse>('/user/favorites', { product_id: productId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      del<FavouriteResponse>(`/user/favorites/${productId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}
