import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { post, del, get } from '@/lib/fetcher';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ProductDetailData } from '../types';
import { useHasAuthToken } from '@/lib/auth-token';

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
  const loggedIn = useHasAuthToken();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => get<FavouriteResponse>('/user/favorites'),
    enabled: loggedIn,
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
  const t = useTranslations('Products');
  return useMutation({
    mutationFn: (productId: number) =>
      post<FavouriteResponse>('/user/favorites', { product_id: productId }),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['products', 'detail-v2'], exact: false });
      optimisticallySetFavourite(qc, productId, true);
    },
    onSuccess: () => {
      toast.success(t('addedToFavourites'));
    },
    onError: (_err: Error, productId) => {
      optimisticallySetFavourite(qc, productId, false);
      toast.error(_err.message || t('addToFavouritesFailed'));
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
  const t = useTranslations('Products');
  return useMutation({
    mutationFn: (productId: number) =>
      del<FavouriteResponse>(`/user/favorites/${productId}`),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['products', 'detail-v2'], exact: false });
      optimisticallySetFavourite(qc, productId, false);
    },
    onSuccess: () => {
      toast.success(t('removedFromFavourites'));
    },
    onError: (_err: Error, productId) => {
      optimisticallySetFavourite(qc, productId, true);
      toast.error(_err.message || t('removeFromFavouritesFailed'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}
