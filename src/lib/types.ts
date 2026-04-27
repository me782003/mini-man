// ─── Shared domain types ────────────────────────────────────────────────────

export interface ColorVariant {
  color: string;
  images: string[];
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  oldPrice?: string;
  sizes: number[];
  description: string;
  colorVariants: ColorVariant[];
}

// ─── Product detail (GET /user/catalog/products/:id) ────────────────────────

export interface ProductDetailColor {
  id: number;
  hexa: string;
  image: string | null;
}

export interface ProductDetailVariantColor extends ProductDetailColor {
  variant_id: number;
  sku: string;
  price_modifier: string;
  stock: number;
  is_active: number;
  is_available: number;
}

export interface ProductDetailVariant {
  id: number;
  name: string; // size label e.g. "40"
  colors: ProductDetailVariantColor[];
}

export interface ProductDetailImage {
  id: number;
  image_path: string;
  is_primary: number;
  sort_order: number;
}

export interface ProductDetailBreadcrumb {
  label: string;
  url: string | null;
}

export interface ProductDetailData {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  stock: number;
  is_active: number;
  is_available: number;
  image_url: string;
  category_collection: {
    collection: { id: number; name: string };
    category: { id: number; name: string };
  };
  sub_category: { id: number; name: string };
  images: ProductDetailImage[];
  colors: ProductDetailColor[];
  variants: ProductDetailVariant[];
  is_in_favourite: boolean;
  favourite_id: number | null;
  is_in_cart: boolean;
  cart_item_id: number | null;
  cart_item_quantity: number;
  breadcrumbs: ProductDetailBreadcrumb[];
}

export interface ProductDetailResponse {
  data: ProductDetailData;
  message: string;
  error: string;
  errors: string[];
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  body: string;
  date: string;
}

export interface ApiError {
  message: string;
  status: number;
}
