'use client';

import HeroBannerSwiper from "@/components/HeroBannerSwiper";
import HeroSection2 from "@/components/Home/HeroSection2";
import SwiperSection from "@/components/SwiperSection";
import HomeProductsSection from "@/components/Home/HomeProductsSection";
import ProductReviews from "@/components/Home/ProductReviews";
import { useHomePage } from "@/lib/hooks/useHomePage";
// this is comment
export default function HomeClient() {
  const { data } = useHomePage();
  const pageData = data?.data;

  const lastWeek = pageData?.last_week_added;

  return (
    <section>
      <HeroBannerSwiper banners={pageData?.banners} />
      <HeroSection2 banners={pageData?.banners} />
      {lastWeek && lastWeek.products.length > 0 && (
        <SwiperSection
          primaryTitle={<>
            <span>{lastWeek.title.split(" ")[0]}</span>
            <br />
            <span>{lastWeek.title.split(" ").slice(1).join(" ").toUpperCase()}</span>
          </>}
          seeAllHref="/products"
          secondaryTitle=""
          count={lastWeek.count}
          items={lastWeek.products as any[]}
        />
      )}
      <HomeProductsSection collections={pageData?.collections} />
      <ProductReviews reviews={pageData?.reviews} />
    </section>
  );
}
