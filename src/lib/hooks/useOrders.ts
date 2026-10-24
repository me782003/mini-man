import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, get, post } from '@/lib/fetcher';
import { normalizeCouponCode, type Coupon } from '@/lib/coupon';
import { useHasAuthToken } from '@/lib/auth-token';

export interface ShippingAddress {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    street_address: string;
    apartment: string;
    city: string;
    country_id: number;
    bosta_city_name?: string | null;
    bosta_district_name?: string | null;
    /** Pickup orders carry the branch here. */
    pickup_branch?: PickupBranch | null;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

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
    updated_at?: string;
    current_status: string;
    shipping_address: ShippingAddress | null;
}

export interface OrdersResponse {
    data: Order[];
    pagination: { page: number; per_page: number; total: number; total_pages: number };
}

export interface OrdersQuery {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
    /** YYYY-MM-DD — the API filters by date only when both are sent. */
    from_date?: string;
    to_date?: string;
    sort_by?: 'created_at' | 'total_amount' | 'status';
    sort_order?: 'ASC' | 'DESC';
}

export function useOrders(query: OrdersQuery = {}) {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.status) params.set('status', query.status);
    if (query.search?.trim()) params.set('search', query.search.trim());
    if (query.from_date && query.to_date) {
        params.set('from_date', query.from_date);
        params.set('to_date', query.to_date);
    }
    if (query.sort_by) params.set('sort_by', query.sort_by);
    if (query.sort_order) params.set('sort_order', query.sort_order);
    const qs = params.toString();
    const loggedIn = useHasAuthToken();
    return useQuery({
        queryKey: ['orders', 'list', qs],
        queryFn: () => get<OrdersResponse>(`/user/orders${qs ? `?${qs}` : ''}`),
        enabled: loggedIn,
        placeholderData: (prev) => prev,
    });
}

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

export interface OrderItem {
    id: number;
    product_id?: number;
    variant_id?: number | null;
    quantity: number;
    price_at_purchase: string;
    product_snapshot: {
        name: string;
        slug: string;
        image_url: string;
        short_description?: string;
        variant_details: {
            id?: number;
            size: string;
            color_hexa: string;
            sku: string;
            images?: string[];
        } | null;
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
    const loggedIn = useHasAuthToken();
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => get<OrderDetailResponse>(`/user/orders/${id}`),
        enabled: loggedIn && !!id,
        retry: (count, error) => !isNotFound(error) && count < 1,
    });
}

export interface ReorderResult {
    added: number;
    /** Items that couldn't be added (sold out, removed…), with the server's reason. */
    failed: { name: string; message: string }[];
}

/**
 * "Reorder" = put the order's items back in the cart with the documented cart API
 * (one POST /user/cart per item). Items are added one at a time so each gets its own stock check.
 */
export function useReorder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (items: OrderItem[]): Promise<ReorderResult> => {
            const result: ReorderResult = { added: 0, failed: [] };
            for (const item of items) {
                const name = item.product_snapshot?.name ?? '';
                const variantId = item.variant_id ?? item.product_snapshot?.variant_details?.id;
                if (!item.product_id || !variantId) {
                    result.failed.push({ name, message: '' });
                    continue;
                }
                try {
                    await post('/user/cart', {
                        product_id: item.product_id,
                        variant_id: variantId,
                        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
                    });
                    result.added += 1;
                } catch (err) {
                    result.failed.push({ name, message: err instanceof Error ? err.message : '' });
                }
            }
            return result;
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['cart'] });
            qc.invalidateQueries({ queryKey: ['profile'] });
            qc.invalidateQueries({ queryKey: ['products', 'detail-v2'] });
        },
    });
}

export type { Coupon as CouponData } from '@/lib/coupon';

export interface CouponResponse {
    data: Coupon;
    message: string;
}

export function useValidateCoupon() {
    return useMutation({
        mutationFn: (vars: { code: string; cart_amount: number }) => {
            const code = normalizeCouponCode(vars.code);
            // An empty code makes the backend 500 — never send one.
            if (!code) return Promise.reject(new Error('Coupon code is empty'));
            return post<CouponResponse>('/user/orders/validate-coupon', {
                code,
                // Always a number, before discount — without it the backend skips the minimum-order check.
                cart_amount: Number(vars.cart_amount) || 0,
            });
        },
    });
}

export const orderKeys = {
    all: () => ['orders'] as const,
    abandoned: (page: number) => ['orders', 'abandoned', page] as const,
    tracking: (id: string) => ['orders', id, 'tracking'] as const,
};

/* ─── Checkout ─────────────────────────────────────────────────────────── */

export type PaymentMethod = 'cash_on_delivery' | 'paymob' | 'branch_pickup';

export const PAYMENT_METHODS: PaymentMethod[] = ['cash_on_delivery', 'paymob', 'branch_pickup'];

export function isPaymentMethod(value: string | null): value is PaymentMethod {
    return PAYMENT_METHODS.includes(value as PaymentMethod);
}

