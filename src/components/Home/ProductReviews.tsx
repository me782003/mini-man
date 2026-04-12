"use client";

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { ReviewIcon } from '../icons';

const REVIEWS = [
    {
        id: 1,
        author: "Nada Ahmed",
        date: "12-12-2025",
        rating: 4,
        text: "In my opinion, a good building product is worth the investment, easy to use, and offers real value for its price. If it proves its efficiency in practical applica..",
        avatar: "/images/avatar.png"
    },
    {
        id: 2,
        author: "Nada Ahmed",
        date: "12-12-2025",
        rating: 4,
        text: "In my opinion, a good building product is worth the investment, easy to use, and offers real value for its price. If it proves its efficiency in practical applica..",
        avatar: "/images/avatar.png"
    },
    {
        id: 3,
        author: "Nada Ahmed",
        date: "12-12-2025",
        rating: 4,
        text: "In my opinion, a good building product is worth the investment, easy to use, and offers real value for its price. If it proves its efficiency in practical applica..",
        avatar: "/images/avatar.png"
    },
    {
        id: 4,
        author: "Nada Ahmed",
        date: "12-12-2025",
        rating: 4,
        text: "In my opinion, a good building product is worth the investment, easy to use, and offers real value for its price. If it proves its efficiency in practical applica..",
        avatar: "/images/avatar.png"
    },
    {
        id: 5,
        author: "Nada Ahmed",
        date: "12-12-2025",
        rating: 4,
        text: "In my opinion, a good building product is worth the investment, easy to use, and offers real value for its price. If it proves its efficiency in practical applica..",
        avatar: "/images/avatar.png"
    }
];

const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={filled ? "#FFD700" : "none"}
        stroke={filled ? "#FFD700" : "#E5E7EB"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const ReviewCard = ({ review }: { review: typeof REVIEWS[0] }) => (
    <div className="bg-white border border-[#00000033] p-7 h-full flex flex-col justify-between shadow-xl">
        <div>
            <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= review.rating} />
                ))}
            </div>
            <p className="text-[14px] leading-[22px] font-beatrice font-medium text-[#5a5a5a] mb-8">
                {review.text}
            </p>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(review.author);
                        }}
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[16px] font-beatrice font-bold text-black leading-tight">
                        {review.author}
                    </span>
                    <span className="text-[12px] font-beatrice font-medium text-black">
                        {review.date}
                    </span>
                </div>
            </div>
            <ReviewIcon />
        </div>
    </div>
);

const ProductReviews = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-[48px] font-beatrice font-extrabold leading-[50px] uppercase mb-12">
                    PRODUCT <br />
                    REVIEWS
                </h2>

                <Swiper
                    modules={[Navigation, FreeMode, Autoplay]}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    spaceBetween={20}
                    slidesPerView={1.2}
                    freeMode={true}
                    breakpoints={{
                        640: {
                            slidesPerView: 2.2,
                        },
                        1024: {
                            slidesPerView: 3.2,
                        },
                        1280: {
                            slidesPerView: 3.5,
                        },
                    }}
                    className="review-swiper pb-10"
                >
                    {REVIEWS.map((review) => (
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
