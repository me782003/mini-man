"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";

// Import Swiper styles
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
        <section className="py-12">
            <SectionHeader
                primaryTitle={primaryTitle}
                secondaryTitle={secondaryTitle}
                count={count}
                seeAllHref={seeAllHref}
            />

            <div className="container mx-auto px-4 mt-10">
                <Swiper
                    modules={[Navigation, FreeMode]}
                    spaceBetween={20}
                    slidesPerView={1.2}
                    freeMode={true}
                    navigation={{
                        prevEl: ".swiper-button-prev-custom",
                        nextEl: ".swiper-button-next-custom",
                    }}
                    onSwiper={updateNavState}
                    onSlideChange={updateNavState}
                    onReachBeginning={(swiper) => updateNavState(swiper)}
                    onReachEnd={(swiper) => updateNavState(swiper)}
                    breakpoints={{
                        640: {
                            slidesPerView: 2.2,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 3.2,
                            spaceBetween: 30,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                    }}
                    className="product-swiper"
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={index}>
                            <ProductCard {...item} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        className={`swiper-button-prev-custom flex h-12 w-12 items-center justify-center border transition ${isBeginning
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                            }`}
                        aria-label="Previous slide"
                        disabled={isBeginning}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        className={`swiper-button-next-custom flex h-12 w-12 items-center justify-center border transition ${isEnd
                                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                : "border-gray-300 bg-white text-black hover:bg-black hover:text-white"
                            }`}
                        aria-label="Next slide"
                        disabled={isEnd}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SwiperSection;