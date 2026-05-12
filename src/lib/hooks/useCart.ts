import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/fetcher';
import { toast } from 'sonner';

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
  shipping: string;
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
      toast.success('Added to cart');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add to cart');
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
  return useMutation({
    mutationFn: (itemId: number) => del(`/user/cart/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all() });
      qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
      toast.success('Removed from cart');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove item');
    },
  });
}
