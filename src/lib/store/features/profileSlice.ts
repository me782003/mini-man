import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
    id: number | null;
    name: string;
    phone: string;
    email: string;
    is_verified: number;
    profile_picture: string | null;
    favourite_quantity: number;
    cart_quantity: number;
    orders_numbers: number;
    addresses_number: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    id: null,
    name: '',
    phone: '',
    email: '',
    is_verified: 0,
    profile_picture: null,
    favourite_quantity: 0,
    cart_quantity: 0,
    orders_numbers: 0,
    addresses_number: 0,
    isLoading: false,
    error: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
            return { ...state, ...action.payload };
        },
        clearProfile: () => initialState,
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setProfile, clearProfile, setLoading, setError } = profileSlice.actions;
export default profileSlice.reducer;
