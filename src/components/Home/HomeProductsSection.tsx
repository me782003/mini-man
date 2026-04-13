"use client";

import React, { useMemo, useState } from 'react';
import ProductCard from '../ProductCard';

type ProductCategory = 'all' | 'men' | 'women' | 'kid';

interface ProductItem {
    image: string;
    title: string;
    category: string;
    filterCategory: Exclude<ProductCategory, 'all'>;
    price: string;
    oldPrice?: string;
    colors: string[];
}

const SAMPLE_PRODUCTS: ProductItem[] = [
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        filterCategory: 'men',
        price: "2,590 EGP",
        colors: ["#2d3e40", "#c84c5e", "#56ad7b", "#a8ccba"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        filterCategory: 'men',
        price: "2,590 EGP",
        oldPrice: "2,990 EGP",
        colors: ["#ffce00", "#e8b4a2", "#c41230"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Women's Shoes",
        filterCategory: 'women',
        price: "2,590 EGP",
        colors: ["#9ea0a3", "black", "#312be2"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Kid's Shoes",
        filterCategory: 'kid',
        price: "2,590 EGP",
        oldPrice: "2,790 EGP",
        colors: ["#d2ab7f", "black", "#3e1215", "#0e442a", "#86992d"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Revolution",
        category: "Women's Shoes",
        filterCategory: 'women',
        price: "2,190 EGP",
        colors: ["#222222", "#d9d9d9"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Flex Runner",
        category: "Kid's Shoes",
        filterCategory: 'kid',
        price: "1,890 EGP",
        colors: ["#f97316", "#2563eb"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike ZoomX",
        category: "Men's Shoes",
        filterCategory: 'men',
        price: "3,290 EGP",
        colors: ["#111827", "#10b981", "#f59e0b"],
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Court Vision",
        category: "Women's Shoes",
        filterCategory: 'women',
        price: "2,390 EGP",
        colors: ["#ffffff", "#ef4444"],
    },
];

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_COUNT = 4;

const FILTERS: { label: string; value: ProductCategory }[] = [
    { label: '(ALL)', value: 'all' },
    { label: 'Men', value: 'men' },
    { label: 'Women', value: 'women' },
    { label: 'KID', value: 'kid' },
];

const HomeProductsSection = () => {
    const [activeFilter, setActiveFilter] = useState<ProductCategory>('all');
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const filteredProducts = useMemo(() => {
        if (activeFilter === 'all') return SAMPLE_PRODUCTS;
        return SAMPLE_PRODUCTS.filter(
            product => product.filterCategory === activeFilter
        );
    }, [activeFilter]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const hasMore = visibleCount < filteredProducts.length;

    const handleFilterChange = (filter: ProductCategory) => {
        setActiveFilter(filter);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleToggleMore = () => {
        if (hasMore) {
            setVisibleCount(prev => prev + LOAD_MORE_COUNT);
        } else {
            setVisibleCount(INITIAL_VISIBLE_COUNT);
        }
    };

    return (
        <section className="bg-white py-20">
            <div className="container px-4">
                {/* Title */}
                <h2 className="mb-10 font-beatrice text-[32px] font-extrabold uppercase leading-tight md:text-[48px] md:leading-[50px]">
                    SUMMER <br />
                    COLLECTION <br />
                    2026
                </h2>

                {/* Filter */}
                <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#DFDFDF] pb-2 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-5 md:gap-8 font-beatrice text-[16px] uppercase text-gray-400">
                        {FILTERS.map(filter => {
                            const isActive = activeFilter === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => handleFilterChange(filter.value)}
                                    className={`transition-colors ${isActive
                                        ? 'text-black'
                                        : 'hover:text-black'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* <p className="font-beatrice text-[14px] uppercase text-gray-400">
                        {filteredProducts.length} Product
                        {filteredProducts.length !== 1 ? 's' : ''}
                    </p> */}
                </div>

                {/* Grid */}
                {visibleProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleProducts.map((product, index) => (
                            <div key={`${product.title}-${index}`}>
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <p className="font-beatrice text-[18px] text-gray-500">
                            No products found in this category.
                        </p>
                    </div>
                )}

                {/* More Button */}
                {filteredProducts.length > INITIAL_VISIBLE_COUNT && (
                    <button
                        type="button"
                        onClick={handleToggleMore}
                        className="group mx-auto mt-16 flex flex-col items-center"
                    >
                        <span className="mb-2 font-beatrice text-sm uppercase text-gray-400 transition-colors group-hover:text-black">
                            {hasMore ? 'More' : 'Less'}
                        </span>
                        <div
                            className={`text-gray-400 transition-all group-hover:text-black ${hasMore ? 'group-hover:translate-y-1' : 'rotate-180 group-hover:-translate-y-1'
                                }`}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </button>
                )}
            </div>
        </section>
    );
};

export default HomeProductsSection;