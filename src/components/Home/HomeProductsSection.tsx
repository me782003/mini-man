
"use client";

import React from 'react';
import ProductCard from '../ProductCard';

const SAMPLE_PRODUCTS = [
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        price: "2,590 EGP",
        colors: ["#2d3e40", "#c84c5e", "#56ad7b", "#a8ccba"]
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        price: "2,590 EGP",
        oldPrice: "2,590 EGP",
        colors: ["#ffce00", "#e8b4a2", "#c41230"]
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        price: "2,590 EGP",
        colors: ["#9ea0a3", "black", "#312be2"]
    },
    {
        image: "/images/sh-1.png",
        title: "Nike Air Max Plus",
        category: "Men's Shoes",
        price: "2,590 EGP",
        oldPrice: "2,590 EGP",
        colors: ["#d2ab7f", "black", "#3e1215", "#0e442a", "#86992d"]
    }
];

const HomeProductsSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container px-4">
                {/* Title */}
                <h2 className="text-[32px] md:text-[48px] font-beatrice font-extrabold leading-tight md:leading-[50px] uppercase mb-10">
                    SUMMER <br />
                    COLLECTION <br />
                    2026
                </h2>

                {/* Filter and Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#DFDFDF] pb-2 mb-10">
                    <div className="flex items-center gap-8 text-[16px] font-beatrice  uppercase text-gray-400">
                        <button className="text-black f">(ALL)</button>
                        <button className="hover:text-black transition-colors">Men</button>
                        <button className="hover:text-black transition-colors">Women</button>
                        <button className="hover:text-black transition-colors">KID</button>
                    </div>

                    {/* <div className="flex items-center gap-6">
                        <button
                            className="p-2 text-gray-300 hover:text-black transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            className="p-2 text-gray-300 hover:text-black transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div> */}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {SAMPLE_PRODUCTS.map((product, index) => (
                        <div key={index}>
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>

                {/* More Button */}
                <div className="flex flex-col items-center mt-16 group cursor-pointer">
                    <span className="text-gray-400 text-sm font-beatrice uppercase mb-2 group-hover:text-black transition-colors">More</span>
                    <div className="text-gray-400 group-hover:text-black transition-all group-hover:translate-y-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeProductsSection;

