'use client';

import React, { useState } from 'react';
import CouponField from '@/components/Coupon/CouponField';
import { useAppliedCoupon } from '@/lib/hooks/useAppliedCoupon';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TrashIcon } from '../icons';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/lib/hooks/useCart';
import { intlLocale } from '@/lib/intl';
import { ArrowRight, Heart, ShoppingCart } from 'lucide-react';
import ProductThumb from '@/components/ProductThumb';

export default function CartClient() {
    const t = useTranslations('Checkout');
    const c = useTranslations('Common');
    const locale = useLocale();
    const money = (n: number) => c('currency', { amount: n.toLocaleString(intlLocale(locale)) });
    // isPending (not isLoading): stays true while the login check runs and the cart hasn't been
    // fetched yet — otherwise the page briefly shows "Your cart is empty".
    const { data: response, isPending: isLoading } = useCart();
    const removeItem = useRemoveCartItem();
    const updateItem = useUpdateCartItem();

    const [agreed, setAgreed] = useState(false);

    const cartData = response?.data;
    const items = cartData?.items ?? [];
    const summary = cartData?.summary;

    const subtotal = summary ? parseFloat(summary.subtotal) : 0;
    const tax = summary ? parseFloat(summary.tax) : 0;

    const { coupon: appliedCoupon, discount: discountAmount } = useAppliedCoupon(subtotal);
    const total = subtotal + tax - discountAmount;
    const shippingHref = '/shipping';

    if (isLoading) {
        return (
            <div className="container flex justify-center py-28">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            </div>
        );
    }

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{c('home')}</Link>
                <span>/</span>
                <span aria-current="page" className="font-semibold text-black">{c('cart')}</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-6 font-beatrice text-[20px] font-bold uppercase text-black md:mb-8">
                {c('cart')}
            </h1>

            {/* Empty: a proper empty state instead of an empty box + zero-total summary. */}
            {items.length === 0 ? (
                <EmptyCart />
            ) : (
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                {/* Cart items */}
                <div className="flex-1 border border-gray-200">
                        <div className="divide-y divide-gray-200">
                            {items.map(item => {
                                const variant = item.variant;
                                // The backend doesn't block these — warn so checkout doesn't fail later.
                                const unavailable = !!variant && (variant.is_available === 0 || variant.is_active === 0);
                                const stock = variant?.stock;
                                const overStock = !unavailable && stock != null && item.quantity > stock;
                                const atMaxStock = stock != null && item.quantity >= stock;
                                return (
                                <Link
                                    href={`/products/${item.product.slug || item.product.id}`}
                                    key={item.cart_item_id}
                                    className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-5 lg:p-6"
                                >
                                    <div className="flex gap-4 sm:gap-5 lg:contents">
                                        {/* Image */}
                                        <ProductThumb src={item.product.image_url} alt={item.product.name} className="h-[96px] w-[96px] sm:h-[130px] sm:w-[130px]" />

                                        {/* Details */}
                                        <div className="min-w-0 flex-1 lg:pe-8">
                                            <h3 className="mb-1 line-clamp-2 pe-8 font-beatrice text-[14px] font-medium leading-snug text-black sm:line-clamp-none sm:text-[20px]">
                                                {item.product.name}
                                            </h3>
                                            <p className="mb-2 font-beatrice text-[15px] font-extrabold text-black sm:mb-4 sm:text-[20px]">
                                                {money(item.total_item_price)}
                                            </p>

                                            {variant && (
                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-beatrice text-[12px] text-black sm:text-[13px]">
                                                    <span className="flex items-center gap-1.5">
                                                        {c('color')}
                                                        <span
                                                            className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                            style={{ backgroundColor: variant.color_hexa }}
                                                        />
                                                    </span>
                                                    <span>
                                                        {c('size')} <span className="font-semibold">{variant.size}</span>
                                                    </span>
                                                </div>
                                            )}

                                            {(unavailable || overStock) && (
                                                <p className="mt-2 inline-block rounded bg-amber-50 px-2 py-1 font-beatrice text-[12px] font-medium text-amber-800">
                                                    {unavailable ? t('noLongerAvailable') : t('onlyNLeft', { n: stock ?? 0 })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeItem.mutate(item.cart_item_id);
                                        }}
                                        disabled={removeItem.isPending}
                                        className="absolute end-4 top-4 text-red-500 transition-colors hover:text-red-700 disabled:opacity-50 sm:end-5 sm:top-5"
                                        aria-label={t('removeItem')}
                                    >
                                        <TrashIcon />
                                    </button>

                                    {/* Quantity */}
                                    <div onClick={(e: React.MouseEvent) => e.preventDefault()} className="mt-1 flex justify-end lg:absolute lg:bottom-5 lg:end-5 lg:mt-0">
                                        <div className="flex items-center border border-gray-300">
                                            <button
                                                onClick={() => updateItem.mutate({ itemId: item.cart_item_id, action: 'minus' })}
                                                aria-label={t('decreaseQty')}
                                                disabled={item.quantity <= 1 || updateItem.isPending}
                                                className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100 disabled:opacity-40"
                                            >
                                                −
                                            </button>
                                            <span className="flex h-8 w-8 items-center justify-center border-x border-gray-300 font-beatrice text-[14px] font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateItem.mutate({ itemId: item.cart_item_id, action: 'plus' })}
                                                aria-label={t('increaseQty')}
                                                disabled={updateItem.isPending || atMaxStock || unavailable}
                                                className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100 disabled:opacity-40"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                </div>

                {/* Order summary */}
                <div className="w-full shrink-0 border border-gray-200 p-5 sm:p-6 md:p-8 xl:w-[416px] xl:p-10">
                    <h2 className="mb-6 font-beatrice text-[20px] font-bold text-black">{c('orderSummary')}</h2>

                    <div className="mb-4 space-y-[20px]">
                        <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">{c('subtotal')}</span>
                            <span className="text-end font-bold text-black">
                                {summary ? money(parseFloat(summary.subtotal)) : '—'}
                            </span>
                        </div>

                        {/* <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">Tax</span>
                            <span className="text-right font-bold text-black">
                                {summary ? parseFloat(summary.tax).toLocaleString() : '—'} EGP
                            </span>
                        </div> */}

                        <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">{c('shipping')}</span>
                            <span className="text-end font-bold text-black">{money(0)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px] text-green-600">
                                <span>{t('discountWithCode', { code: appliedCoupon?.code ?? '' })}</span>
                                <span className="text-end font-bold">
                                    −{money(discountAmount)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mb-8 border-t border-gray-200 pt-5 sm:mb-10">
                        <div className="flex items-baseline justify-between gap-4 font-beatrice">
                            <span className="text-[18px] font-bold text-black sm:text-[20px]">{c('total')}</span>
                            <span className="text-end text-[18px] font-extrabold text-black sm:text-[20px]">
                                {money(total)}
                            </span>
                        </div>
                    </div>

                    <CouponField subtotal={subtotal} />

                    {/* Terms */}
                    <label className="mb-5 flex cursor-pointer items-start gap-2.5">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-black"
                        />
                        <span className="font-beatrice text-[13px] text-gray-600">
                            {t.rich('agreeTerms', {
                                b: chunks => (
                                    // Opens in a new tab so the cart stays put; doesn't toggle the checkbox.
                                    <Link
                                        href="/pages/terms-and-conditions"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="font-bold text-black underline underline-offset-2 hover:text-gray-600"
                                    >
                                        {chunks}
                                    </Link>
                                ),
                            })}
                        </span>
                    </label>

                    {/* Checkout */}
                    <Link href={shippingHref}>
                        <button
                            disabled={!agreed || items.length === 0}
                            className="flex w-full items-center justify-between gap-4 bg-black px-4 py-3 font-beatrice text-[17px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[20px]"
                        >
                            <span>{t('goToCheckout')}</span>
                            <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="shrink-0 rtl:rotate-180">
                                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>
            )}
        </div>
    );
}

function EmptyCart() {
    const t = useTranslations('Checkout');
    return (
        <div className="flex flex-col items-center px-4 py-14 text-center md:py-20">
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCart size={40} strokeWidth={1.5} className="text-gray-400" aria-hidden />
                <span aria-hidden className="absolute -end-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white font-beatrice text-[14px] font-bold text-gray-400 shadow ring-1 ring-gray-200">
                    0
                </span>
            </div>
            <h2 className="font-beatrice text-[20px] font-bold text-black md:text-[24px]">{t('emptyCartTitle')}</h2>
            <p className="mt-2 max-w-[360px] font-beatrice text-[14px] leading-relaxed text-gray-500">{t('emptyCartHint')}</p>
            <div className="mt-7 flex w-full max-w-[360px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
                <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 bg-black px-8 py-3 font-beatrice text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-800"
                >
                    {t('startShopping')}
                    <ArrowRight size={16} className="rtl:rotate-180" aria-hidden />
                </Link>
                <Link
                    href="/favorites"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 px-8 py-3 font-beatrice text-[14px] font-semibold uppercase tracking-wide text-gray-700 transition-colors hover:bg-black hover:text-white"
                >
                    <Heart size={16} aria-hidden />
                    {t('yourFavorites')}
                </Link>
            </div>
        </div>
    );
}
