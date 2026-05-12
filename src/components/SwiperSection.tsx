"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "../i18n/navigation";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

type ProductImage = {
    id?: number;
    image_path: string;
    is_primary?: number | boolean;
    sort_order?: number;
    color_id?: number | null;
    color_hexa?: string;
};

type ProductColor = {
    id: number;
    hexa: string;
    images?: string[];
};

type VariantColor = {
    id: number;
    hexa: string;
    variant_id: number;
    sku: string;
    price_modifier: string | number;
    stock: number;
    is_active: number | boolean;
    is_available: number | boolean;
    images?: string[];
};

type ProductVariant = {
    id: number;
    name: string;
    colors?: VariantColor[];
};

type ProductItem = {
    id: number;
    slug: string;
    name: string;
    price: string | number;
    stock?: number;
    is_active?: number | boolean;
    is_available?: number | boolean;
    image_url?: string;
    description?: string;
    short_description?: string;
    is_in_favourite?: boolean;
    favourite_id?: number | null;
    is_in_cart?: boolean;
    cart_item_id?: number | null;
    cart_item_quantity?: number;
    images?: ProductImage[];
    colors?: ProductColor[];
    variants?: ProductVariant[];
    category_collection?: {
        collection?: {
            id: number;
            name: string;
        };
        category?: {
            id: number;
            name: string;
        };
    };
    sub_category?: {
        id: number;
        name: string;
    };
};

interface SwiperSectionProps {
    primaryTitle?: string | React.ReactNode;
    secondaryTitle?: string;
    count?: number;
    seeAllHref?: string;
    items: ProductItem[];
}

const getPrimaryImage = (item: ProductItem) => {
    const primaryImage = item.images?.find((image) => image.is_primary === 1 || image.is_primary === true);

    if (primaryImage?.image_path) {
        return primaryImage.image_path;
    }

    const sortedImage = item.images
        ?.slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        ?.find((image) => image.image_path);

    if (sortedImage?.image_path) {
        return sortedImage.image_path;
    }

    const firstColorImage = item.colors?.find((color) => color.images?.length)?.images?.[0];

    if (firstColorImage) {
        return firstColorImage;
    }

    const firstVariantColorImage = item.variants
        ?.flatMap((variant) => variant.colors ?? [])
        ?.find((color) => color.images?.length)?.images?.[0];

    if (firstVariantColorImage) {
        return firstVariantColorImage;
    }

    return item.image_url || "";
};

const getFirstAvailableVariantColor = (item: ProductItem) => {
    return (
        item.variants
            ?.flatMap((variant) => variant.colors ?? [])
            ?.find(
                (color) =>
                    color.is_active === 1 &&
                    color.is_available === 1 &&
                    Number(color.stock || 0) > 0
            ) ??
        item.variants?.flatMap((variant) => variant.colors ?? [])?.[0] ??
        null
    );
};

const normalizeProductForCard = (item: ProductItem) => {
    const firstVariantColor = getFirstAvailableVariantColor(item);

    const finalPrice =
        Number(item.price || 0) + Number(firstVariantColor?.price_modifier || 0);

    const categoryLabel = [
        item.category_collection?.collection?.name,
        item.category_collection?.category?.name,
        // item.sub_category?.name,
    ]
        .filter(Boolean)
        .join(" - ");

    const image = getPrimaryImage(item);

    return {
        ...item,

        // Common names for ProductCard
        title: item.name,
        name: item.name,
        slug: item.slug,
        href: `/products/${item.slug}`,

        // Image fallbacks
        image,
        imageUrl: image,
        image_url: image,

        // Price
        price: finalPrice,
        base_price: item.price,
        price_modifier: firstVariantColor?.price_modifier ?? 0,

        // Category
        category: categoryLabel,
        categoryLabel,

        // Description
        description: item.description,
        shortDescription: item.short_description,
        short_description: item.short_description,

        // Favourite / cart
        is_in_favourite: item.is_in_favourite,
        isInFavourite: item.is_in_favourite,
        favourite_id: item.favourite_id,

        is_in_cart: item.is_in_cart,
        isInCart: item.is_in_cart,
        cart_item_id: item.cart_item_id,
        cart_item_quantity: item.cart_item_quantity,

        // Variant info
        variant_id: firstVariantColor?.variant_id ?? null,
        selected_variant_id: firstVariantColor?.variant_id ?? null,
        sku: firstVariantColor?.sku ?? null,

        // Availability
        stock: firstVariantColor?.stock ?? item.stock ?? 0,
        is_available:
            item.is_available === 1 &&
            (!firstVariantColor || firstVariantColor.is_available === 1),
        is_active:
            item.is_active === 1 &&
            (!firstVariantColor || firstVariantColor.is_active === 1),
    };
};

