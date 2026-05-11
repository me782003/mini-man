import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface HomeBanner {
  id: number;
  image_url: string;
  link: string;
}

export interface HomeTickerItem {
  id: number;
  primary_text: string;
  secondary_text: string;
  primary_text_color: string;
  secondary_text_color: string;
}

export interface HomeTickers {
  background: string;
  items: HomeTickerItem[];
}

export interface HomeProduct {
  id: number;
  slug: string;
  name: string;
  price: string;
  image_url: string;
  stock?: number;
  is_active?: number;
  is_available?: number;
  is_in_favourite?: boolean;
  favourite_id?: number | null;
  is_in_cart?: boolean;
  cart_item_id?: number | null;
  cart_item_quantity?: number;
  images: { id: number; image_path: string; is_primary: number; sort_order: number; color_id?: number; color_hexa?: string }[];
  colors: { id: number; hexa: string; images: string[] }[];
  variants: {
    id: number;
    name: string;
    colors: {
      id: number;
      hexa: string;
      variant_id: number;
      sku: string;
      price_modifier: string;
      stock: number;
      images: string[];
      is_in_cart?: boolean;
      cart_item_id?: number | null;
      cart_item_quantity?: number;
    }[];
  }[];
}

export interface HomeSection {
  title: string;
  count: number;
  products: HomeProduct[];
}

export interface HomeCollectionCategory {
  title: string;
  id: number | null;
  category_collection_id: number | null;
  count_of_products: number;
  sub_categories: { id: number; name: string }[];
  products: HomeProduct[];
}

export interface HomeCollection {
  collection_id: number;
  title: string;
  type: string;
  count_of_products: number;
  count_of_categories: number;
  categories: HomeCollectionCategory[];
}

export interface HomeReview {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  review_date: string | null;
  comment: string | null;
}

export interface HomePageData {
  banners: HomeBanner[];
  tickers: HomeTickers;
  last_week_added: HomeSection;
  collections: HomeCollection[];
  reviews: HomeReview[];
}

export function useHomePage() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => get<{ data: HomePageData }>('/user/pages/home'),
    staleTime: 5 * 60 * 1000,
  });
}
