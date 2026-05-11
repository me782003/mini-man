'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import type { HomeBanner } from '@/lib/hooks/useHomePage';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HeroBannerSwiperProps {
    banners?: HomeBanner[];
}

export default function HeroBannerSwiper({ banners }: HeroBannerSwiperProps) {
    if (!banners || banners.length === 0) return null;

    return (
        <section className="w-full bg-[#e9e9e9] px-0 md:px-5 md:hidden">
            <div className="mx-auto w-full max-w-[1200px]">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    slidesPerView={1}
                    loop
                    effect="fade"
                    speed={900}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    className="hero-banner-swiper"
                >
                    {banners.map((banner, idx) => (
                        <SwiperSlide key={banner.id}>
                            <div className="relative w-full overflow-hidden bg-black">
                                <img
                                    src={banner.image_url}
                                    alt={`Banner ${banner.id}`}
                                    className="w-full object-cover"
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-black/15" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
        .hero-banner-swiper .swiper-pagination {
          bottom: 14px !important;
        }

        .hero-banner-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.55);
          opacity: 1;
        }

        .hero-banner-swiper .swiper-pagination-bullet-active {
          background: #ffffff;
        }
      `}</style>
        </section>
    );
}