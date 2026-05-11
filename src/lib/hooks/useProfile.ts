import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '@/lib/fetcher';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setProfile, setLoading, setError, ProfileState } from '@/lib/store/features/profileSlice';
import { RootState } from '@/lib/store/store';

export interface Address {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    street_address: string;
    apartment: string | null;
    country_id: number;
    country_name?: string;
    latitude?: number | null;
    longitude?: number | null;
    is_default: number;
}

export interface ProfileResponse {
    data: {
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
    };
    message: string;
}

export function useProfile() {
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.profile);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['profile'],
        queryFn: () => get<ProfileResponse>('/user/auth/profile'),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        dispatch(setLoading(isLoading));
    }, [isLoading, dispatch]);

    useEffect(() => {
        if (data?.data) {
            dispatch(setProfile(data.data));
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (isError && error) {
            dispatch(setError(error.message));
        } else {
            dispatch(setError(null));
        }
    }, [isError, error, dispatch]);

    console.log('profile data', profile)

    return { ...profile, refetch };
}

export function useProfileData() {
    return useSelector((state: RootState) => state.profile);
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://mini-man.shaarapp.com';
            
            const res = await fetch(`${BASE_URL}/user/auth/profile`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // Note: No Content-Type for FormData, browser sets it with boundary
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text().catch(() => res.statusText);
                throw new Error(text || 'Failed to update profile');
            }

            return res.json() as Promise<ProfileResponse>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
