"use client";

import { Link } from "@/i18n/navigation";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAddToCart, useCart, useRemoveCartItem } from "@/lib/hooks/useCart";
import { useAuthState } from "@/lib/hooks/useAuthState";
import { useAuthModal } from "@/lib/context/AuthModalContext";
import { intlLocale } from '@/lib/intl';
import ColorSwatch from '@/components/ColorSwatch';
import type { Swiper as SwiperInstance } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

export interface ColorVariant {
    color: string;
    images: string[];
    variant_id?: number;
}

type ApiImage = {
    id?: number;
    image_path?: string;
    is_primary?: number | boolean;
    sort_order?: number;
    color_id?: number | null;
    color_hexa?: string;
};

type ApiColor = {
    id?: number;
    hexa?: string;
    color?: string;
    images?: string[];
};

type ApiVariantColor = {
    id?: number;
    hexa?: string;
    color?: string;
    variant_id?: number;
    sku?: string;
    price_modifier?: string | number;
    stock?: number;
    is_active?: number | boolean;
    is_available?: number | boolean;
    images?: string[];
};

type ApiVariant = {
    id?: number;
    name?: string;
    colors?: ApiVariantColor[];
};

interface ProductCardProps {
    id?: string | number;
    slug?: string;
    href?: string;

    image?: string;
    image_url?: string;
    imageUrl?: string;
    images?: ApiImage[];

    colorVariants?: ColorVariant[];
    colors?: Array<string | ApiColor>;
    variants?: ApiVariant[];

    category?: string;
    categoryLabel?: string;

    title?: string;
    name?: string;

    price?: string | number;
    oldPrice?: string | number;
}

const DEFAULT_IMAGE = "/images/sh-1.png";

const DEFAULT_COLORS = ["#9ea0a3", "black", "#312be2"];

const uniqueStrings = (items: string[]) => {
    return Array.from(new Set(items.filter(Boolean)));
};

const formatPrice = (value: string | number | undefined, formatAmount: (amount: number) => string) => {
    if (value === undefined || value === null || value === "") return "";

    if (typeof value === "string") {
        const trimmed = value.trim();

        const alreadyFormatted =
            trimmed.toLowerCase().includes("egp") ||
            trimmed.includes("$") ||
            trimmed.includes("ر.س") ||
            trimmed.includes("sar");

        if (alreadyFormatted) return trimmed;

        const numericValue = Number(trimmed);

        if (!Number.isNaN(numericValue)) {
            return formatAmount(numericValue);
        }

        return trimmed;
    }

    return formatAmount(Number(value || 0));
};

const getPrimaryImage = ({
    image,
    image_url,
    imageUrl,
    images,
}: {
    image?: string;
    image_url?: string;
    imageUrl?: string;
    images?: ApiImage[];
}) => {
    if (image) return image;
    if (imageUrl) return imageUrl;
    if (image_url) return image_url;

    const primaryImage = images?.find(
        (img) => img.is_primary === 1 || img.is_primary === true
    );

    if (primaryImage?.image_path) return primaryImage.image_path;

    const sortedImage = images
        ?.slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .find((img) => img.image_path);

    if (sortedImage?.image_path) return sortedImage.image_path;

    return DEFAULT_IMAGE;
};

const buildColorVariantsFromApiColors = (
    colors?: Array<string | ApiColor>
): ColorVariant[] => {
    if (!colors?.length) return [];

    return colors
        .map((color) => {
            if (typeof color === "string") {
                return {
                    color,
                    images: [],
                };
            }

            return {
                color: color.hexa || color.color || "",
                images: uniqueStrings(color.images ?? []),
                variant_id: color.id, // Assuming id is variant_id if it's an ApiColor
            };
        })
        .filter((item) => item.color);
};

