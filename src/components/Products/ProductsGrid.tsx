'use client';

import React, { useState } from 'react';
import ProductCard from '../ProductCard';
import { SearchIcon } from '../icons';
import { ChevronDownIcon, ChevronRight, SlidersHorizontal } from 'lucide-react';

const PAGE_SIZE = 6;

const PRODUCTS = [
    { id: 1, image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#1a1a2e', '#8b2222', '#4dd9ac'] },
    { id: 2, image: '/images/sh-2.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#f5a623', '#e88080', '#4dd9ac'] },
    { id: 3, image: '/images/image 9.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#9ea0a3', '#000000', '#1a237e'] },
    { id: 4, image: '/images/image 10.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#c4a882', '#9ea0a3'] },
    { id: 5, image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#1a1a2e', '#4dd9ac'] },
    { id: 6, image: '/images/sh-2.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#f5a623', '#e63946'] },
    { id: 7, image: '/images/image 9.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#9ea0a3', '#000000'] },
    { id: 8, image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#8b2222', '#4dd9ac'] },
    { id: 9, image: '/images/image 10.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#c4a882', '#1a237e', '#e88080'] },
    { id: 10, image: '/images/sh-2.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#f5a623', '#000000'] },
    { id: 11, image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#1a1a2e', '#e63946', '#9ea0a3'] },
    { id: 12, image: '/images/image 9.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#4dd9ac', '#000000', '#8b2222'] },
];

export default function ProductsGrid({ setFiltersOpen }: { setFiltersOpen: any }) {
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const filtered = search.trim()
        ? PRODUCTS.filter(
            p =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.category.toLowerCase().includes(search.toLowerCase())
        )
        : PRODUCTS;

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;

    const handleSearch = (value: string) => {
        setSearch(value);
        setVisibleCount(PAGE_SIZE);
    };

    return (
        <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-4 md:mb-8 max-w-[367px]">
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => handleSearch(e.target.value)}
                    className="w-full border border-gray-300 py-3 pl-4 pr-12 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <SearchIcon />
                </span>
            </div>
            {/* Heading + mobile filter button */}

            <button
                className="flex mb-5 items-center gap-2 md:hidden   font-beatrice text-[13px] font-semibold uppercase tracking-widest hover:border-black transition-colors"
                onClick={() => setFiltersOpen(true)}
            >
                Filters
                <ChevronRight size={20} />
            </button>

            {/* Grid */}
            {visible.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-x-[10px] md:gap-x-6 gap-y-5 md:gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                        {visible.map(product => (
                            <ProductCard
                                key={product.id}
                                image={product.image}
                                title={product.title}
                                category={product.category}
                                price={product.price}
                                colors={product.colors}
                            />
                        ))}
                    </div>
                    {
                        hasMore && (
                            <div className="w-full h-[1px] mt-10 bg-neutral-200"></div>
                        )
                    }

                    {hasMore && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                                className=" flex items-center flex-col px-12 py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
                            >
                                More
                                <ChevronDownIcon />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="py-24 text-center font-beatrice text-[16px] text-gray-400">
                    No products found.
                </p>
            )}
        </div>
    );
}