export interface PickupBranch {
    id: number;
    name: string;
    address: string;
    phone: string;
    map_link: string | null;
}

export interface CheckoutPayload {
    payment_method: PaymentMethod;
    address_id?: number;
    branch_id?: number;
    coupon_code?: string;
    notes?: string;
}

export interface CheckoutResult {
    order_id: number;
    total_amount: number;
    payment_method: PaymentMethod;
    pickup_branch?: PickupBranch | null;
    redirect_to_payment?: boolean;
    payment_url?: string | null;
}

export interface CheckoutResponse {
    data: CheckoutResult;
    message: string;
}

export function useCheckout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CheckoutPayload) =>
            post<CheckoutResponse>('/user/orders/checkout', payload),
        onSuccess: () => {
            // The server empties the cart itself (right away for COD / pickup,
            // after the payment webhook for online) — never clear it locally.
            qc.invalidateQueries({ queryKey: ['cart'] });
            qc.invalidateQueries({ queryKey: orderKeys.all() });
            qc.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

/* ─── Online payment ───────────────────────────────────────────────────── */

export interface PayOrderResponse {
    data: {
        order_id: number;
        total_amount: number;
        redirect_to_payment: boolean;
        payment_url: string | null;
    };
    message: string;
}

export function usePayOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (orderId: number) => post<PayOrderResponse>(`/user/orders/${orderId}/pay`, {}),
        onError: () => {
            // Already paid / cancelled — the order may have moved between lists.
            qc.invalidateQueries({ queryKey: orderKeys.all() });
        },
    });
}

// After a 503 ("online payment unavailable") hide Paymob for the rest of the session.
const PAYMOB_UNAVAILABLE_KEY = 'paymob_unavailable';

export function markPaymobUnavailable() {
    try { window.sessionStorage.setItem(PAYMOB_UNAVAILABLE_KEY, '1'); } catch { /* storage blocked */ }
}

export function isPaymobUnavailable(): boolean {
    if (typeof window === 'undefined') return false;
    try { return window.sessionStorage.getItem(PAYMOB_UNAVAILABLE_KEY) === '1'; } catch { return false; }
}

// Paymob must open as a full-page redirect — no iframe, no new tab.
export function redirectToPayment(paymentUrl: string) {
    window.location.assign(paymentUrl);
}

export type AbandonReason = 'payment_failed' | 'not_completed';

export interface AbandonedOrder extends Order {
    abandon_reason: AbandonReason;
    can_pay: boolean;
}

export interface AbandonedOrdersResponse {
    data: AbandonedOrder[];
    pagination: { page: number; per_page: number; total: number; total_pages: number };
}

export function useAbandonedOrders(page = 1, limit = 10) {
    const loggedIn = useHasAuthToken();
    return useQuery({
        queryKey: orderKeys.abandoned(page),
        queryFn: () => get<AbandonedOrdersResponse>(`/user/orders/abandoned?page=${page}&limit=${limit}`),
        enabled: loggedIn,
    });
}

/* ─── Tracking ─────────────────────────────────────────────────────────── */

export type StageStatus = 'done' | 'current' | 'pending';

export interface TrackingStage {
    key: string;
    title: string;
    status: StageStatus;
    date: string | null;
}

export interface TrackingEvent {
    state_code: number;
    title: string;
    exception_reason: string | null;
    date: string;
}

export interface TrackingShipment {
    provider: string;
    tracking_number: string;
    tracking_url: string | null;
    status_code: number;
    status: string;
    is_active: boolean;
    created_at: string;
}

export interface TrackingIssue {
    code: number;
    title: string;
    reason: string | null;
}

export interface OrderTracking {
    order_id: number;
    order_status: string;
    payment_status: string;
    cancelled: boolean;
    delivery_type: 'shipping' | 'branch_pickup';
    pickup_branch: PickupBranch | null;
    shipment: TrackingShipment | null;
    issue: TrackingIssue | null;
    stages: TrackingStage[];
    events: TrackingEvent[];
}

/** Still moving: not cancelled and the last stage isn't done yet. */
export function isTrackingActive(tracking: OrderTracking | undefined): boolean {
    if (!tracking || tracking.cancelled) return false;
    const last = tracking.stages[tracking.stages.length - 1];
    return !last || last.status !== 'done';
}

export function useOrderTracking(id: string) {
    const loggedIn = useHasAuthToken();
    return useQuery({
        queryKey: orderKeys.tracking(id),
        queryFn: () => get<{ data: OrderTracking }>(`/user/orders/${id}/tracking`).then(r => r.data),
        enabled: loggedIn && !!id,
        retry: (count, error) => !isNotFound(error) && count < 1,
        // Data only changes when Bosta sends an update — refresh every minute (and on focus)
        // while the order is moving; stop once it's delivered/collected or cancelled.
        staleTime: 0,
        refetchInterval: (query) => (isTrackingActive(query.state.data) ? 60 * 1000 : false),
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: (query) => isTrackingActive(query.state.data),
    });
}
