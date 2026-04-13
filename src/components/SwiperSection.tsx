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

interface SwiperSectionProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    count?: number;
    seeAllHref?: string;
    items: any[];
}

const SwiperSection = ({
    primaryTitle,
    secondaryTitle,
    count,
    seeAllHref,
    items,
}: SwiperSectionProps) => {
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const updateNavState = (swiper: any) => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    };

    return (
        <section className="py-8 sm:py-10 lg:py-12">
            <SectionHeader
                primaryTitle={primaryTitle}
                secondaryTitle={secondaryTitle}
                count={count}
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
                    loop={true}
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
                    {items.map((item, index) => (
                        <SwiperSlide key={index} className="h-auto">
                            <div className="h-full">
                                <ProductCard {...item} />
                            </div>
                        </SwiperSlide>
                    ))}
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