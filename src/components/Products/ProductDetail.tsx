'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeartIcon } from '../icons';
import { useProductDetail } from '@/lib/hooks/useProducts';
import { useAddToWishlist, useRemoveFromWishlist } from '@/lib/hooks/useWishlist';
import { useRemoveCartItem, useAddToCart, useUpdateCartItem } from '@/lib/hooks/useCart';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { useAuthModal } from '@/lib/context/AuthModalContext';
import { ApiError } from '@/lib/fetcher';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import SwiperSection from '../SwiperSection';
import { intlLocale } from '@/lib/intl';
import ColorSwatch from '@/components/ColorSwatch';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import ProductDescription from './ProductDescription';
import { Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

type ProductColorImage = { id: number; url: string };

type ProductColorLike = {
    id: number;
    hexa: string;
    color_hexa?: string;
    images?: ProductColorImage[] | string[];
    variant_id?: number;
    sku?: string;
    price_modifier?: string | number;
    stock?: number;
    is_active?: number | boolean;
    is_available?: number | boolean;
    is_in_cart?: boolean;
    cart_item_id?: number | null;
    cart_item_quantity?: number;
};

type ProductVariantLike = {
    id: number;
    name: string;
    colors?: ProductColorLike[];
};

type ProductImageLike = {
    id?: number;
    image_path: string;
    is_primary?: number | boolean;
    sort_order?: number;
    color_id?: number | null;
    color_hexa?: string;
};

function isEnabled(value: number | boolean | undefined | null) {
    return value === undefined || value === null || value === 1 || value === true;
}

function hasStock(color: ProductColorLike) {
    return isEnabled(color.is_active) && isEnabled(color.is_available) && Number(color.stock || 0) > 0;
}

function sizeHasStock(variant: ProductVariantLike) {
    return (variant.colors ?? []).some(hasStock);
}

function firstInStockColor(colors: ProductColorLike[]): ProductColorLike | null {
    return colors.find(hasStock) ?? null;
}

// Returns [variantIdx, colorId] for the first variant+color with stock.
// If the given variantIdx has an in-stock color, stays on that variant.
// Otherwise walks forward (then wraps) to find one that does.
function resolveInitialSelection(
    variants: ProductVariantLike[],
    preferredVariantIdx: number
): [number, number | null] {
    const total = variants.length;
    for (let i = 0; i < total; i++) {
        const idx = (preferredVariantIdx + i) % total;
        const color = firstInStockColor(variants[idx]?.colors ?? []);
        if (color) return [idx, color.id];
    }
    // All out of stock — stay on preferred variant, first color
    const firstColor = variants[preferredVariantIdx]?.colors?.[0] ?? null;
    return [preferredVariantIdx, firstColor?.id ?? null];
}


export default function ProductDetail({ id }: { id: string }) {
    const t = useTranslations('Products');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const { data, isPending, isError, error, isFetching } = useProductDetail(id);

    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const thumbsSwiperRef = React.useRef<SwiperType | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const galleryLengthRef = React.useRef(0);
    const touchStartX = React.useRef<number | null>(null);

    // Pick the default size/colour once per product. Adding to cart or favourites refetches the
    // product (to refresh cart state), and that must not reset the shopper's selection.
    const initialisedFor = React.useRef<number | null>(null);
    useEffect(() => {
        const product = data?.data;
        const v = (product?.variants ?? []) as ProductVariantLike[];
        if (!product || v.length === 0 || initialisedFor.current === product.id) return;
        initialisedFor.current = product.id;
        const [resolvedIdx, resolvedColorId] = resolveInitialSelection(v, 0);
        setSelectedVariantIdx(resolvedIdx);
        setSelectedColorId(resolvedColorId);
    }, [data]);

    const addToWishlist = useAddToWishlist();
    const removeFromWishlist = useRemoveFromWishlist();
    const addToCart = useAddToCart();
    const removeFromCart = useRemoveCartItem();
    const updateCartItem = useUpdateCartItem();
    const { isLoggedIn } = useAuthState();
    const { openAuthModal } = useAuthModal();
    const mainSwiperRef = React.useRef<SwiperType | null>(null);

    useEffect(() => {
        if (!lightboxOpen) return;
        const handler = (e: KeyboardEvent) => {
            const len = galleryLengthRef.current;
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % len);
            if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + len) % len);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxOpen]);
    // Lock page scroll behind the lightbox.
    useLockBodyScroll(lightboxOpen);

    if (isPending) {
        return (
            <section className="container">
                <div className="grid grid-cols-1 gap-10 md:flex">
                    <div className="flex h-[290px] flex-1 gap-[10px] md:h-[558px] md:gap-5">
                        <div className="flex-1 animate-pulse bg-neutral-200" />
                        <div className="flex shrink-0 flex-col gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[50px] w-[50px] animate-pulse bg-neutral-200 md:h-[96px] md:w-[96px]"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 md:border md:border-neutral-300 md:p-10">
                        <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
                        <div className="h-7 w-2/3 animate-pulse rounded bg-neutral-200" />
                        <div className="h-8 w-1/4 animate-pulse rounded bg-neutral-200" />
                    </div>
                </div>
            </section>
        );
    }

    // The API answers a missing product with 400 and an inactive one with 404 — both mean "not found".
    const notFound = error instanceof ApiError && (error.status === 400 || error.status === 404);

    if (notFound) {
        return (
            <section className="container flex flex-col items-center py-20 text-center">
                <h1 className="font-beatrice text-[24px] font-bold text-black md:text-[28px]">{t('productNotFound')}</h1>
                <p className="mt-2 font-beatrice text-[14px] text-gray-500">{t('productNotFoundHint')}</p>
                <Link
                    href="/products"
                    className="mt-6 bg-black px-6 py-3 font-beatrice text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                    {t('browseProducts')}
                </Link>
            </section>
        );
    }

    if (isError || !data) {
        return (
            <section className="container">
                <p className="font-cairo text-sm text-red-500">
                    {t('productLoadError')}
                </p>
            </section>
        );
    }

    const product = data.data;

    const variants = (product.variants ?? []) as ProductVariantLike[];
    // Top-level `colors` use `color_hexa`; variant colours use `hexa`.
    const productColors = ((product.colors ?? []) as ProductColorLike[])
        .map((c) => ({ ...c, hexa: c.hexa ?? c.color_hexa ?? '' }));
    const productImages = (product.images ?? []) as ProductImageLike[];

    // Selected size
    const selectedVariant = variants[selectedVariantIdx] ?? variants[0] ?? null;

    // Colors available for selected size
    const availableColors =
        selectedVariant?.colors && selectedVariant.colors.length > 0
            ? selectedVariant.colors
            : productColors;

    // Active selected color — prefer explicit selection, else first in-stock, else first
    const activeColor =
        availableColors.find((color) => color.id === selectedColorId) ??
        firstInStockColor(availableColors) ??
        availableColors[0] ??
        null;

    const activeColorId = activeColor?.id ?? null;

    const normalizeImages = (imgs: ProductColorImage[] | string[]): string[] =>
        imgs.map((img) => (typeof img === 'string' ? img : img.url));

    // Build gallery based on active color images first
    const gallery =
        activeColor?.images && activeColor.images.length > 0
            ? normalizeImages(activeColor.images)
            : productImages.length > 0
                ? productImages
                    .filter((img) => !activeColorId || img.color_id === activeColorId)
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((img) => img.image_path)
                : product.image_url
                    ? [product.image_url]
                    : [];

    // All images across every color/variant for the lightbox
    const galleryImages: string[] = Array.from(new Set([
        ...availableColors.flatMap((c) => normalizeImages((c.images ?? []) as ProductColorImage[])),
        ...productImages
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img) => img.image_path),
    ].filter(Boolean)));
    // `image_url` is a separate upload of one of the gallery pictures (different URL, same photo),
    // so only fall back to it when the product has no gallery.
    const allImages: string[] = galleryImages.length > 0
        ? galleryImages
        : product.image_url ? [product.image_url] : [];

    galleryLengthRef.current = allImages.length;

    // Sizes from variants
    const sizes = variants.map((variant) => variant.name);

    // Final price = base price + selected variant color price modifier
    const finalPrice =
        Number(product.price || 0) + Number(activeColor?.price_modifier || 0);

    const isUnavailable =
        !activeColor ||
        !isEnabled(product.is_active) ||
        !isEnabled(product.is_available) ||
        !isEnabled(activeColor.is_active) ||
        !isEnabled(activeColor.is_available) ||
        Number(activeColor.stock || 0) <= 0;

    // Size-less variants aren't returned in `variants`, so such products have no variant_id to buy.
    const notPurchasable = variants.length === 0;

    const variantStock = Math.max(0, Number(activeColor?.stock || 0));
    const productOutOfStock = !isEnabled(product.is_available);

    const isInCart = !!activeColor?.is_in_cart && !!activeColor?.cart_item_id;
    // Lock every cart control while a cart change runs — and until the refreshed quantity arrives,
    // so nobody acts on a stale number.
    const cartBusy = updateCartItem.isPending || removeFromCart.isPending || addToCart.isPending || (isInCart && isFetching);
    const cartItemId = activeColor?.cart_item_id ?? null;
    const cartItemQuantity = activeColor?.cart_item_quantity ?? 0;

    const handleSizeSelect = (idx: number) => {
        const [resolvedIdx, resolvedColorId] = resolveInitialSelection(variants, idx);
        setSelectedVariantIdx(resolvedIdx);
        setSelectedColorId(resolvedColorId);
        mainSwiperRef.current?.slideTo(0);
        thumbsSwiperRef.current?.slideTo(0);
    };

    const handleColorSelect = (colorId: number) => {
        setSelectedColorId(colorId);
        mainSwiperRef.current?.slideTo(0);
        thumbsSwiperRef.current?.slideTo(0);
    };

    const handleCartAction = () => {
        if (!activeColor?.variant_id || isUnavailable) return;

        if (!isLoggedIn) {
            openAuthModal(() => {
                addToCart.mutate({
                    variant_id: activeColor.variant_id!,
                    product_id: product.id,
                }, {
                    onSuccess: () => {
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 2000);
                    }
                });
            });
            return;
        }

        if (isInCart && cartItemId) {
            removeFromCart.mutate(cartItemId);
            return;
        }

        addToCart.mutate({
            variant_id: activeColor.variant_id,
            product_id: product.id,
        }, {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        });
    };

    const categoryLabel = [
        product.category_collection?.collection?.name,
        product.category_collection?.category?.name,
        product.sub_category?.name,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <>
            <section className="container">
                {/* Breadcrumbs */}
                <ProductBreadcrumbs crumbs={product.breadcrumbs ?? []} />

                <div className="grid grid-cols-1 gap-5 md:gap-10 md:flex">
                    {/* Gallery */}
                    <div className="flex h-[290px] min-w-0 flex-1 gap-[10px] md:h-[558px] md:flex-[0_1_647px] md:gap-5">
                        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-[#e8e8e8]">
                            {/* Gallery opener */}
                            <button
                                type="button"
                                onClick={() => { setLightboxIdx(0); setLightboxOpen(true); }}
                                className="absolute start-2 top-2 z-10 flex items-center gap-1.5 rounded-md bg-white/80 px-2 py-1.5 backdrop-blur-sm transition-colors hover:bg-white"
                                aria-label={t('viewAllImages')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                                <span className="font-beatrice text-[11px] font-medium text-black">{allImages.length}</span>
                            </button>

                            <Swiper
                                spaceBetween={10}
                                thumbs={{
                                    swiper:
                                        thumbsSwiperRef.current && !thumbsSwiperRef.current.destroyed
                                            ? thumbsSwiperRef.current
                                            : null,
                                }}
                                modules={[Navigation, Thumbs, Autoplay, FreeMode]}
                                // Free drag, then settle on the nearest whole image (never half a photo).
                                freeMode={{ enabled: true, sticky: true, momentumRatio: 0.6 }}
                                autoplay={{
                                    delay: 2500,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                }}
                                onSwiper={(s) => (mainSwiperRef.current = s)}
                                className="h-full w-full"
                            >
                                {/* Keyed by position: switching colour swaps the src instead of remounting slides. */}
                                {gallery.map((image, i) => (
                                    <SwiperSlide key={i}>
                                        <div
                                            className="relative flex h-full w-full cursor-zoom-in items-center justify-center overflow-hidden bg-[#e8e8e8]"
                                            onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}
                                        >
                                            {/* Blurred copy fills the frame with the photo's own colours, so any aspect ratio / background fits without cropping. */}
                                            <img
                                                src={image}
                                                alt=""
                                                aria-hidden
                                                className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
                                            />
                                            <img
                                                src={image}
                                                alt={`${product.name} image ${i + 1}`}
                                                className="relative h-full w-full object-contain"
                                                onError={e => { const img = (e.target ?? e.nativeEvent?.target) as HTMLImageElement | null; if (img) { img.src = '/images/logo.png'; img.classList.add('opacity-20'); } }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Thumbnails */}
                        <div className="h-full w-[50px] shrink-0 md:w-[96px]">
                            <Swiper
                                onSwiper={(s) => { thumbsSwiperRef.current = s; }}
                                direction="vertical"
                                spaceBetween={8}
                                breakpoints={{
                                    0: {
                                        direction: 'vertical',
                                        slidesPerView: 5,
                                        spaceBetween: 10,
                                    },
                                    640: {
                                        direction: 'vertical',
                                        slidesPerView: 5,
                                        spaceBetween: 8,
                                    },
                                    1024: {
                                        direction: 'vertical',
                                        slidesPerView: 5,
                                        spaceBetween: 8,
                                    },
                                }}
                                freeMode
                                watchSlidesProgress
                                modules={[FreeMode, Thumbs]}
                                className="h-full"
                            >
                                {gallery.map((thumb, i) => (
                                    <SwiperSlide key={i}>
                                        <div className="relative h-[50px] w-[50px] cursor-pointer overflow-hidden rounded-md border-2 md:rounded-lg border-transparent bg-[#e8e8e8] transition-colors hover:border-gray-300 md:h-[96px] md:w-[96px]">
                                            <img
                                                src={thumb}
                                                alt=""
                                                aria-hidden
                                                className="absolute inset-0 h-full w-full scale-125 object-cover blur-md"
                                            />
                                            <img
                                                src={thumb}
                                                alt={`${product.name} thumbnail ${i + 1}`}
                                                className="relative h-full w-full object-contain"
                                                onError={e => { const img = (e.target ?? e.nativeEvent?.target) as HTMLImageElement | null; if (img) { img.src = '/images/logo.png'; img.classList.add('opacity-20'); } }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0 md:border md:border-neutral-300 md:p-10">
                        <p className="mb-[10px] font-beatrice text-[12px] font-medium text-[#5a5a5a] md:mb-5 md:text-[16px]">
                            {categoryLabel}
                        </p>

                        <div className="mb-2 flex items-start justify-between gap-3">
                            <h1 className="font-beatrice text-[18px] font-medium leading-snug text-black md:text-[22px]">
                                {product.name}
                            </h1>
                            <ShareButton title={product.name} />
                        </div>

                        <div className="mb-5 flex flex-wrap items-center gap-3 md:mb-8">
                            <p className="font-beatrice text-[20px] font-extrabold text-black md:text-[22px]">
                                {tc('currency', { amount: finalPrice.toLocaleString(intlLocale(locale)) })}
                            </p>
                            {productOutOfStock && (
                                <span className="rounded-full bg-red-50 px-3 py-1 font-beatrice text-[12px] font-semibold text-red-600">
                                    {t('outOfStock')}
                                </span>
                            )}
                        </div>

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="mb-5 md:mb-8">
                                <p className="mb-2 font-beatrice text-[14px] font-semibold text-black md:mb-3">
                                    {tc('size')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size, idx) => {
                                        const soldOut = !sizeHasStock(variants[idx]);
                                        return (
                                        <button
                                            key={`${size}-${idx}`}
                                            onClick={() => handleSizeSelect(idx)}
                                            disabled={soldOut}
                                            title={soldOut ? t('outOfStock') : undefined}
                                            className={`h-10 px-2 border text-[13px] font-beatrice font-medium transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:line-through ${selectedVariantIdx === idx && !soldOut
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {availableColors.length > 0 && (
                            <div className="mb-5 md:mb-8">
                                <p className="mb-2 font-beatrice text-[14px] font-semibold text-black md:mb-3">
                                    {tc('color')}
                                </p>
                                <div className="flex flex-wrap gap-3.5 p-1">
                                    {availableColors.map((c, idx) => {
                                        const soldOut = !isEnabled(c.is_active) || !isEnabled(c.is_available) || Number(c.stock || 0) <= 0;
                                        return (
                                            <ColorSwatch
                                                key={c.id}
                                                color={c.hexa}
                                                selected={activeColorId === c.id}
                                                disabled={soldOut}
                                                showCheck
                                                onClick={() => handleColorSelect(c.id)}
                                                label={`${t('selectColor', { n: idx + 1 })}${soldOut ? ` — ${t('outOfStock')}` : ''}`}
                                                title={soldOut ? t('outOfStock') : undefined}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {isInCart && cartItemId && (
                            // Indented by the heart button (48px) + gap (12px) so it starts over the quantity box.
                            <p className="mb-2 ps-[60px] font-beatrice text-[13px] font-medium text-gray-600">
                                {t('alreadyInCart', { n: cartItemQuantity.toLocaleString(intlLocale(locale)) })}
                            </p>
                        )}
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        openAuthModal(() => {
                                            if (product.is_in_favourite) {
                                                removeFromWishlist.mutate(product.id);
                                            } else {
                                                addToWishlist.mutate(product.id);
                                            }
                                        });
                                        return;
                                    }
                                    if (product.is_in_favourite) {
                                        removeFromWishlist.mutate(product.id);
                                    } else {
                                        addToWishlist.mutate(product.id);
                                    }
                                }}
                                disabled={
                                    addToWishlist.isPending ||
                                    removeFromWishlist.isPending
                                }
                                className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-300 transition-colors hover:border-black disabled:opacity-50"
                                aria-label={
                                    product.is_in_favourite
                                        ? t('removeFromWishlist')
                                        : t('addToWishlist')
                                }
                            >
                                {addToWishlist.isPending || removeFromWishlist.isPending ? (
                                    <svg className="h-5 w-5 animate-spin text-black" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <HeartIcon
                                        width={22}
                                        height={22}
                                        className={product.is_in_favourite ? '[&_path]:fill-black' : ''}
                                    />
                                )}
                            </button>

                            {isInCart && cartItemId ? (
                                <div className="flex flex-1 items-center gap-3">
                                    <div className="flex flex-1 items-center border border-black">
                                        <button
                                            onClick={() => updateCartItem.mutate({ itemId: cartItemId, action: 'minus' })}
                                            disabled={cartItemQuantity <= 1 || cartBusy}
                                            className="flex h-[46px] w-12 shrink-0 items-center justify-center font-beatrice text-xl font-semibold transition-colors hover:bg-neutral-100 disabled:opacity-30"
                                        >
                                            −
                                        </button>
                                        <span className="flex-1 text-center font-beatrice text-base font-semibold">
                                            {cartBusy ? (
                                                <span aria-label={tc('loading')} className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                                            ) : (
                                                cartItemQuantity
                                            )}
                                        </span>
                                        <button
                                            onClick={() => updateCartItem.mutate({ itemId: cartItemId, action: 'plus' })}
                                            disabled={cartBusy || cartItemQuantity >= variantStock}
                                            className="flex h-[46px] w-12 shrink-0 items-center justify-center font-beatrice text-xl font-semibold transition-colors hover:bg-neutral-100 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {/* Same 48px square as the heart, at the end of the quantity row. */}
                                    <button
                                        onClick={() => removeFromCart.mutate(cartItemId)}
                                        disabled={cartBusy}
                                        aria-label={t('removeFromCart')}
                                        title={t('removeFromCart')}
                                        className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-300 text-red-600 transition-colors hover:border-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {removeFromCart.isPending ? (
                                            <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                        ) : (
                                            <Trash2 size={20} aria-hidden />
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleCartAction}
                                    disabled={addToCart.isPending || isUnavailable}
                                    className={`flex h-12 flex-1 items-center justify-between px-3 font-beatrice text-base font-semibold text-white transition-all disabled:opacity-50 md:px-5 md:text-[20px] ${showSuccess ? 'bg-green-600' : 'bg-black hover:bg-neutral-800'}`}
                                >
                                    <span>
                                        {addToCart.isPending
                                            ? t('adding')
                                            : notPurchasable
                                                ? t('notAvailableForPurchase')
                                            : isUnavailable
                                                ? t('outOfStock')
                                                : showSuccess
                                                    ? t('added')
                                                    : t('addToShoppingCart')}
                                    </span>
                                    <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
                                        <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-14">
                    <h2 className="mb-4 font-beatrice text-[18px] font-bold text-black">
                        {t('productDescription')}
                    </h2>
                    <ProductDescription html={product.description} />
                </div>
            </section>
            <SwiperSection
                primaryTitle={t('youMightAlsoLike')}
                secondaryTitle=""
                count={product.related_products?.length || 0}
                seeAllHref={`/products?${[
                    product.category_collection?.collection?.id && `collection_id=${product.category_collection.collection.id}`,
                    product.category_collection?.category?.id && `category_id=${product.category_collection.category.id}`
                    // product.sub_category?.id && `sub_category_id=${product.sub_category.id}`,
                ].filter(Boolean).join('&')}`}
                items={product.related_products || []}
            />

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="lightbox-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-black/80 px-4 py-6 backdrop-blur-md sm:gap-5"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Top bar: counter + close */}
                    <div className="flex w-full max-w-[640px] items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <span className="rounded-full bg-white/10 px-3 py-1 font-beatrice text-[12px] font-medium tabular-nums text-white/80">
                            {lightboxIdx + 1} / {allImages.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label={tc('close')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Image + arrows */}
                    <div className="relative flex w-full max-w-[640px] items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div
                            className="lightbox-card relative aspect-square w-full max-h-[62vh] max-w-[62vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
                            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                            onTouchEnd={(e) => {
                                if (touchStartX.current === null || allImages.length < 2) return;
                                const dx = e.changedTouches[0].clientX - touchStartX.current;
                                touchStartX.current = null;
                                if (Math.abs(dx) < 40) return;
                                // Swiping against the reading direction moves forward.
                                const forward = (dx < 0) !== (locale === 'ar');
                                setLightboxIdx((i) => (i + (forward ? 1 : -1) + allImages.length) % allImages.length);
                            }}
                        >
                            <img
                                src={allImages[lightboxIdx]}
                                alt=""
                                aria-hidden
                                className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
                            />
                            <img
                                key={lightboxIdx}
                                src={allImages[lightboxIdx]}
                                alt={`${product.name} ${lightboxIdx + 1}`}
                                className="lightbox-img relative h-full w-full object-contain"
                                onError={e => { const img = e.currentTarget; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                            />
                        </div>

                        {allImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setLightboxIdx((lightboxIdx - 1 + allImages.length) % allImages.length)}
                                    className="absolute start-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition hover:scale-105 hover:bg-white sm:-start-14"
                                    aria-label={t('previousImage')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxIdx((lightboxIdx + 1) % allImages.length)}
                                    className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition hover:scale-105 hover:bg-white sm:-end-14"
                                    aria-label={t('nextImage')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails strip */}
                    {allImages.length > 1 && (
                        <div
                            className="flex max-w-full gap-2 overflow-x-auto rounded-xl bg-white/5 p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {allImages.map((thumb, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setLightboxIdx(i)}
                                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg transition sm:h-14 sm:w-14 ${i === lightboxIdx ? 'ring-2 ring-white ring-offset-2 ring-offset-black/60' : 'opacity-50 hover:opacity-90'}`}
                                    aria-label={t('goToImage', { n: i + 1 })}
                                    aria-current={i === lightboxIdx}
                                >
                                    <img src={thumb} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover blur-md" />
                                    <img src={thumb} alt="" className="relative h-full w-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}

                    <style jsx>{`
                        .lightbox-overlay { animation: lightboxFade 0.2s ease-out; }
                        .lightbox-card { animation: lightboxZoom 0.25s ease-out; }
                        .lightbox-img { animation: lightboxFade 0.25s ease-out; }
                        @keyframes lightboxFade { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes lightboxZoom { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
                    `}</style>
                </div>
            )}
        </>

    );
}

/** Native share sheet where the browser has one (phones); otherwise copies the page link. */
function ShareButton({ title }: { title: string }) {
    const t = useTranslations('Products');

    async function share() {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch (err) {
                // Closing the share sheet is not an error; any other failure falls back to copying.
                if ((err as DOMException)?.name === 'AbortError') return;
            }
        }
        if (await copyText(url)) toast.success(t('linkCopied'));
        else toast.error(t('shareFailed'));
    }

    return (
        <button
            type="button"
            onClick={share}
            aria-label={t('share')}
            title={t('share')}
            className="-mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-black active:bg-gray-200"
        >
            <Share2 size={18} strokeWidth={2} aria-hidden />
        </button>
    );
}

/** Clipboard API needs a secure context (https/localhost); fall back to execCommand elsewhere. */
async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // fall through to the legacy copy
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        area.remove();
    }
}
