"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

import { ArrowRightIcon, SearchIcon } from "@/components/icons";

import "swiper/css";

const PRODUCT_IMAGES = [
  "/images/image 9.png",
  "/images/image 10.png",
  "/images/0d442b72576bccb65db28825ece71e6dfd5879c5.png",
];

const PLACEHOLDER_COUNT = 5;

function ProductSlideCard({ src }) {
  return (
    <div className="relative h-full overflow-hidden bg-white shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt="Product"
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}

const HeroSection = () => {
  return (
    <main
      className="min-h-[100svh] bg-1 w-full  bg-cover bg-center bg-no-repeat pt-[120px]"
      // style={{ backgroundImage: "url('/images/home%20bg.jpg')" }}
    >
      <section className="   xl:ml-[calc((100vw-1280px)/2)] pl-4   flex flex-col py-10 md:py-10">
        <div className="grid flex-1 grid-cols-1 items-stretch gap-[180px] lg:grid-cols-[367px_1fr]">
          <aside className="  space-y-10 self-start">
            <nav className="space-y-1 text-[20px] font-medium font-beatrice uppercase tracking-wide text-neutral-900">
              <a className="block w-fit hover:opacity-70" href="#">
                Men
              </a>
              <a className="block w-fit hover:opacity-70" href="#">
                Women
              </a>
              <a className="block w-fit hover:opacity-70" href="#">
                Kids
              </a>
            </nav>

            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="h-[50px] w-full border border-[#d7d7d7] bg-white/90 px-[20px] font-cairo text-[20px] font-normal text-neutral-900 shadow-sm outline-none ring-0 transition placeholder:text-neutral-500 focus:border-neutral-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-[20px] grid place-items-center text-neutral-500">
                <SearchIcon className="" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-beatrice text-[54px] font-extrabold uppercase leading-[0.9] tracking-tight text-neutral-900">
                <div>New</div>
                <div>Collection</div>
              </div>
              <div className="text-sm font-beatrice text-neutral-700">
                Summer 2024
              </div>
            </div>

            <a
              href="#"
              className="group inline-flex !mt-[100px] h-11 w-full items-center justify-between gap-4 bg-neutral-900 px-4 font-headline text-[20px] font-semibold text-sm text-white shadow-sm transition hover:bg-neutral-800"
            >
              <span>Go To Shop</span>
              <span className="grid place-items-center">
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </aside>

          <div className="min-w-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-end relative">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={24}
              slidesPerView={1.2}
              breakpoints={{
                480: { slidesPerView: 1.35 },
                640: { slidesPerView: 1.85 },
                1024: { slidesPerView: 2.15 },
                1280: { slidesPerView: 2.25 },
              }}
              freeMode={{ enabled: true, momentum: true }}
              grabCursor
              className="hero-product-swiper w-full absolute"
            >
              {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (
                <SwiperSlide key={idx} className="!h-auto">
                  <ProductSlideCard
                    src={PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length]}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HeroSection;
