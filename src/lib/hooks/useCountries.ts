import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface Country {
  id: number;
  code: string;
  phone_code: string;
  flag_url: string;
  name: string;
}

interface CountriesResponse {
  data: Country[];
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => get<CountriesResponse>('/user/auth/countries').then(r => r.data),
    staleTime: Infinity,
  });
}
