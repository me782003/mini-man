import HeroBannerSwiper from "@/components/HeroBannerSwiper";
import HeroSection from "@/components/Home/HeroSection"
import HomeProductsSection from "@/components/Home/HomeProductsSection";
import ProductReviews from "@/components/Home/ProductReviews";
import SwiperSection from "@/components/SwiperSection";

const SAMPLE_PRODUCTS = [
  {
    image: "/images/sh-1.png",
    title: "Nike Air Max Plus",
    category: "Men's Shoes",
    price: "2,590 EGP",
    oldPrice: "3,590 EGP",
    colors: ["#9ea0a3", "black", "#312be2"]
  },
  {
    image: "/images/sh-1.png", // Reusing image for demo
    title: "Adidas Ultraboost",
    category: "Running Shoes",
    price: "4,200 EGP",
    colors: ["white", "black"]
  },
  {
    image: "/images/sh-1.png",
    title: "Puma RS-X",
    category: "Streetwear",
    price: "1,800 EGP",
    oldPrice: "2,400 EGP",
    colors: ["red", "blue", "white"]
  },
  {
    image: "/images/sh-1.png",
    title: "New Balance 550",
    category: "Lifestyle",
    price: "3,100 EGP",
    colors: ["white", "green"]
  },
  {
    image: "/images/sh-1.png",
    title: "Reebok Classic",
    category: "Old School",
    price: "1,500 EGP",
    colors: ["white"]
  }
];

export default function HomePage() {
  return (
    <section>
      {/* mobile only */}
      <HeroBannerSwiper />
      {/* <HeroSection /> */}
      <SwiperSection
        primaryTitle="MIRROR"
        secondaryTitle="COLLECTION"
        count={50}
        items={SAMPLE_PRODUCTS}
      />
      {/* <HomeProductsSection />
      <ProductReviews /> */}
    </section>
  );
}

