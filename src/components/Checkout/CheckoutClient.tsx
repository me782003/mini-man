'use client';

import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary from '@/components/OrderSummary';
import { useCheckout, useValidateCoupon } from '@/lib/hooks/useOrders';
import { useCart } from '@/lib/hooks/useCart';

export default function CheckoutClient() {
    const currentStep = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const coupon = searchParams.get('coupon') ?? undefined;
    const checkout = useCheckout();
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const { data: cartResponse, isLoading: cartLoading } = useCart();
    const items = cartResponse?.data.items ?? [];
    const summary = cartResponse?.data.summary;
    const subtotal = Number(summary?.subtotal ?? 0);

    const validateCoupon = useValidateCoupon();
    useEffect(() => {
        if (coupon && subtotal > 0) {
            validateCoupon.mutate({ code: coupon, cart_amount: subtotal });
        }
    }, [coupon, subtotal]);

    const discountAmount = validateCoupon.data
        ? (() => {
            const c = validateCoupon.data.data;
            if (c.type === 'percentage') {
                const d = (subtotal * parseFloat(c.value)) / 100;
                return Math.min(d, parseFloat(c.max_discount));
            }
            return parseFloat(c.value);
        })()
        : 0;

    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            router.replace('/cart');
        }
    }, [cartLoading, items.length]);

    const handleCompleteOrder = () => {
        setCheckoutError(null);
        checkout.mutate(coupon, {
            onSuccess: ({ status }) => {
                if (status === 201) {
                    router.push('/account/orders');
                } else {
                    router.push('/payment');
                }
            },
            onError: (err: any) => {
                setCheckoutError(err.message || 'Failed to place order. Please try again.');
            },
        });
    };

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">Shopping Cart</Link>
                <span>/</span>
                <span className="font-semibold text-black">Checkout</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase text-black">
                Checkout
            </h1>

            {/* Progress stepper */}
            <CheckoutStepper currentStep={currentStep} />

            <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-start">
                {/* Left: Summary sections */}
                <div className="flex-1 space-y-4 p-0 md:p-10 md:border border-[#E0E0E0] w-full">
                    {/* Shipping info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <h2 className="mb-4 font-beatrice text-[20px] font-bold text-black">
                            Shipping
                        </h2>
                        <div className="space-y-1">
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">Ahmed Al Saud</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">+20 15578 15 853</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">Cairo, Building 123</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">Egypt, 12345</p>
                        </div>
                    </div>

                    {/* Payment info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <h2 className="mb-4 font-beatrice text-[20px] font-bold text-black">
                            Payment
                        </h2>
                        <p className="font-beatrice text-[14px] text-black">Cash on Delivery</p>
                    </div>

                    {/* Products box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
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
                                                className="h-full w-full object-contain border-[#D7D7D7]"
                                                onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="font-beatrice font-medium text-[14px] md:text-[20px] text-black mb-1">
                                                {item.product.name}
                                            </h3>
                                            <p className="font-beatrice text-[14px] md:text-[20px] font-extrabold text-black mb-3">
                                                {item.total_item_price.toLocaleString()} EGP
                                            </p>
                                            <div className="flex flex-col items-start gap-1 md:gap-2 font-beatrice text-[12px] md:text-[13px] text-black">
                                                <span className="flex items-center gap-1.5">
                                                    Color
                                                    <span
                                                        className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: item.variant.color_hexa }}
                                                    />
                                                </span>
                                                <span>
                                                    Size{' '}
                                                    <span className="font-semibold">{item.variant.size}</span>
                                                </span>
                                                {item.quantity > 1 && (
                                                    <span>Qty <span className="font-semibold">{item.quantity}</span></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <OrderSummary
                    summary={summary}
                    isLoading={cartLoading}
                    couponCode={coupon}
                    discountAmount={discountAmount || undefined}
                >
                    {checkoutError && (
                        <p className="mb-3 text-sm text-red-500 font-beatrice">{checkoutError}</p>
                    )}
                    <button
                        onClick={handleCompleteOrder}
                        disabled={checkout.isPending}
                        className="hidden md:flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <span>{checkout.isPending ? 'Placing order...' : 'Complete the request'}</span>
                        <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </OrderSummary>

                {checkoutError && (
                    <p className="flex md:hidden mb-2 text-sm text-red-500 font-beatrice">{checkoutError}</p>
                )}
                <button
                    onClick={handleCompleteOrder}
                    disabled={checkout.isPending}
                    className="flex md:hidden w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                    <span>{checkout.isPending ? 'Placing order...' : 'Complete the request'}</span>
                    <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                        <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
