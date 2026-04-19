import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface Address {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  country_id: number;
  street_address: string;
  apartment: string;
  city: string;
  is_default: number;
  created_at: string;
  updated_at: string;
  country_code: string;
  phone_code: string;
  flag_url: string;
  country_name: string;
}

export interface Profile {
  id: number;
  name: string;
  phone: string;
  email: string;
  is_verified: number;
  profile_picture: string | null;
  favourite_quantity: number;
  cart_quantity: number;
  orders_numbers: number;
  addresses_number: number;
  main_address: Address | null;
  all_addresses: Address[];
}

interface ProfileResponse {
  data: Profile;
  message: string;
  error: string;
  errors: string[];
}

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      get<ProfileResponse>('/user/auth/profile', {
        headers: getAuthHeader(),
      }).then((res) => res.data),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
    staleTime: 5 * 60 * 1000,
  });
}