const buildColorVariantsFromVariants = (
    variants?: ApiVariant[]
): ColorVariant[] => {
    if (!variants?.length) return [];

    const map = new Map<string, ColorVariant>();

    variants.forEach((variant) => {
        variant.colors?.forEach((color) => {
            const colorValue = color.hexa || color.color || "";

            if (!colorValue) return;

            const key = String(color.id ?? colorValue);

            if (!map.has(key)) {
                map.set(key, {
                    color: colorValue,
                    images: uniqueStrings(color.images ?? []),
                    variant_id: color.variant_id,
                });
            }
        });
    });

    return Array.from(map.values());
};

const buildColorVariantsFromImages = (images?: ApiImage[]): ColorVariant[] => {
    if (!images?.length) return [];

    const map = new Map<string, ColorVariant>();

    images
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .forEach((img) => {
            if (!img.image_path || !img.color_hexa) return;

            const key = String(img.color_id ?? img.color_hexa);

            const existing = map.get(key);

            if (existing) {
                existing.images.push(img.image_path);
            } else {
                map.set(key, {
                    color: img.color_hexa,
                    images: [img.image_path],
                    variant_id: img.id, // Fallback if no variant_id is present
                });
            }
        });

    return Array.from(map.values()).map((variant) => ({
        ...variant,
        images: uniqueStrings(variant.images),
    }));
};

/** Photo dot sizes by distance from the current photo (current, neighbour, …, far). */
const DOT_SCALES = [1.25, 0.9, 0.7, 0.55, 0.45];
const MAX_DOTS = 5;
const EDGE_DOT_SCALE = 0.45;

/**
 * At most MAX_DOTS dots, as a window that follows the current photo (kept near the middle).
 * `edge` marks a window end that has more photos hidden beyond it.
 */
function dotWindow(total: number, active: number): { start: number; dots: { index: number; edge: boolean; hidden: boolean }[] } {
    const start = total <= MAX_DOTS ? 0 : Math.min(Math.max(active - Math.floor(MAX_DOTS / 2), 0), total - MAX_DOTS);
    const end = Math.min(start + MAX_DOTS, total) - 1;
    return {
        start,
        dots: Array.from({ length: total }, (_, index) => ({
            index,
            hidden: index < start || index > end,
            edge: (index === start && start > 0) || (index === end && end < total - 1),
        })),
    };
}

// Dot geometry (h-2 w-2 = 8px, gap-1.5 = 6px) for sliding the strip by whole dots.
const DOT_SIZE = 8;
const DOT_GAP = 6;
const DOT_STEP = DOT_SIZE + DOT_GAP;

