"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ArrowRightIcon } from "@/components/icons";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const SLIDES = [
  {
    id: 1,
    image: "/images/hero-1.png",
    tag: "New Arrival",
    title: ["Step Into", "The Future"],
    subtitle: "Spring / Summer 2025",
    cta: "Shop Now",
    accent: "#E8D5B7",
    href: "/products",
  },
  {
    id: 2,
    image: "/images/hero-2.png",
    tag: "Exclusive Drop",
    title: ["Bold Moves,", "Bold Soles"],
    subtitle: "Limited Edition Collection",
    cta: "Explore Collection",
    accent: "#C9D8C5",
    href: "/products",
  },
  {
    id: 3,
    image: "/images/hero-3.png",
    tag: "Bestseller",
    title: ["Crafted For", "Every Step"],
    subtitle: "Premium Comfort Series",
    cta: "Discover More",
    accent: "#C5C9D8",
    href: "/products",
  },
  {
    id: 4,
    image: "/images/hero-4.png",
    tag: "Women's Edit",
    title: ["Walk With", "Confidence"],
    subtitle: "New Styles Just Landed",
    cta: "View All",
    accent: "#D8C5C9",
    href: "/products",
  },
];

const THUMB_IMAGES = [
  "/images/sh-1.png",
  "/images/sh-2.png",
  "/images/sh-3.png",
];

export default function HeroSection2() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const swiperRef = useRef(null);
  const intervalRef = useRef(null);

  const currentSlide = SLIDES[activeIndex];

  useEffect(() => {
    setProgress(0);
    clearInterval(intervalRef.current);
    const start = Date.now();
    const duration = 5000;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / duration) * 100, 100));
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [activeIndex]);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-neutral-950 md:block hidden">
      {/* Swiper full-bleed */}
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        speed={900}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) =>
          setActiveIndex(swiper.realIndex % SLIDES.length)
        }
        className="absolute inset-0 w-full h-full"
      >
        {SLIDES.map((slide, i) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title.join(" ")}
                fill
                priority={i === 0}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/95 via-neutral-950/20 to-neutral-950/20" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
        {/* Main content */}
        <div className="flex-1 flex items-center">
          <div className="container px-4 mx-auto">
            <div className="max-w-xl">
              {/* Tag pill */}
              <div
                key={`tag-${activeIndex}`}
                className="inline-block mb-6 animate-[fadeSlideUp_0.5s_ease_forwards]"
              >
                <span
                  className="font-cairo text-xs font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: currentSlide.accent,
                    color: "#1a1a1a",
                  }}
                >
                  {currentSlide.tag}
                </span>
              </div>

              {/* Headline */}
              <h1
                key={`title-${activeIndex}`}
                className="font-headline text-white uppercase leading-[0.88] tracking-tight mb-6 animate-[fadeSlideUp_0.55s_0.1s_ease_both]"
                style={{
                  fontSize: "clamp(3rem, 7vw, 7rem)",
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                {currentSlide.title.map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <>
                        <span
                          className="italic font-extrabold"
                          style={{
                            WebkitTextStroke: "2px white",
                            color: "transparent",
                          }}
                        >
                          {line}
                        </span>
                      </>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p
                key={`sub-${activeIndex}`}
                className="font-cairo text-white/60 text-base mb-10 animate-[fadeSlideUp_0.55s_0.2s_ease_both]"
                style={{ opacity: 0, animationFillMode: "forwards" }}
              >
                {currentSlide.subtitle}
              </p>

              {/* CTA */}
              <div
                key={`cta-${activeIndex}`}
                className="pointer-events-auto animate-[fadeSlideUp_0.55s_0.3s_ease_both]"
                style={{ opacity: 0, animationFillMode: "forwards" }}
              >
                <Link
                  href={currentSlide.href}
                  className="group inline-flex items-center gap-4 bg-white text-neutral-900 px-7 py-4 font-headline text-sm font-semibold uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                >
                  <span>{currentSlide.cta}</span>
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container px-4 mx-auto pb-10 pointer-events-auto">
          <div className="flex items-end justify-between gap-6">
            {/* Slide counter + progress */}
            <div className="flex items-center gap-6">
              <span className="font-headline text-white/40 text-xs tracking-widest uppercase">
                0{activeIndex + 1} / 0{SLIDES.length}
              </span>
              <div className="w-32 h-px bg-white/20 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-white transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Slide nav dots */}
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => swiperRef.current?.slideTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeIndex
                      ? "w-8 h-2 bg-white"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Thumbnail strip */}
            <div className="hidden lg:flex gap-3">
              {THUMB_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className="relative w-16 h-20 overflow-hidden border border-white/10 hover:border-white/40 transition-colors cursor-pointer group"
                  onClick={() => swiperRef.current?.slideTo(i)}
                >
                  <Image
                    src={src}
                    alt={`Slide ${i + 1}`}
                    fill
                    sizes="64px"
                    style={{ objectFit: "cover" }}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  {i === activeIndex && (
                    <div className="absolute inset-0 border-2 border-white pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/15 transition-colors flex items-center justify-center text-white"
        aria-label="Previous slide"
      >
        <ArrowRightIcon className="rotate-180" />
      </button>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/15 transition-colors flex items-center justify-center text-white"
        aria-label="Next slide"
      >
        <ArrowRightIcon />
      </button>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