const SwiperSection = ({
    primaryTitle,
    secondaryTitle,
    count,
    seeAllHref,
    items,
}: SwiperSectionProps) => {
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const safeItems = Array.isArray(items) ? items : [];

    const updateNavState = (swiper: any) => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    };

    return (
        <section className="py-8 sm:py-10 lg:py-12">
            <SectionHeader
                primaryTitle={primaryTitle}
                secondaryTitle={secondaryTitle}
                count={count ?? safeItems.length}
                seeAllHref={seeAllHref}
            />

            <div className="container mt-6 px-4 sm:mt-8 lg:mt-10">
                <Swiper
                    modules={[Navigation, FreeMode, Autoplay]}
                    freeMode={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    loop={safeItems.length > 4}
                    navigation={{
                        prevEl: ".swiper-button-prev-custom",
                        nextEl: ".swiper-button-next-custom",
                    }}
                    onSwiper={updateNavState}
                    onSlideChange={updateNavState}
                    onReachBeginning={updateNavState}
                    onReachEnd={updateNavState}
                    breakpoints={{
                        0: {
                            slidesPerView: 2,
                            spaceBetween: 12,
                        },
                        480: {
                            slidesPerView: 2.2,
                            spaceBetween: 14,
                        },
                        640: {
                            slidesPerView: 2.5,
                            spaceBetween: 16,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 18,
                        },
                        1024: {
                            slidesPerView: 3.2,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                    }}
                    className="product-swiper"
                >
                    {safeItems.map((item, index) => {
                        const cardItem = normalizeProductForCard(item);

                        return (
                            <SwiperSlide key={item.id ?? index} className="h-auto">
                                <div className="h-full">
                                    <ProductCard {...cardItem} />
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Mobile bottom controls */}
                <div className="mt-6 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            className={`swiper-button-prev-custom flex h-10 w-10 items-center justify-center border transition ${isBeginning
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            aria-label="Previous slide"
                            disabled={isBeginning}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <button
                            className={`swiper-button-next-custom flex h-10 w-10 items-center justify-center border transition ${isEnd
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            aria-label="Next slide"
                            disabled={isEnd}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {seeAllHref ? (
                        <Link
                            href={seeAllHref}
                            className="mb-1 flex items-center gap-2 text-[14px] font-medium text-[#6b6b6b] transition hover:text-[#4f4f4f] md:flex"
                        >
                            <span className="font-beatrice">See All</span>
                            <span className="text-[28px] leading-none sm:text-[34px] lg:text-[52px]">
                                <svg
                                    width="27"
                                    height="14"
                                    viewBox="0 0 37 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                        stroke="#5E5E5E"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    ) : null}
                </div>

                {/* Tablet/Desktop bottom navigation only */}
                <div className="mt-6 hidden items-center justify-center gap-3 sm:mt-8 md:flex md:gap-4">
                    <button
                        className={`swiper-button-prev-custom flex h-10 w-10 items-center justify-center border transition sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${isBeginning
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                            }`}
                        aria-label="Previous slide"
                        disabled={isBeginning}
                    >
                        <ChevronLeft size={18} className="sm:h-5 sm:w-5" />
                    </button>

                    <button
                        className={`swiper-button-next-custom flex h-10 w-10 items-center justify-center border transition sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${isEnd
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                            }`}
                        aria-label="Next slide"
                        disabled={isEnd}
                    >
                        <ChevronRight size={18} className="sm:h-5 sm:w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SwiperSection;