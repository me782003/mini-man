"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { ReviewIcon } from '../icons';
import type { HomeReview } from '@/lib/hooks/useHomePage';

interface ProductReviewsProps {
  reviews?: HomeReview[];
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#FFD700" : "none"} stroke={filled ? "#FFD700" : "#E5E7EB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ReviewCard = ({ review }: { review: HomeReview }) => (
  <div className="flex h-full flex-col justify-between border border-[#00000033] bg-white p-4 shadow-xl sm:p-5 md:p-7">
    <div>
      <div className="mb-4 flex gap-1 sm:mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= review.rating} />
        ))}
      </div>
      {review.comment && (
        <p className="mb-6 text-[13px] leading-[21px] font-beatrice font-medium text-[#5a5a5a] sm:mb-7 sm:text-[14px] sm:leading-[22px] md:mb-8">
          {review.comment}
        </p>
      )}
    </div>

    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-10 sm:w-10">
          <img
            src={review.user_avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}`}
            alt={review.user_name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}`;
            }}
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[14px] leading-tight font-beatrice font-bold text-black sm:text-[15px] md:text-[16px]">
            {review.user_name}
          </span>
          {review.review_date && (
            <span className="text-[11px] font-beatrice font-medium text-black sm:text-[12px]">
              {review.review_date}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <ReviewIcon />
      </div>
    </div>
  </div>
);

const ProductReviews = ({ reviews }: ProductReviewsProps) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-5 md:py-20 bg-white">
      <div className="container">
        <h2 className="text-[32px] md:text-[48px] font-beatrice font-extrabold leading-tight md:leading-[50px] uppercase mb-7 md:mb-12">
          PRODUCT <br />
          REVIEWS
        </h2>

        <Swiper
          modules={[Navigation, FreeMode, Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          freeMode={true}
          breakpoints={{
            0: { slidesPerView: 1.1 },
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
            1280: { slidesPerView: 3.5 },
          }}
          className="review-swiper pb-10"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ProductReviews;
