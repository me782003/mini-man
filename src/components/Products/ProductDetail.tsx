'use client';

import React, { useState } from 'react';
import { HeartIcon } from '../icons';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Thumbs } from 'swiper/modules';

import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface Product {
    image: string;
    thumbnails: string[];
    title: string;
    category: string;
    price: string;
    colors: string[];
    sizes: number[];
    description: string;
}

export default function ProductDetail({ product }: { product: Product }) {
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? null);
    const [wishlisted, setWishlisted] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

    const gallery =
        product.thumbnails && product.thumbnails.length > 0
            ? product.thumbnails
            : [product.image];

    return (
        <section className="container ">
            <div className=" grid grid-cols-1 md:flex  gap-10  ">
                <div className="flex   gap-[10px] md:gap-5 flex-1 h-[290px] md:h-[558px] ">


                    {/* Main image */}
                    <div className="flex-1 overflow-hidden bg-[#e8e8e8] aspect-square">
                        <Swiper
                            spaceBetween={10}
                            // navigation
                            thumbs={{
                                swiper:
                                    thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                            }}
                            modules={[Navigation, Thumbs, Autoplay]}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            className="h-full w-full"
                        >
                            {gallery.map((image, i) => (
                                <SwiperSlide key={i}>
                                    <div className="flex h-full w-full items-center justify-center">
                                        <img
                                            src={image}
                                            alt={`${product.title} image ${i + 1}`}
                                            className="h-full w-full object-contain transition-all duration-300"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    {/* Thumbnails */}
                    <div className=" shrink-0 h-full">
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            direction="vertical"
                            spaceBetween={8}
                            // slidesPerView={5}
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
                                    <div className=" w-[50px] md:h-[96px]  h-[50px] md:w-[96px] cursor-pointer overflow-hidden border-2 border-transparent bg-[#e8e8e8] transition-colors hover:border-gray-300">
                                        <img
                                            src={thumb}
                                            alt={`${product.title} thumbnail ${i + 1}`}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* Product info */}
                {true && <div className="flex-1 min-w-0 md:border border-neutral-300  md:p-10">
                    <p className=" mb-[10px] md:mb-5 font-beatrice text-[12px] md:text-[16px] font-medium text-[#5a5a5a]">
                        {product.category}
                    </p>

                    <h1 className="mb-1 font-beatrice text-2xl md:text-[28px] font-medium leading-tight text-black">
                        {product.title}
                    </h1>

                    <p className="mb-8 font-beatrice text-[24px] md:text-[26px] font-extrabold text-black">
                        {product.price}
                    </p>

                    {/* Size */}
                    <div className="mb-10">
                        <p className="mb-3 font-beatrice text-[14px] font-semibold  text-black">
                            Size
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-10 w-10 border text-[13px] font-beatrice font-medium transition-colors ${selectedSize === size
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div className="mb-10">
                        <p className="mb-3 font-beatrice text-[14px] font-semibold  text-black">
                            Color
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`  w-[32px] h-[32px] md:h-[50px] md:w-[50px] rounded-full border-2 transition-all ${selectedColor === color
                                        ? 'scale-110 border-black'
                                        : 'border-transparent hover:border-gray-400'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setWishlisted(!wishlisted)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-300 transition-colors hover:border-black"
                            aria-label="Add to wishlist"
                        >
                            <HeartIcon
                                width={22}
                                height={22}
                                className={wishlisted ? '[&_path]:fill-black' : ''}
                            />
                        </button>

                        <button className="flex h-12 flex-1 items-center justify-between bg-black px-3 md:px-5 font-beatrice  text-base md:text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
                            <span>Add To Shopping Cart</span>
                            <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                                <path
                                    d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>}
            </div>

            {/* Description */}
            <div className="mt-14">
                <h2 className="mb-4 font-beatrice text-[18px] font-bold text-black">
                    Product Description
                </h2>
                <p className="max-w-[700px] font-beatrice text-[14px] leading-relaxed text-[#5a5a5a]">
                    {product.description}
                </p>
            </div>
        </section >
    );
}