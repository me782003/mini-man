'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { HeartIcon } from '../icons';
import { useProductDetail } from '@/lib/hooks/useProducts';
import { useAddToWishlist, useRemoveFromWishlist } from '@/lib/hooks/useWishlist';
import { useRemoveCartItem, useAddToCart, useUpdateCartItem } from '@/lib/hooks/useCart';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import SwiperSection from '../SwiperSection';

type ProductColorImage = { id: number; url: string };

type ProductColorLike = {
    id: number;
    hexa: string;
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
    const { data, isPending, isError } = useProductDetail(id);

    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const thumbsSwiperRef = React.useRef<SwiperType | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const v = (data?.data?.variants ?? []) as ProductVariantLike[];
        if (v.length === 0) return;
        const [resolvedIdx, resolvedColorId] = resolveInitialSelection(v, 0);
        setSelectedVariantIdx(resolvedIdx);
        setSelectedColorId(resolvedColorId);
    }, [data]);

    const addToWishlist = useAddToWishlist();
    const removeFromWishlist = useRemoveFromWishlist();
    const addToCart = useAddToCart();
    const removeFromCart = useRemoveCartItem();
    const updateCartItem = useUpdateCartItem();
    const mainSwiperRef = React.useRef<SwiperType | null>(null);

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

    if (isError || !data) {
        return (
            <section className="container">
                <p className="font-cairo text-sm text-red-500">
                    Failed to load product. Please try again.
                </p>
            </section>
        );
    }

    const product = data.data;

    const variants = (product.variants ?? []) as ProductVariantLike[];
    const productColors = (product.colors ?? []) as ProductColorLike[];
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

    const isInCart = !!activeColor?.is_in_cart && !!activeColor?.cart_item_id;
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
                {product.breadcrumbs?.length > 0 && (
                    <nav className="mb-6 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                        {product.breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span>/</span>}
                                {crumb.url ? (
                                    <Link
                                        href={crumb.url}
                                        className="transition-colors hover:text-black"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-black">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                <div className="grid grid-cols-1 gap-10 md:flex">
                    {/* Gallery */}
                    <div className="flex md:w-[647px] h-[290px] flex-1 gap-[10px] md:h-[558px] md:gap-5">
                        <div className="flex-1 overflow-hidden bg-[#e8e8e8]">
                            <Swiper
                                spaceBetween={10}
                                thumbs={{
                                    swiper:
                                        thumbsSwiperRef.current && !thumbsSwiperRef.current.destroyed
                                            ? thumbsSwiperRef.current
                                            : null,
                                }}
                                modules={[Navigation, Thumbs, Autoplay]}
                                autoplay={{
                                    delay: 2500,
                                    disableOnInteraction: false,
                                }}
                                onSwiper={(s) => (mainSwiperRef.current = s)}
                                className="h-full w-full"
                            >
                                {gallery.map((image, i) => (
                                    <SwiperSlide key={`${image}-${i}`}>
                                        <div className="flex h-full w-full items-center justify-center">
                                            <img
                                                src={image}
                                                alt={`${product.name} image ${i + 1}`}
                                                className="h-full w-full object-contain transition-all duration-300"
                                                onError={e => { const img = (e.target ?? e.nativeEvent?.target) as HTMLImageElement | null; if (img) { img.src = '/images/logo.png'; img.classList.add('opacity-20'); } }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Thumbnails */}
                        <div className="h-full shrink-0">
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
                                    <SwiperSlide key={`${thumb}-${i}`}>
                                        <div className="h-[50px] w-[50px] cursor-pointer overflow-hidden border-2 border-transparent bg-[#e8e8e8] transition-colors hover:border-gray-300 md:h-[96px] md:w-[96px]">
                                            <img
                                                src={thumb}
                                                alt={`${product.name} thumbnail ${i + 1}`}
                                                className="h-full w-full object-contain"
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

                        <h1 className="mb-1 font-beatrice text-2xl font-medium leading-tight text-black md:text-[28px]">
                            {product.name}
                        </h1>

                        <p className="mb-8 font-beatrice text-[24px] font-extrabold text-black md:text-[26px]">
                            {finalPrice.toLocaleString()} EGP
                        </p>

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="mb-10">
                                <p className="mb-3 font-beatrice text-[14px] font-semibold text-black">
                                    Size
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size, idx) => (
                                        <button
                                            key={`${size}-${idx}`}
                                            onClick={() => handleSizeSelect(idx)}
                                            className={`h-10 px-2 border text-[13px] font-beatrice font-medium transition-colors ${selectedVariantIdx === idx
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {availableColors.length > 0 && (
                            <div className="mb-10">
                                <p className="mb-3 font-beatrice text-[14px] font-semibold text-black">
                                    Color
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {availableColors.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleColorSelect(c.id)}
                                            disabled={!isEnabled(c.is_active) || !isEnabled(c.is_available) || Number(c.stock || 0) <= 0}
                                            className={`h-[32px] w-[32px] rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-40 md:h-[50px] md:w-[50px] ${activeColorId === c.id
                                                ? 'scale-110 border-black'
                                                : 'border-transparent hover:border-gray-400'
                                                }`}
                                            style={{ backgroundColor: c.hexa }}
                                            aria-label={c.hexa}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
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
                                        ? 'Remove from wishlist'
                                        : 'Add to wishlist'
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
                                <div className="flex flex-1 flex-col gap-2">
                                    <div className="flex items-center border border-black">
                                        <button
                                            onClick={() => updateCartItem.mutate({ itemId: cartItemId, action: 'minus' })}
                                            disabled={cartItemQuantity <= 1 || updateCartItem.isPending}
                                            className="flex h-12 w-12 shrink-0 items-center justify-center font-beatrice text-xl font-semibold transition-colors hover:bg-neutral-100 disabled:opacity-30"
                                        >
                                            −
                                        </button>
                                        <span className="flex-1 text-center font-beatrice text-base font-semibold">
                                            {cartItemQuantity}
                                        </span>
                                        <button
                                            onClick={() => updateCartItem.mutate({ itemId: cartItemId, action: 'plus' })}
                                            disabled={updateCartItem.isPending}
                                            className="flex h-12 w-12 shrink-0 items-center justify-center font-beatrice text-xl font-semibold transition-colors hover:bg-neutral-100 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart.mutate(cartItemId)}
                                        disabled={removeFromCart.isPending}
                                        className="flex h-10 w-full items-center justify-between bg-red-600 px-3 font-beatrice text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 md:px-5"
                                    >
                                        <span>{removeFromCart.isPending ? 'Removing...' : 'Remove From Cart'}</span>
                                        <svg width="24" height="10" viewBox="0 0 37 14" fill="none">
                                            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
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
                                            ? 'Adding...'
                                            : isUnavailable
                                                ? 'Out of Stock'
                                                : showSuccess
                                                    ? 'Added!'
                                                    : 'Add To Shopping Cart'}
                                    </span>
                                    <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
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
                        Product Description
                    </h2>
                    <div
                        className="max-w-[700px] font-beatrice text-[14px] leading-relaxed text-[#5a5a5a] [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:underline [&_a]:text-black [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1 [&_p]:mb-2 [&_br]:block"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>
            </section>
            <SwiperSection
                primaryTitle="YOU MIGHT ALSO LIKE"
                secondaryTitle=""
                count={product.related_products?.length || 0}
                seeAllHref="/products"
                items={product.related_products || []}
            />
        </>

    );
}