export default function ProductCard({
    id,
    slug,
    href,

    image,
    image_url,
    imageUrl,
    images,

    colorVariants,
    colors,
    variants,

    category,
    categoryLabel,

    title,
    name,

    price = "2,590 EGP",
    oldPrice,
}: ProductCardProps): JSX.Element {
    const t = useTranslations("Products");
    const tc = useTranslations("Common");
    const locale = useLocale();
    const formatAmount = (amount: number) => tc("currency", { amount: amount.toLocaleString(intlLocale(locale)) });
    const displayTitle = title || name || "Nike Air Max Plus";

    const displayCategory = category || categoryLabel || "Men's Shoes";

    const mainImage = getPrimaryImage({
        image,
        image_url,
        imageUrl,
        images,
    });

    const normalizedColorVariants = useMemo(() => {
        if (colorVariants?.length) {
            return colorVariants
                .map((variant) => ({
                    color: variant.color,
                    images: uniqueStrings(
                        variant.images?.length ? variant.images : [mainImage]
                    ),
                    variant_id: variant.variant_id,
                }))
                .filter((variant) => variant.color);
        }

        const fromColors = buildColorVariantsFromApiColors(colors);

        if (fromColors.some((variant) => variant.images.length > 0)) {
            return fromColors.map((variant) => ({
                ...variant,
                images: variant.images.length ? variant.images : [mainImage],
            }));
        }

        const fromVariants = buildColorVariantsFromVariants(variants);

        if (fromVariants.length) {
            return fromVariants.map((variant) => ({
                ...variant,
                images: variant.images.length ? variant.images : [mainImage],
            }));
        }

        const fromImages = buildColorVariantsFromImages(images);

        if (fromImages.length) {
            return fromImages.map((variant) => ({
                ...variant,
                images: variant.images.length ? variant.images : [mainImage],
            }));
        }

        if (fromColors.length) {
            return fromColors.map((variant) => ({
                ...variant,
                images: [mainImage],
            }));
        }

        return [];
    }, [colorVariants, colors, variants, images, mainImage]);

    const fallbackDotColors = useMemo(() => {
        const apiColors = buildColorVariantsFromApiColors(colors).map(
            (item) => item.color
        );

        return apiColors.length ? apiColors : DEFAULT_COLORS;
    }, [colors]);

    const hasVariants = normalizedColorVariants.length > 0;

    const [colorIdx, setColorIdx] = useState(0);
    const [imgIdx, setImgIdx] = useState(0);


    const [hovered, setHovered] = useState(false);
    // Pauses the hover slideshow while the pointer rests on a prev/next arrow.
    const [arrowHovered, setArrowHovered] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // The card's own photo carousel (free-mode Swiper).
    const photoSwiperRef = useRef<SwiperInstance | null>(null);

    const safeColorIdx =
        hasVariants && normalizedColorVariants[colorIdx] ? colorIdx : 0;

    const currentImages: string[] = hasVariants
        ? normalizedColorVariants[safeColorIdx]?.images?.length
            ? normalizedColorVariants[safeColorIdx].images
            : [mainImage]
        : [mainImage];

    const safeImgIdx = currentImages[imgIdx] ? imgIdx : 0;

    const dotColors = hasVariants
        ? normalizedColorVariants.map((variant) => variant.color)
        : fallbackDotColors;

    const productHref =
        href || (slug ? `/products/${slug}` : `/products/${id ?? displayTitle}`);
    // href || (slug ? `/products/${slug}` : `/products/${id ?? displayTitle}`);

    const displayPrice = formatPrice(price, formatAmount);
    const displayOldPrice = formatPrice(oldPrice, formatAmount);

    // Photo navigation drives the card's Swiper (no looping: it stops at the first and last photo).
    const goTo = (index: number) => photoSwiperRef.current?.slideTo(index);
    const prev = () => photoSwiperRef.current?.slidePrev();
    const next = () => photoSwiperRef.current?.slideNext();

    useEffect(() => {
        if (colorIdx >= normalizedColorVariants.length) {
            setColorIdx(0);
        }
    }, [colorIdx, normalizedColorVariants.length]);

    useEffect(() => {
        setImgIdx(0);
    }, [colorIdx]);

    useEffect(() => {
        if (imgIdx >= currentImages.length) {
            setImgIdx(0);
        }
    }, [imgIdx, currentImages.length]);

    const nextRef = useRef(next);
    useEffect(() => { nextRef.current = next; });

    useEffect(() => {
        if (hovered && !arrowHovered && currentImages.length > 1) {
            intervalRef.current = setInterval(() => {
                // No looping: stop the hover slideshow once the last photo is reached.
                if (photoSwiperRef.current?.isEnd) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return;
                }
                nextRef.current();
            }, 1500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [hovered, arrowHovered, colorIdx, currentImages.length]);

    const handleColorClick = (e: React.MouseEvent, idx: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!hasVariants) return;

        setColorIdx(idx);
    };

    const addToCart = useAddToCart();
    const { data: cartResponse } = useCart();
    const removeFromCart = useRemoveCartItem();
    const { isLoggedIn } = useAuthState();
    const { openAuthModal } = useAuthModal();

    const cartItems = cartResponse?.data?.items ?? [];
    const currentVariant = normalizedColorVariants[safeColorIdx];
    const cartItem = cartItems.find(item => item.variant?.id === currentVariant?.variant_id);
    const isInCart = !!cartItem;

    const handleCartAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentVariant?.variant_id || !id) return;

        if (!isLoggedIn) {
            openAuthModal(() => {
                addToCart.mutate({
                    variant_id: currentVariant.variant_id!,
                    product_id: Number(id),
                }, {
                    onSuccess: () => {
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 2000);
                    }
                });
            });
            return;
        }

        if (isInCart && cartItem) {
            removeFromCart.mutate(cartItem.cart_item_id);
            return;
        }

        addToCart.mutate({
            variant_id: currentVariant.variant_id,
            product_id: Number(id),
        }, {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        });
    };

    return (
        <Link
            href={productHref}
            className="group w-full max-w-full cursor-pointer sm:max-w-[445px]"
        >
            {/* Image area */}
            <div
                className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#e8e8e8]"
                onTouchStart={(e) => {
                    // Swiping photos inside a product carousel: stop the row's autoplay so it
                    // doesn't slide this card away mid-swipe. (The card's own Swiper is a child,
                    // so closest() from here finds the surrounding row.)
                    if (currentImages.length > 1) {
                        const row = e.currentTarget.closest('.swiper') as (HTMLElement & { swiper?: SwiperInstance }) | null;
                        row?.swiper?.autoplay?.stop();
                    }
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => { setHovered(false); setArrowHovered(false); }}
            >
                {/* Free-mode photo carousel: follows the finger, glides, then settles on a whole photo.
                    `nested` keeps a surrounding product row from moving while the photos are dragged. */}
                <Swiper
                    key={safeColorIdx}
                    modules={[FreeMode]}
                    nested
                    slidesPerView={1}
                    freeMode={{ enabled: true, sticky: true, momentumRatio: 0.5, momentumVelocityRatio: 0.6 }}
                    allowTouchMove={currentImages.length > 1}
                    onSwiper={(swiper) => { photoSwiperRef.current = swiper; }}
                    onSlideChange={(swiper) => setImgIdx(swiper.activeIndex)}
                    className="h-full w-full"
                >
                    {currentImages.map((src, i) => (
                        <SwiperSlide key={`${src}-${i}`} className="relative !h-full overflow-hidden">
                            {/* Blurred copy fills the frame with the photo's own colours, so any aspect ratio / background fits without cropping. */}
                            <img
                                src={src || mainImage}
                                alt=""
                                aria-hidden
                                className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
                            />
                            <img
                                src={src || mainImage}
                                alt={i === 0 ? displayTitle : `${displayTitle} ${i + 1}`}
                                draggable={false}
                                className="absolute inset-0 h-full w-full object-contain"
                                onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Navigation */}
                {currentImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onMouseEnter={() => setArrowHovered(true)}
                            onMouseLeave={() => setArrowHovered(false)}
                            onClick={(e) => {
                                e.preventDefault();
                                prev();
                            }}
                            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-all duration-200 ${hovered && safeImgIdx > 0
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2 pointer-events-none"
                                }`}
                            aria-label={t("previousImage")}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M10 3L5 8L10 13"
                                    stroke="#1a1a1a"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onMouseEnter={() => setArrowHovered(true)}
                            onMouseLeave={() => setArrowHovered(false)}
                            onClick={(e) => {
                                e.preventDefault();
                                next();
                            }}
                            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-all duration-200 ${hovered && safeImgIdx < currentImages.length - 1
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 translate-x-2 pointer-events-none"
                                }`}
                            aria-label={t("nextImage")}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M6 3L11 8L6 13"
                                    stroke="#1a1a1a"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Always visible; a thin white outline keeps the dots readable on dark photos.
                            A 5-dot window over a strip of all dots: the strip slides as you swipe. */}
                        {(() => {
                            const { start, dots } = dotWindow(currentImages.length, safeImgIdx);
                            const shown = Math.min(currentImages.length, MAX_DOTS);
                            const offset = start * DOT_STEP * (locale === 'ar' ? 1 : -1);
                            return (
                        <div
                            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 overflow-hidden px-1 py-1"
                            style={{ width: shown * DOT_SIZE + (shown - 1) * DOT_GAP + 8 }}
                        >
                        <div
                            className="flex w-max items-center gap-1.5 transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(${offset}px)` }}
                        >
                            {dots.map(({ index: i, edge, hidden }) => (
                                <button
                                    tabIndex={hidden ? -1 : undefined}
                                    aria-hidden={hidden || undefined}
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goTo(i);
                                    }}
                                    // Shrinks with distance from the current photo; an end dot with more photos
                                    // hidden beyond it is extra small ("there's more this way").
                                    style={{ transform: `scale(${hidden ? 0.3 : edge ? EDGE_DOT_SCALE : DOT_SCALES[Math.min(Math.abs(i - safeImgIdx), DOT_SCALES.length - 1)]})` }}
                                    className={`h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.7)] transition-all duration-300 ${i === safeImgIdx
                                        ? "bg-neutral-900"
                                        : "bg-neutral-900/30 hover:bg-neutral-900/60"
                                        }`}
                                    aria-label={t("goToImage", { n: i + 1 })}
                                    aria-current={i === safeImgIdx ? 'true' : undefined}
                                />
                            ))}
                        </div>
                        </div>
                            );
                        })()}
                    </>
                )}

            </div>

            {/* Info */}
            <div className="pt-4 sm:pt-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-2.5 sm:gap-2.5">
                    {dotColors.map((color, idx) => (
                        <ColorSwatch
                            key={`${color}-${idx}`}
                            size="sm"
                            color={color}
                            selected={idx === safeColorIdx && hasVariants}
                            onClick={(e) => handleColorClick(e, idx)}
                            label={t("selectColor", { n: idx + 1 })}
                        />
                    ))}
                </div>

                <p className="mb-2 text-xs font-beatrice font-medium text-[#5a5a5a] sm:mb-2.5 sm:text-[14px]">
                    {displayCategory}
                </p>

                <h3 className="mb-2  line-clamp-2 text-[16px] font-semibold leading-snug text-black font-beatrice sm:text-[18px] md:text-[20px]">
                    {displayTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span
                        className={`font-beatrice text-[12px] leading-none font-extrabold sm:text-[18px] md:text-[20px] ${displayOldPrice ? "text-[#FF0000]" : "text-black"
                            }`}
                    >
                        {displayPrice}
                    </span>

                    {displayOldPrice && (
                        <span className="font-beatrice text-[12px] leading-none font-normal text-[#4f4f4f] line-through sm:text-[16px] md:text-[20px]">
                            {displayOldPrice}
                        </span>
                    )}
                </div>
                {/* <div className="mt-4">
                    <button
                        onClick={handleCartAction}
                        disabled={addToCart.isPending || removeFromCart.isPending || !currentVariant?.variant_id}
                        className={`flex h-10 w-full items-center justify-between px-4 font-beatrice text-sm font-semibold text-white transition-all disabled:opacity-50 ${showSuccess ? 'bg-green-600/70' : isInCart ? 'bg-red-600/70 hover:bg-red-700/70' : 'bg-black/70 hover:bg-neutral-800/70'
                            }`}
                    >
                        <span>
                            {addToCart.isPending || removeFromCart.isPending
                                ? (addToCart.isPending ? "Adding..." : "Removing...")
                                : showSuccess
                                    ? "Added!"
                                    : isInCart
                                        ? "Remove From Cart"
                                        : "Add To Shopping Cart"}
                        </span>
                        <svg
                            width="20"
                            height="8"
                            viewBox="0 0 37 14"
                            fill="none"
                        >
                            <path
                                d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div> */}
            </div>
        </Link>
    );
}