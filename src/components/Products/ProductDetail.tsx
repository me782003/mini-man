'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { HeartIcon } from '../icons';
import { useProductDetail } from '@/lib/hooks/useProducts';
import { useAddToWishlist, useRemoveFromWishlist } from '@/lib/hooks/useWishlist';
import { useAddToCart } from '@/lib/hooks/useCart';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export default function ProductDetail({ id }: { id: string }) {
    const { data, isPending, isError } = useProductDetail(id);

    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

    const addToWishlist = useAddToWishlist();
    const removeFromWishlist = useRemoveFromWishlist();
    const addToCart = useAddToCart();
    const mainSwiperRef = React.useRef<SwiperType | null>(null);

    if (isPending) {
        return (
            <section className="container">
                <div className="grid grid-cols-1 gap-10 md:flex">
                    <div className="flex h-[290px] flex-1 gap-[10px] md:h-[558px] md:gap-5">
                        <div className="flex-1 animate-pulse bg-neutral-200" />
                        <div className="flex shrink-0 flex-col gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-[50px] w-[50px] animate-pulse bg-neutral-200 md:h-[96px] md:w-[96px]" />
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
                <p className="font-cairo text-sm text-red-500">Failed to load product. Please try again.</p>
            </section>
        );
    }

    const product = data.data;

    // Build gallery: images array, fallback to image_url
    const gallery = product.images.length > 0
        ? product.images.sort((a, b) => a.sort_order - b.sort_order).map((img) => img.image_path)
        : [product.image_url];

    // Unique sizes from variants
    const sizes = product.variants.map((v) => v.name);

    // Selected variant (size)
    const selectedVariant = product.variants[selectedVariantIdx] ?? null;

    // Available colors for selected size (or all colors if no variant selected)
    const availableColors = selectedVariant?.colors ?? product.colors;

    const activeColorId = selectedColorId ?? availableColors[0]?.id ?? null;

    const handleColorSelect = (colorId: number) => {
        setSelectedColorId(colorId);
        mainSwiperRef.current?.slideTo(0);
        setThumbsSwiper(null);
    };

    const categoryLabel = [
        product.category_collection.category.name,
        product.sub_category.name,
    ].join(' · ');

    return (
        <section className="container">
            {/* Breadcrumbs */}
            {product.breadcrumbs.length > 0 && (
                <nav className="mb-6 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                    {product.breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span>/</span>}
                            {crumb.url ? (
                                <Link href={crumb.url} className="transition-colors hover:text-black">{crumb.label}</Link>
                            ) : (
                                <span className="font-semibold text-black">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="grid grid-cols-1 gap-10 md:flex">
                {/* Gallery */}
                <div className="flex md:w-[647px]  h-[290px] flex-1 gap-[10px] md:h-[558px] md:gap-5">
                    <div className="flex-1 overflow-hidden bg-[#e8e8e8]">
                        <Swiper
                            spaceBetween={10}
                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                            modules={[Navigation, Thumbs, Autoplay]}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            onSwiper={(s) => (mainSwiperRef.current = s)}
                            className="h-full w-full"
                        >
                            {gallery.map((image, i) => (
                                <SwiperSlide key={i}>
                                    <div className="flex h-full w-full items-center justify-center">
                                        <img
                                            src={image}
                                            alt={`${product.name} image ${i + 1}`}
                                            className="h-full w-full object-contain transition-all duration-300"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Thumbnails */}
                    <div className="h-full shrink-0">
                        <Swiper
                            key={selectedVariantIdx}
                            onSwiper={setThumbsSwiper}
                            direction="vertical"
                            spaceBetween={8}
                            breakpoints={{
                                0: { direction: 'vertical', slidesPerView: 5, spaceBetween: 10 },
                                640: { direction: 'vertical', slidesPerView: 5, spaceBetween: 8 },
                                1024: { direction: 'vertical', slidesPerView: 5, spaceBetween: 8 },
                            }}
                            freeMode
                            watchSlidesProgress
                            modules={[FreeMode, Thumbs]}
                            className="h-full"
                        >
                            {gallery.map((thumb, i) => (
                                <SwiperSlide key={i}>
                                    <div className="h-[50px] w-[50px] cursor-pointer overflow-hidden border-2 border-transparent bg-[#e8e8e8] transition-colors hover:border-gray-300 md:h-[96px] md:w-[96px]">
                                        <img
                                            src={thumb}
                                            alt={`${product.name} thumbnail ${i + 1}`}
                                            className="h-full w-full object-contain"
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
                        {Number(product.price).toLocaleString()} EGP
                    </p>

                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div className="mb-10">
                            <p className="mb-3 font-beatrice text-[14px] font-semibold text-black">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size, idx) => (
                                    <button
                                        key={size}
                                        onClick={() => { setSelectedVariantIdx(idx); setSelectedColorId(null); }}
                                        className={`h-10 w-10 border text-[13px] font-beatrice font-medium transition-colors ${selectedVariantIdx === idx ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black hover:border-black'}`}
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
                            <p className="mb-3 font-beatrice text-[14px] font-semibold text-black">Color</p>
                            <div className="flex flex-wrap gap-2.5">
                                {availableColors.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleColorSelect(c.id)}
                                        className={`h-[32px] w-[32px] rounded-full border-2 transition-all md:h-[50px] md:w-[50px] ${activeColorId === c.id ? 'scale-110 border-black' : 'border-transparent hover:border-gray-400'}`}
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
                            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                            className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-300 transition-colors hover:border-black disabled:opacity-50"
                            aria-label={product.is_in_favourite ? 'Remove from wishlist' : 'Add to wishlist'}
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

                        <button
                            onClick={() => {
                                const activeColor = availableColors.find((c) => c.id === activeColorId);
                                const variantId = (activeColor as { variant_id?: number })?.variant_id;
                                if (variantId) {
                                    addToCart.mutate({ variant_id: variantId, product_id: product.id });
                                }
                            }}
                            disabled={addToCart.isPending}
                            className="flex h-12 flex-1 items-center justify-between bg-black px-3 font-beatrice text-base font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 md:px-5 md:text-[20px]">
                            <span>{addToCart.isPending ? 'Adding...' : 'Add To Shopping Cart'}</span>
                            <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mt-14">
                <h2 className="mb-4 font-beatrice text-[18px] font-bold text-black">Product Description</h2>
                <p className="max-w-[700px] font-beatrice text-[14px] leading-relaxed text-[#5a5a5a]">
                    {product.description}
                </p>
            </div>
        </section>
    );
}
