import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post, fetcherWithStatus } from '@/lib/fetcher';

export interface ShippingAddress {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    street_address: string;
    apartment: string;
    city: string;
    country_id: number;
}

export interface Order {
    id: number;
    status: string;
    payment_status: string;
    payment_method: string;
    subtotal: string;
    tax_amount: string;
    shipping_amount: string;
    coupon_discount: string;
    total_amount: string;
    notes: string;
    created_at: string;
    current_status: string;
    shipping_address: ShippingAddress;
}

export interface OrdersResponse {
    data: Order[];
    pagination: { page: number; per_page: number; total: number; total_pages: number };
}

export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: () => get<OrdersResponse>('/user/orders'),
    });
}

export interface OrderItem {
    id: number;
    quantity: number;
    price_at_purchase: string;
    product_snapshot: {
        name: string;
        slug: string;
        image_url: string;
        variant_details: {
            id: number;
            size: string;
            color_hexa: string;
            sku: string;
        };
    };
}

export interface TrackingEntry {
    id: number;
    status: string;
    notes: string;
    created_at: string;
}

export interface OrderDetail extends Order {
    tax_amount: string;
    shipping_amount: string;
    coupon_discount: string;
    items: OrderItem[];
    tracking_history: TrackingEntry[];
}

export interface OrderDetailResponse {
    data: OrderDetail;
}

export function useOrderDetail(id: string) {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => get<OrderDetailResponse>(`/user/orders/${id}`),
        enabled: !!id,
    });
}

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

export interface CheckoutResponse {
    data: { order_id: number; total_amount: number };
    message: string;
}

export function useCheckout() {
    return useMutation({
        mutationFn: (couponCode?: string) => {
            const body: Record<string, string> = {
                payment_method: 'cash_on_delivery',
                notes: 'Delivery via Default Address',
            };
            if (couponCode) body.coupon_code = couponCode;
            return fetcherWithStatus<CheckoutResponse>('/user/orders/checkout', {
                method: 'POST',
                body: JSON.stringify(body),
            });
        },
    });
}
