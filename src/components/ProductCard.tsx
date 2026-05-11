"use client";

import Link from "next/link";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useAddToCart, useCart, useRemoveCartItem } from "@/lib/hooks/useCart";

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

const formatPrice = (value?: string | number) => {
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
            return `${numericValue.toLocaleString()} EGP`;
        }

        return trimmed;
    }

    return `${Number(value || 0).toLocaleString()} EGP`;
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

    // direction: 1 = forward, -1 = backward
    const [, setDirection] = useState(1);

    const [animKey, setAnimKey] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        // href || (slug ? `/products/${slug}` : `/products/${id ?? displayTitle}`);
        href || (slug ? `/products/${slug}` : `/products/${id ?? displayTitle}`);

    const displayPrice = formatPrice(price);
    const displayOldPrice = formatPrice(oldPrice);

    const goTo = (nextIdx: number, dir: number) => {
        setDirection(dir);
        setAnimKey((key) => key + 1);
        setImgIdx(nextIdx);
    };

    const prev = () => {
        goTo(
            (safeImgIdx - 1 + currentImages.length) % currentImages.length,
            -1
        );
    };

    const next = () => {
        goTo((safeImgIdx + 1) % currentImages.length, 1);
    };

    useEffect(() => {
        if (colorIdx >= normalizedColorVariants.length) {
            setColorIdx(0);
        }
    }, [colorIdx, normalizedColorVariants.length]);

    useEffect(() => {
        setImgIdx(0);
        setAnimKey((key) => key + 1);
    }, [colorIdx]);

    useEffect(() => {
        if (imgIdx >= currentImages.length) {
            setImgIdx(0);
        }
    }, [imgIdx, currentImages.length]);

    useEffect(() => {
        if (hovered && currentImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setDirection(1);
                setAnimKey((key) => key + 1);
                setImgIdx((index) => (index + 1) % currentImages.length);
            }, 1500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [hovered, colorIdx, currentImages.length]);

    const handleColorClick = (e: React.MouseEvent, idx: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!hasVariants) return;

        setColorIdx(idx);
    };

    const addToCart = useAddToCart();
    const { data: cartResponse } = useCart();
    const removeFromCart = useRemoveCartItem();

    const cartItems = cartResponse?.data?.items ?? [];
    const currentVariant = normalizedColorVariants[safeColorIdx];
    const cartItem = cartItems.find(item => item.variant.id === currentVariant?.variant_id);
    const isInCart = !!cartItem;

    const handleCartAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentVariant?.variant_id || !id) return;

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
                className="relative aspect-square  w-full overflow-hidden bg-[#e8e8e8]"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img
                    key={animKey}
                    src={currentImages[safeImgIdx] || mainImage}
                    alt={displayTitle}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ animation: "imgFadeIn 0.35s ease forwards" }}
                    onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                />

                {/* Navigation */}
                {currentImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                prev();
                            }}
                            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/90 shadow-md transition-all duration-200 ${hovered
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-2 pointer-events-none"
                                }`}
                            aria-label="Previous image"
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
                            onClick={(e) => {
                                e.preventDefault();
                                next();
                            }}
                            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/90 shadow-md transition-all duration-200 ${hovered
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 translate-x-2 pointer-events-none"
                                }`}
                            aria-label="Next image"
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

                        <div
                            className={`absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            {currentImages.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goTo(i, i > safeImgIdx ? 1 : -1);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${i === safeImgIdx
                                        ? "w-4 bg-neutral-900"
                                        : "w-1.5 bg-neutral-900/30"
                                        }`}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <style>{`
                    @keyframes imgFadeIn {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Info */}
            <div className="pt-4 sm:pt-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-2.5 sm:gap-2.5">
                    {dotColors.map((color, idx) => (
                        <button
                            key={`${color}-${idx}`}
                            type="button"
                            onClick={(e) => handleColorClick(e, idx)}
                            className={`h-4 w-4 rounded-full border transition-all duration-150 sm:h-5 sm:w-5 ${idx === safeColorIdx && hasVariants
                                ? "ring-2 ring-offset-1 ring-neutral-700 scale-110"
                                : "border-gray-200"
                                }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${idx + 1}`}
                        />
                    ))}
                </div>

                <p className="mb-2 text-xs font-beatrice font-medium text-[#5a5a5a] sm:mb-2.5 sm:text-[14px]">
                    {displayCategory}
                </p>

                <h3 className="mb-2 line-clamp-2 text-[16px] font-semibold leading-snug text-black font-beatrice sm:text-[18px] md:text-[20px]">
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