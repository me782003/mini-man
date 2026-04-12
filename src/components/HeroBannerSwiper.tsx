'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
    {
        id: 1,
        title: 'MINI MAN',
        subtitle: 'PREMIUM STREETWEAR',
        description: '[ curated sneakers | shop the collection ]',
        buttonText: 'SHOP NOW',
        buttonHref: '/shop',
        image: '/images/hero-1.png',
    },
    {
        id: 2,
        title: 'NEW DROP',
        subtitle: 'MODERN ESSENTIALS',
        description: '[ limited pieces | discover the edit ]',
        buttonText: 'EXPLORE',
        buttonHref: '/shop',
        image: '/images/hero-2.png',
    },
    {
        id: 3,
        title: 'URBAN KIDS',
        subtitle: 'FRESH DAILY STYLE',
        description: '[ comfort + attitude | see more ]',
        buttonText: 'VIEW COLLECTION',
        buttonHref: '/shop',
        image: '/images/hero-3.png',
    },
];

export default function HeroBannerSwiper() {
    return (
        <section className="w-full bg-[#e9e9e9] px-0 md:px-5 md:hidden">
            <div className="mx-auto w-full max-w-[1200px]">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    slidesPerView={1}
                    loop
                    effect="fade"
                    speed={900}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    className="hero-banner-swiper"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="relative  w-full overflow-hidden bg-black   ">
                                <Image
                                    width={1920}
                                    height={1080}
                                    src={slide.image}
                                    alt={slide.title}
                                    // fill
                                    priority={slide.id === 1}
                                    className=""
                                />

                                <div className="absolute inset-0 bg-black/15" />

                                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

                                {/* <div className="absolute left-4 top-1/2 z-10 w-[55%] -translate-y-1/2 text-white sm:left-8 md:left-12 lg:left-14">
                                    <h2 className="mb-2 text-[34px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-[54px] md:text-[78px] lg:text-[96px]">
                                        {slide.title.split(' ').map((word, index) => (
                                            <span key={index} className="block">
                                                {word}
                                            </span>
                                        ))}
                                    </h2>

                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/95 sm:text-xs md:text-sm">
                                        {slide.subtitle}
                                    </p>

                                    <p className="mb-4 max-w-[320px] text-[9px] font-medium text-white/85 sm:text-[11px] md:mb-6 md:text-xs">
                                        {slide.description}
                                    </p>

                                    <Link
                                        href={slide.buttonHref}
                                        className="inline-flex items-center border border-[#9d3f24] bg-[#9d3f24] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#84331c] sm:px-4 sm:text-xs"
                                    >
                                        {slide.buttonText}
                                    </Link>
                                </div> */}
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