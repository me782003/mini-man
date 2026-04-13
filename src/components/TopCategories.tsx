'use client';

import React, { useState } from 'react';
import { Link } from '../i18n/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

type CategoryItem = {
    label: string;
    href: string;
    subcategories: { label: string; href: string }[];
};

const categories: CategoryItem[] = [
    {
        label: 'Men',
        href: '/men',
        subcategories: [
            { label: 'Items By MiniMan', href: '/products' },
            { label: 'Mirror', href: '/products' },
            { label: 'Classic', href: '/products' },
            { label: 'Big Size', href: '/products' },
            { label: 'Slippers', href: '/products' },
        ],
    },
    {
        label: 'Women',
        href: '/women',
        subcategories: [
            { label: 'New Arrivals', href: '/products' },
            { label: 'Classic', href: '/products' },
            { label: 'Heels', href: '/products' },
            { label: 'Sneakers', href: '/products' },
        ],
    },
    {
        label: 'Kids',
        href: '/kids',
        subcategories: [
            { label: 'Boys', href: '/products' },
            { label: 'Girls', href: '/products' },
            { label: 'School', href: '/products' },
            { label: 'Sneakers', href: '/products' },
        ],
    },
    {
        label: 'Accessories',
        href: '/accessories',
        subcategories: [
            { label: 'Bags', href: '/products' },
            { label: 'Socks', href: '/products' },
            { label: 'Care Products', href: '/products' },
            { label: 'Insoles', href: '/products' },
        ],
    },
];

export default function TopCategories() {
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const activeCategory = categories.find(
        category => category.label === openCategory
    );

    const handleToggle = (label: string) => {
        setOpenCategory(prev => (prev === label ? null : label));
    };

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
                    {categories.map(category => (
                        <SwiperSlide key={category.label} className="!w-auto">
                            <button
                                onClick={() => handleToggle(category.label)}
                                className={[
                                    'text-[12px] font-beatrice font-medium leading-none text-black transition-opacity hover:opacity-70',
                                    openCategory === category.label ? 'border-b-2 border-black' : '',
                                ].join(' ')}
                            >
                                {category.label}
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
                        {activeCategory?.subcategories.map(sub => (
                            <Link
                                key={sub.label}
                                href={sub.href}
                                className="px-4 py-3 text-left font-beatrice text-[12px] text-black transition-colors hover:bg-gray-50"
                                onClick={() => setOpenCategory(null)}
                            >
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}