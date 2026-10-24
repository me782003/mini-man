import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface BostaCity {
  id: string;
  name: string;
  name_ar: string;
  code: string;
}

export interface BostaDistrict {
  id: string;
  name: string;
  name_ar: string;
  zone_id: string;
  zone_name: string;
  zone_name_ar: string;
}

export function useBostaCities() {
  return useQuery({
    queryKey: ['shipping', 'cities'],
    queryFn: () => get<{ data: BostaCity[] }>('/user/shipping/cities').then(r => r.data),
    staleTime: Infinity,
  });
}

export function useBostaDistricts(cityId: string | null) {
  return useQuery({
    queryKey: ['shipping', 'cities', cityId, 'districts'],
    queryFn: () => get<{ data: BostaDistrict[] }>(`/user/shipping/cities/${cityId}/districts`).then(r => r.data),
    enabled: !!cityId,
    staleTime: Infinity,
  });
}
