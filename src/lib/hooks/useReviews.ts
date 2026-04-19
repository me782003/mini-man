import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/fetcher';
import type { Review } from '@/lib/types';

const reviewKeys = {
  byProduct: (productId: string) => ['reviews', productId] as const,
};

export function useReviews(productId: string) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId),
    queryFn:  () => get<Review[]>(`/api/products/${productId}/reviews`),
    enabled:  !!productId,
  });
}

export function useSubmitReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (review: { rating: number; body: string }) =>
      post<Review>(`/api/products/${productId}/reviews`, review),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) }),
  });
}
