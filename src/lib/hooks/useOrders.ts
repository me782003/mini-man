import { useMutation } from '@tanstack/react-query';
import { post } from '@/lib/fetcher';

export interface CouponData {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: string;
    max_discount: string;
}

export interface CouponResponse {
    data: CouponData;
    message: string;
}

export function useValidateCoupon() {
    return useMutation({
        mutationFn: (vars: { code: string; cart_amount: number }) =>
            post<CouponResponse>('/user/orders/validate-coupon', vars),
    });
}
