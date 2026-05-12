import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post, del, get } from '@/lib/fetcher';
import { toast } from 'sonner';
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

function optimisticallySetFavourite(qc: ReturnType<typeof useQueryClient>, productId: number, value: boolean) {
  qc.setQueriesData<{ data: ProductDetailData }>(
    { queryKey: ['products', 'detail-v2'], exact: false },
    (old) => {
      if (!old?.data || old.data.id !== productId) return old;
      return { ...old, data: { ...old.data, is_in_favourite: value } };
    },
  );
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      post<FavouriteResponse>('/user/favorites', { product_id: productId }),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['products', 'detail-v2'], exact: false });
      optimisticallySetFavourite(qc, productId, true);
    },
    onSuccess: () => {
      toast.success('Added to favourites');
    },
    onError: (_err: Error, productId) => {
      optimisticallySetFavourite(qc, productId, false);
      toast.error(_err.message || 'Failed to add to favourites');
    },
    onSettled: () => {
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
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['products', 'detail-v2'], exact: false });
      optimisticallySetFavourite(qc, productId, false);
    },
    onSuccess: () => {
      toast.success('Removed from favourites');
    },
    onError: (_err: Error, productId) => {
      optimisticallySetFavourite(qc, productId, true);
      toast.error(_err.message || 'Failed to remove from favourites');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}
