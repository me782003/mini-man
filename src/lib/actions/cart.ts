'use server';

import { post } from '@/lib/fetcher';

export async function addToCartAction(productId: number, variantId: number) {
  try {
    await post('/user/cart', { product_id: productId, variant_id: variantId });
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add to cart';
    return { ok: false, message };
  }
}
