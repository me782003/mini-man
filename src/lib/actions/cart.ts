'use server';

import { addToCart, addToWishlist } from '@/lib/api/products';

export async function addToCartAction(
  productId: string,
  colorIndex: number,
  size: number
) {
  try {
    await addToCart(productId, colorIndex, size);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add to cart';
    return { ok: false, message };
  }
}

export async function addToWishlistAction(productId: string) {
  try {
    await addToWishlist(productId);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update wishlist';
    return { ok: false, message };
  }
}
