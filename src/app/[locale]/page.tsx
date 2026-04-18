import HeroBannerSwiper from "@/components/HeroBannerSwiper";
import HomeProductsSection from "@/components/Home/HomeProductsSection";
import ProductReviews from "@/components/Home/ProductReviews";
import HeroSection from "@/components/Home/HeroSection";
import HeroSection2 from "@/components/Home/HeroSection2";

import SwiperSection from "@/components/SwiperSection";

const SAMPLE_PRODUCTS = [
  {
    title: "Nike Air Max Plus",
    category: "Men's Shoes",
    price: "2,590 EGP",
    oldPrice: "3,590 EGP",
    colorVariants: [
      { color: "#9ea0a3", images: ["/images/sh-1.png", "/images/sh-2.png", "/images/sh-3.png"] },
      { color: "#1a1a1a", images: ["/images/sh-2.png", "/images/sh-3.png"] },
      { color: "#312be2", images: ["/images/sh-3.png", "/images/sh-1.png"] },
    ],
  },
  {
    title: "Adidas Ultraboost",
    category: "Running Shoes",
    price: "4,200 EGP",
    colorVariants: [
      { color: "#ffffff", images: ["/images/sh-2.png", "/images/sh-1.png"] },
      { color: "#1a1a1a", images: ["/images/sh-3.png", "/images/sh-2.png"] },
    ],
  },
  {
    title: "Puma RS-X",
    category: "Streetwear",
    price: "1,800 EGP",
    oldPrice: "2,400 EGP",
    colorVariants: [
      { color: "#e63946", images: ["/images/sh-3.png", "/images/sh-1.png", "/images/sh-2.png"] },
      { color: "#457b9d", images: ["/images/sh-1.png", "/images/sh-3.png"] },
      { color: "#f1faee", images: ["/images/sh-2.png"] },
    ],
  },
  {
    title: "New Balance 550",
    category: "Lifestyle",
    price: "3,100 EGP",
    colorVariants: [
      { color: "#f1faee", images: ["/images/sh-1.png", "/images/sh-2.png"] },
      { color: "#2d6a4f", images: ["/images/sh-3.png", "/images/sh-1.png"] },
    ],
  },
  {
    title: "Reebok Classic",
    category: "Old School",
    price: "1,500 EGP",
    colorVariants: [
      { color: "#f1faee", images: ["/images/sh-2.png", "/images/sh-3.png", "/images/sh-1.png"] },
    ],
  },
];

export default function HomePage() {
  return (
    <section>
      {/* mobile only */}
      <HeroBannerSwiper />
      <HeroSection2 />
      {/* <HeroSection /> */}
      <SwiperSection
        primaryTitle="MIRROR"
        seeAllHref="/products"
        secondaryTitle="COLLECTION"
        count={50}
        items={SAMPLE_PRODUCTS}
      />
      <HomeProductsSection />

      <ProductReviews />
    </section>
  );
}

