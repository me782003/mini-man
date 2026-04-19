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
