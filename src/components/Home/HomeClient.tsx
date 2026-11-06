'use client';

import HeroBannerSwiper from "@/components/HeroBannerSwiper";
import HeroSection2 from "@/components/Home/HeroSection2";
import SwiperSection from "@/components/SwiperSection";
import HomeProductsSection from "@/components/Home/HomeProductsSection";
import ProductReviews from "@/components/Home/ProductReviews";
import { useHomePage } from "@/lib/hooks/useHomePage";
import { useTranslations } from "next-intl";
export default function HomeClient() {
  const t = useTranslations("Home");
  const { data } = useHomePage();
  const pageData = data?.data;

  const lastWeek = pageData?.last_week_added;

  return (
    <section>
      <HeroBannerSwiper banners={pageData?.banners} />
      <HeroSection2 banners={pageData?.banners} />
      {lastWeek && lastWeek.products.length > 0 && (
        <SwiperSection
          // Fixed title ("Latest products" / "أحدث المنتجات") instead of the API's "Last products".
          primaryTitle={t("latestTitle1")}
          secondaryTitle={t("latestTitle2")}
          seeAllHref="/products"
          count={lastWeek.count}
          items={lastWeek.products as any[]}
        />
      )}
      <HomeProductsSection collections={pageData?.collections} />
      <ProductReviews reviews={pageData?.reviews} />
    </section>
  );
}
