// Thin re-exports kept for server-component usage (no React Query needed there).
// Client components should use hooks from @/lib/hooks/* instead.

export { useProducts, useProduct, useProductDetail, useAddToCart } from '@/lib/hooks/useProducts';
export type { ProductsQuery, ProductsResponse } from '@/lib/hooks/useProducts';

