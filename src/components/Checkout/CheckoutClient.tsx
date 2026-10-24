'use client';

import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary from '@/components/OrderSummary';
import BranchCard from '@/components/Orders/BranchCard';
import { isAddressComplete } from '@/components/Account/AddressModal';
import {
    useCheckout,
    usePayOrder,
    useValidateCoupon,
    isPaymentMethod,
    markPaymobUnavailable,
    redirectToPayment,
    type CheckoutPayload,
    type PaymentMethod,
} from '@/lib/hooks/useOrders';
import { savePlacedOrder } from '@/components/Checkout/OrderSuccessClient';
import type { CartItem } from '@/lib/hooks/useCart';
import { useCart } from '@/lib/hooks/useCart';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useBranches } from '@/lib/hooks/useBranches';
import { useAuthModal } from '@/lib/context/AuthModalContext';
import CouponField from '@/components/Coupon/CouponField';
import CountryBadge from '@/components/Country/CountryBadge';
import { useAppliedCoupon } from '@/lib/hooks/useAppliedCoupon';
import { parseMinimumAmount } from '@/lib/coupon';
import { ApiError } from '@/lib/fetcher';
import { intlLocale } from '@/lib/intl';

const METHOD_LABEL: Record<PaymentMethod, 'cod' | 'online' | 'branch'> = {
    cash_on_delivery: 'cod',
    paymob: 'online',
    branch_pickup: 'branch',
};

type CheckoutErrorKind = 'stock' | 'address' | 'branch' | 'unavailable' | 'coupon' | 'server' | 'generic';

const NOTES_MAX = 500;

// A line the backend would reject: unavailable now, or more than what's in stock.
function isProblemItem(item: CartItem): boolean {
    const v = item.variant;
    if (!v) return false;
    return v.is_available === 0 || v.is_active === 0 || (v.stock != null && item.quantity > v.stock);
}

interface CheckoutError {
    kind: CheckoutErrorKind;
    message: string;
}

type Phase =
    | { name: 'review' }
    | { name: 'leaving' }
    | { name: 'redirecting'; couponNotice?: string }
    | { name: 'payment-failed'; orderId: number; message: string; couponNotice?: string };

// 400s share one status code — tell them apart by the (localized) server message.
function classifyBadRequest(message: string): CheckoutErrorKind | 'empty' {
    if (/cart is empty|السلة فارغة|سلة.*فارغة/i.test(message)) return 'empty';
    if (/coupon|كوبون|الكوبون|كود الخصم/i.test(message)) return 'coupon';
    if (/stock|مخزون|المخزون/i.test(message)) return 'stock';
    if (/branch|فرع/i.test(message)) return 'branch';
    if (/address|عنوان/i.test(message)) return 'address';
    return 'generic';
}

