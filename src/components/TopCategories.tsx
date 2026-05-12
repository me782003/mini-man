'use client';

import React, { useState } from 'react';
import { Link } from '../i18n/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useCatalogCategories } from '@/lib/hooks/useCatalog';

export default function TopCategories() {
    const { data, isPending } = useCatalogCategories();
    const categories = data?.data ?? [];
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

    const activeCategory = categories.find((c) => c.id === openCategoryId);

    const handleToggle = (id: number) => {
        setOpenCategoryId((prev) => (prev === id ? null : id));
    };

    if (isPending) {
        return (
            <div className="w-full py-2.5 md:hidden">
                <div className="flex gap-8 px-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-2.5 md:hidden">
            <div className="relative mx-auto px-4">
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={32}
                    className="!overflow-visible"
                    centeredSlides={true}
                    centeredSlidesBounds={true}
                    centerInsufficientSlides={true}
                >
                    {categories.map((category) => (
                        <SwiperSlide key={category.id} className="!w-auto">
                            <button
                                onClick={() => handleToggle(category.id)}
                                className={[
                                    'text-[12px] font-beatrice font-medium leading-none text-black transition-opacity hover:opacity-70',
                                    openCategoryId === category.id ? 'border-b-2 border-black' : '',
                                ].join(' ')}
                            >
                                {category.name}
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div
                    className={`absolute left-0 top-[calc(100%+10px)] z-30 w-full bg-white shadow-lg transition-all duration-200 ${activeCategory
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0'
                        }`}
                >
                    <div className="flex flex-col py-2">
                        {activeCategory?.subCategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/products?sub_category_id=${sub.id}`}
                                className="px-4 py-3 text-left font-beatrice text-[12px] text-black transition-colors hover:bg-gray-50"
                                onClick={() => setOpenCategoryId(null)}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
