import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/fetcher';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useHasAuthToken } from '@/lib/auth-token';
import type { ShippingFees } from '@/lib/shipping-fee';

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
  price_modifier?: string;
  stock?: number;
  is_active?: number;
  is_available?: number;
  images?: string[];
}

export interface CartItem {
  cart_item_id: number;
  quantity: number;
  product: CartProduct;
  variant: CartVariant | null;
  total_item_price: number;
}

export interface CartSummary {
  subtotal: string;
  tax: string;
  /** Fee for the payment_method sent (cash on delivery when none was sent). */
  shipping: string;
  /** Fee per payment method; null while the customer has no address. */
  shipping_fees?: ShippingFees | null;
  free_shipping?: boolean;
  shipping_address_id?: number | null;
  discount: string;
  coupon_code: string | null;
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

/**
 * `addressId` prices shipping for that address (default: the customer's default address).
 * `couponCode`: with a free-shipping coupon every fee comes back 0 and `free_shipping` is true.
 * payment_method isn't sent: the summary's shipping_fees covers every method, so switching
 * methods needs no new request.
 */
export function useCart({ addressId, couponCode }: { addressId?: number | null; couponCode?: string | null } = {}) {
  const loggedIn = useHasAuthToken();
  const params = new URLSearchParams();
  if (addressId) params.set('address_id', String(addressId));
  if (couponCode) params.set('coupon_code', couponCode);
  const qs = params.toString();
  return useQuery({
    // The plain ['cart'] key stays the cart page's (optimistic quantity updates write to it).
    queryKey: qs ? [...cartKeys.all(), qs] : cartKeys.all(),
    queryFn: () => get<CartResponse>(qs ? `/user/cart?${qs}` : '/user/cart'),
    enabled: loggedIn,
    placeholderData: (prev) => prev,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const t = useTranslations('Checkout');
  return useMutation({
    mutationFn: ({ quantity = 1, ...vars }: { variant_id: number; product_id: number; quantity?: number }) => {
      // The backend needs a real number ≥ 1 (a string breaks its stock check; it doesn't reject ≤ 0).
      const qty = Math.max(1, Math.floor(Number(quantity) || 1));
      return post('/user/cart', { ...vars, quantity: qty });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all() });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
      toast.success(t('addedToCart'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('addToCartFailed'));
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, action }: { itemId: number; action: 'plus' | 'minus' }) =>
      put('/user/cart', { cart_item_id: itemId, action }),
    onMutate: async ({ itemId, action }) => {
      await qc.cancelQueries({ queryKey: cartKeys.all() });
      const previous = qc.getQueryData<CartResponse>(cartKeys.all());

      qc.setQueryData<CartResponse>(cartKeys.all(), (old) => {
        if (!old) return old;
        const delta = action === 'plus' ? 1 : -1;
        const updatedItems = old.data.items.map((item) => {
          if (item.cart_item_id !== itemId) return item;
          const newQty = item.quantity + delta;
          const unitPrice = item.total_item_price / item.quantity;
          return { ...item, quantity: newQty, total_item_price: unitPrice * newQty };
        });
        return { ...old, data: { ...old.data, items: updatedItems } };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(cartKeys.all(), ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all() });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const t = useTranslations('Checkout');
  return useMutation({
    mutationFn: (itemId: number) => del(`/user/cart/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all() });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
      toast.success(t('removedFromCart'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('removeFailed'));
    },
  });
}