export default function CheckoutClient() {
    const t = useTranslations('Orders');
    const tc = useTranslations('Checkout');
    const c = useTranslations('Common');
    const locale = useLocale();
    const currentStep = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const methodParam = searchParams.get('method');
    const paymentMethod: PaymentMethod = isPaymentMethod(methodParam) ? methodParam : 'cash_on_delivery';
    const isPickup = paymentMethod === 'branch_pickup';
    const addressIdParam = searchParams.get('address_id');
    const branchIdParam = searchParams.get('branch_id');

    const checkout = useCheckout();
    const queryClient = useQueryClient();
    const payOrder = usePayOrder();
    const { openAuthModal } = useAuthModal();
    const [phase, setPhase] = useState<Phase>({ name: 'review' });
    const [checkoutError, setCheckoutError] = useState<CheckoutError | null>(null);
    const [notes, setNotes] = useState('');
    const [verifyingCart, setVerifyingCart] = useState(false);
    const { data: cartResponse, isLoading: cartLoading, refetch: refetchCart } = useCart();
    const items = cartResponse?.data.items ?? [];
    const summary = cartResponse?.data.summary;
    const subtotal = Number(summary?.subtotal ?? 0);

    const { data: addresses, isLoading: addressesLoading } = useAddresses();
    const address = isPickup
        ? null
        : (addressIdParam
            ? addresses?.find(a => a.id === Number(addressIdParam))
            : addresses?.find(a => a.is_default === 1)) ?? null;

    const { data: branchesResponse } = useBranches();
    const branches = branchesResponse?.data ?? [];
    const branch = isPickup
        ? branches.find(b => b.id === Number(branchIdParam)) ?? (branches.length === 1 ? branches[0] : null)
        : null;

    const tCoupon = useTranslations('Coupon');
    const validateCoupon = useValidateCoupon();
    const { coupon, discount: discountAmount, clearCoupon } = useAppliedCoupon(subtotal);
    // The total the customer saw — compared with the server's total after placing the order.
    const shownTotal = subtotal - discountAmount + Number(summary?.shipping ?? 0) + Number(summary?.tax ?? 0);
    const money = (n: number) =>
        c('currency', { amount: n.toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 }) });

    // Only while reviewing — once an order is placed the server empties the cart.
    useEffect(() => {
        if (phase.name === 'review' && !checkout.isPending && !cartLoading && items.length === 0) {
            router.replace('/cart');
        }
    }, [phase.name, checkout.isPending, cartLoading, items.length]);

    const stepHref = (path: string) => {
        const qs = new URLSearchParams();
        if (path === '/payment') {
            qs.set('method', paymentMethod);
            if (address) qs.set('address_id', String(address.id));
            if (branchIdParam) qs.set('branch_id', branchIdParam);
        }
        const query = qs.toString();
        return query ? `${path}?${query}` : path;
    };

    const startPayment = (paymentUrl: string, couponNotice?: string) => {
        setPhase({ name: 'redirecting', couponNotice });
        // Give the customer time to read a dropped-coupon notice before leaving for Paymob.
        if (couponNotice) setTimeout(() => redirectToPayment(paymentUrl), 4000);
        else redirectToPayment(paymentUrl);
    };

    const handleCompleteOrder = async () => {
        if (checkout.isPending || verifyingCart) return;
        setCheckoutError(null);

        // Re-read the cart: stock or availability may have changed since the page loaded.
        setVerifyingCart(true);
        const { data: freshCart } = await refetchCart();
        setVerifyingCart(false);
        const freshItems = freshCart?.data.items ?? [];
        if (freshCart && freshItems.length === 0) {
            router.replace('/cart');
            return;
        }
        if (freshItems.some(isProblemItem)) {
            setCheckoutError({ kind: 'stock', message: t('cartChanged') });
            return;
        }

        if (!isPickup && (!address || !isAddressComplete(address))) {
            setCheckoutError({ kind: 'address', message: t('completeAddress') });
            return;
        }

        const payload: CheckoutPayload = { payment_method: paymentMethod };
        if (address) payload.address_id = address.id;
        if (isPickup && branch) payload.branch_id = branch.id;

        // Re-check the coupon right before submitting; send it only while it's still valid.
        let couponCode: string | undefined;
        if (coupon) {
            try {
                await validateCoupon.mutateAsync({ code: coupon.code, cart_amount: subtotal });
                couponCode = coupon.code;
            } catch (err) {
                if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
                    clearCoupon();
                    const min = err.status === 400 ? parseMinimumAmount(err.message) : null;
                    setCheckoutError({
                        kind: 'generic',
                        message: min !== null ? tCoupon('removedMinimum', { amount: money(min) }) : tCoupon('removedInvalid'),
                    });
                    return;
                }
                // Network / 500: still send it — the backend re-validates at checkout.
                couponCode = coupon.code;
            }
        }
        if (couponCode) payload.coupon_code = couponCode;
        if (notes.trim()) payload.notes = notes.trim().slice(0, NOTES_MAX);

        checkout.mutate(payload, {
            onSuccess: ({ data, message }) => {
                // The order exists now — the coupon is used up either way.
                clearCoupon();
                // An invalid coupon doesn't error at checkout; the order is just placed without it.
                const couponNotice = couponCode && Number(data.total_amount) > shownTotal + 0.01
                    ? tCoupon('notApplied', { amount: money(Number(data.total_amount)) })
                    : undefined;
                if (data.payment_method === 'paymob') {
                    if (data.redirect_to_payment && data.payment_url) {
                        startPayment(data.payment_url, couponNotice);
                    } else {
                        setPhase({ name: 'payment-failed', orderId: data.order_id, message, couponNotice });
                    }
                    return;
                }
                // Replace, so Back doesn't return to a checkout whose cart is now empty.
                savePlacedOrder({ result: data, message, couponNotice });
                setPhase({ name: 'leaving' });
                router.replace(`/order-success?id=${data.order_id}`);
            },
            onError: (err: Error) => {
                const status = err instanceof ApiError ? err.status : 0;
                if (status === 401) {
                    openAuthModal(handleCompleteOrder);
                    return;
                }
                if (status === 503) {
                    markPaymobUnavailable();
                    setCheckoutError({ kind: 'unavailable', message: err.message });
                    return;
                }
                // 500 / network: the order may already exist — never retry blindly.
                if (status === 0 || status >= 500) {
                    setCheckoutError({ kind: 'server', message: t('serverErrorCheckOrders') });
                    return;
                }
                const kind = status === 400 ? classifyBadRequest(err.message) : 'generic';
                if (kind === 'empty') {
                    router.replace('/cart');
                    return;
                }
                if (kind === 'stock') {
                    toast.error(err.message);
                    queryClient.invalidateQueries({ queryKey: ['cart'] });
                    router.push('/cart');
                    return;
                }
                if (kind === 'coupon') {
                    // e.g. "Coupon usage limit reached": drop it and let them place the order again.
                    clearCoupon();
                    setCheckoutError({ kind, message: t('couponDroppedRetry', { message: err.message }) });
                    return;
                }
                // "Invalid address": it was deleted or isn't the user's — reload the list before they choose again.
                if (kind === 'address') queryClient.invalidateQueries({ queryKey: ['addresses'] });
                // "Please choose the branch…": it's missing / inactive — reload branches and drop the selection.
                if (kind === 'branch') queryClient.invalidateQueries({ queryKey: ['branches'] });
                setCheckoutError({ kind, message: err.message || tc('placeOrderFailed') });
            },
        });
    };

    const handleRetryPayment = (orderId: number) => {
        payOrder.mutate(orderId, {
            onSuccess: ({ data, message }) => {
                if (data.redirect_to_payment && data.payment_url) {
                    startPayment(data.payment_url);
                } else {
                    setPhase({ name: 'payment-failed', orderId, message });
                }
            },
            onError: (err: Error) => {
                if (err instanceof ApiError && err.status === 401) {
                    openAuthModal(() => handleRetryPayment(orderId));
                    return;
                }
                setPhase({ name: 'payment-failed', orderId, message: err.message });
            },
        });
    };

    if (phase.name === 'redirecting' || phase.name === 'leaving') {
        return (
            <div className="container flex flex-col items-center justify-center gap-5 py-28 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                {phase.name === 'redirecting' && (
                    <>
                        {phase.couponNotice && (
                            <p role="alert" className="max-w-[520px] border border-amber-300 bg-amber-50 px-4 py-3 font-beatrice text-[13px] font-medium text-amber-800">
                                {phase.couponNotice}
                            </p>
                        )}
                        <p className="font-beatrice text-[16px] font-semibold text-black">{t('redirecting')}</p>
                    </>
                )}
            </div>
        );
    }

    if (phase.name === 'payment-failed') {
        return (
            <div className="container max-w-[640px] py-16 text-center">
                <h1 className="mb-3 font-beatrice text-[22px] font-bold text-black">
                    {t('orderTitle', { id: phase.orderId })}
                </h1>
                <p className="mb-8 font-beatrice text-[14px] text-gray-600">{phase.message}</p>
                {phase.couponNotice && (
                    <p role="alert" className="-mt-4 mb-8 border border-amber-300 bg-amber-50 px-4 py-3 font-beatrice text-[13px] font-medium text-amber-800">
                        {phase.couponNotice}
                    </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={() => handleRetryPayment(phase.orderId)}
                        disabled={payOrder.isPending}
                        className="bg-black px-6 py-3 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {payOrder.isPending ? t('loading') : t('retryPayment')}
                    </button>
                    <Link
                        href="/account/orders?tab=awaiting"
                        className="border border-black px-6 py-3 font-beatrice text-[15px] font-semibold text-black transition-colors hover:bg-gray-100"
                    >
                        {t('viewOrders')}
                    </Link>
                </div>
            </div>
        );
    }

    const errorAction = checkoutError && {
        address: { href: stepHref('/shipping'), label: address ? t('completeAddressAction') : t('addAddress') },
        branch: { href: `/payment?method=branch_pickup`, label: t('chooseBranch') },
        unavailable: { href: stepHref('/payment'), label: t('paymentMethod') },
        stock: { href: '/cart', label: t('reviewCart') },
        server: { href: '/account/orders', label: t('checkMyOrders') },
        coupon: null,
        generic: null,
    }[checkoutError.kind];

    const errorBox = checkoutError && (
        <div className="mb-3 border border-red-200 bg-red-50 px-4 py-3 font-beatrice text-[13px] text-red-600">
            <p>{checkoutError.message}</p>
            {checkoutError.kind === 'unavailable' && (
                <p className="mt-1 text-red-500">{t('onlineUnavailableHint')}</p>
            )}
            {errorAction && (
                <Link href={errorAction.href} className="mt-2 inline-block font-semibold text-black underline underline-offset-2">
                    {errorAction.label}
                </Link>
            )}
        </div>
    );

    const busy = checkout.isPending || verifyingCart;
    const placeOrderLabel = busy
        ? t('placingOrder')
        : paymentMethod === 'paymob' ? t('continueToPayment') : t('placeOrder');
    const spinner = <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />;
    const arrow = (
        <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{c('home')}</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">{c('cart')}</Link>
                <span>/</span>
                <span className="font-semibold text-black">{tc('checkout')}</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase text-black">
                {tc('checkout')}
            </h1>

            {/* Progress stepper */}
            <CheckoutStepper currentStep={currentStep} />

            <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-start">
                {/* Left: Summary sections */}
                <div className="flex-1 space-y-4 p-0 md:p-10 md:border border-[#E0E0E0] w-full">
                    {/* Shipping / pickup info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="font-beatrice text-[20px] font-bold text-black">
                                {isPickup ? t('pickupBranch') : t('deliveryAddress')}
                            </h2>
                            <Link
                                href={isPickup ? stepHref('/payment') : stepHref('/shipping')}
                                className="font-beatrice text-[13px] text-gray-500 underline underline-offset-2 hover:text-black"
                            >
                                {c('edit')}
                            </Link>
                        </div>
                        {isPickup ? (
                            branch ? (
                                <BranchCard branch={branch} variant="compact" />
                            ) : (
                                <Link href={stepHref('/payment')} className="font-beatrice text-[14px] font-semibold text-black underline underline-offset-2">
                                    {t('chooseBranch')}
                                </Link>
                            )
                        ) : addressesLoading ? (
                            <div className="h-16 animate-pulse bg-gray-200" />
                        ) : address ? (
                            <div className="space-y-1">
                                <p className="font-beatrice text-[14px] text-[#616161] font-medium">{address.first_name} {address.last_name}</p>
                                <p dir="ltr" className="font-beatrice text-[14px] text-[#616161] font-medium rtl:text-right">{address.phone}</p>
                                <p className="font-beatrice text-[14px] text-[#616161] font-medium">
                                    {address.street_address}{address.apartment ? `, ${address.apartment}` : ''}
                                </p>
                                <p className="font-beatrice text-[14px] text-[#616161] font-medium">
                                    {address.bosta_district_name ? `${address.bosta_district_name}, ` : ''}{address.city}
                                </p>
                                <CountryBadge
                                    countryId={address.country_id}
                                    name={address.country_name}
                                    className="font-beatrice text-[14px] font-medium text-[#616161]"
                                />
                                {!isAddressComplete(address) && (
                                    <Link
                                        href={stepHref('/shipping')}
                                        className="mt-2 block border border-amber-300 bg-amber-50 px-3 py-2 font-beatrice text-[13px] font-medium text-amber-800"
                                    >
                                        {t('completeAddress')}
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <Link href={stepHref('/shipping')} className="font-beatrice text-[14px] font-semibold text-black underline underline-offset-2">
                                {t('addAddress')}
                            </Link>
                        )}
                    </div>

                    {/* Payment info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="font-beatrice text-[20px] font-bold text-black">
                                {t('paymentMethod')}
                            </h2>
                            <Link
                                href={stepHref('/payment')}
                                className="font-beatrice text-[13px] text-gray-500 underline underline-offset-2 hover:text-black"
                            >
                                {c('edit')}
                            </Link>
                        </div>
                        <p className="font-beatrice text-[14px] text-black">{t(METHOD_LABEL[paymentMethod])}</p>
                        {isPickup && (
                            <p className="mt-1 font-beatrice text-[13px] text-gray-600">{t('payAtBranch')}</p>
                        )}
                        {paymentMethod === 'paymob' && (
                            <p className="mt-1 font-beatrice text-[13px] text-gray-600">{t('onlineHint')}</p>
                        )}
                    </div>

                    {/* Products box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="font-beatrice text-[20px] font-bold text-black">{c('cart')}</h2>
                            <Link href="/cart" className="font-beatrice text-[13px] text-gray-500 underline underline-offset-2 hover:text-black">
                                {t('editCart')}
                            </Link>
                        </div>
                        {cartLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5 divide-gray-200">
                                {items.map(item => (
                                    <div key={item.cart_item_id} className="flex gap-5">
                                        {/* Image */}
                                        <div className="h-[126px] w-[126px] md:h-[159px] md:w-[159px] shrink-0 bg-[#e8e8e8] flex items-center justify-center">
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="h-full w-full object-contain mix-blend-multiply border-[#D7D7D7]"
                                                onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="font-beatrice font-medium text-[14px] md:text-[20px] text-black mb-1">
                                                {item.product.name}
                                            </h3>
                                            <p className="font-beatrice text-[14px] md:text-[20px] font-extrabold text-black mb-3">
                                                {c('currency', { amount: item.total_item_price.toLocaleString(intlLocale(locale)) })}
                                            </p>
                                            <div className="flex flex-col items-start gap-1 md:gap-2 font-beatrice text-[12px] md:text-[13px] text-black">
                                                <span className="flex items-center gap-1.5">
                                                    {c('color')}
                                                    <span
                                                        className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: item.variant?.color_hexa }}
                                                    />
                                                </span>
                                                <span>
                                                    {c('size')}{' '}
                                                    <span className="font-semibold">{item.variant?.size ?? '—'}</span>
                                                </span>
                                                {item.quantity > 1 && (
                                                    <span>{c('qty')} <span className="font-semibold">{item.quantity}</span></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delivery notes */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <label htmlFor="order-notes" className="mb-3 block font-beatrice text-[16px] font-bold text-black">
                            {t('notes')}
                        </label>
                        <textarea
                            id="order-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
                            maxLength={NOTES_MAX}
                            rows={3}
                            placeholder={t('notesPlaceholder')}
                            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <p className="mt-1 text-end font-beatrice text-[12px] tabular-nums text-gray-400">
                            {notes.length.toLocaleString(intlLocale(locale))}/{NOTES_MAX.toLocaleString(intlLocale(locale))}
                        </p>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <OrderSummary
                    summary={summary}
                    isLoading={cartLoading}
                    couponCode={coupon?.code}
                    discountAmount={discountAmount || undefined}
                    className="w-full shrink-0 border border-gray-200 p-5 md:sticky md:top-[calc(var(--header-h,7rem)+1.5rem)] md:w-[507px] md:p-10"
                >
                    <CouponField subtotal={subtotal} />
                    <div className="hidden md:block">{errorBox}</div>
                    <button
                        onClick={handleCompleteOrder}
                        disabled={busy}
                        aria-busy={busy}
                        className="hidden md:flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <span>{placeOrderLabel}</span>
                        {busy ? spinner : arrow}
                    </button>
                </OrderSummary>

                <div className="w-full md:hidden">{errorBox}</div>
                <button
                    onClick={handleCompleteOrder}
                    disabled={busy}
                    aria-busy={busy}
                    className="flex md:hidden w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                    <span>{placeOrderLabel}</span>
                    {busy ? spinner : arrow}
                </button>
            </div>
        </div>
    );
}
