"use client";

import Link from "next/link";
import React, { JSX, useEffect, useRef, useState } from "react";

export interface ColorVariant {
    color: string;
    images: string[];
}

interface ProductCardProps {
    id?: string | number;
    image?: string;
    colorVariants?: ColorVariant[];
    colors?: string[];
    category?: string;
    title?: string;
    price?: string;
    oldPrice?: string;
}

export default function ProductCard({
    id,
    image = "/images/sh-1.png",
    colorVariants,
    colors = ["#9ea0a3", "black", "#312be2"],
    category = "Men's Shoes",
    title = "Nike Air Max Plus",
    price = "2,590 EGP",
    oldPrice,
}: ProductCardProps): JSX.Element {
    const hasVariants = colorVariants && colorVariants.length > 0;

    const [colorIdx, setColorIdx] = useState(0);
    const [imgIdx, setImgIdx] = useState(0);
    // direction: 1 = forward (right→left), -1 = backward (left→right)
    const [, setDirection] = useState(1);
    const [animKey, setAnimKey] = useState(0);
    const [hovered, setHovered] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentImages: string[] = hasVariants
        ? colorVariants![colorIdx].images
        : [image];

    const dotColors = hasVariants ? colorVariants!.map((v) => v.color) : colors;

    const goTo = (nextIdx: number, dir: number) => {
        setDirection(dir);
        setAnimKey((k) => k + 1);
        setImgIdx(nextIdx);
    };

    const prev = () => goTo((imgIdx - 1 + currentImages.length) % currentImages.length, -1);
    const next = () => goTo((imgIdx + 1) % currentImages.length, 1);

    useEffect(() => { setImgIdx(0); setAnimKey((k) => k + 1); }, [colorIdx]);

    useEffect(() => {
        if (hovered && currentImages.length > 1) {
            intervalRef.current = setInterval(() => {
                setDirection(1);
                setAnimKey((k) => k + 1);
                setImgIdx((i) => (i + 1) % currentImages.length);
            }, 1500);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [hovered, colorIdx, currentImages.length]);

    const handleColorClick = (e: React.MouseEvent, idx: number) => {
        e.preventDefault();
        setColorIdx(idx);
    };

    return (
        <Link href={`/products/${id ?? title}`} className="group w-full max-w-full cursor-pointer sm:max-w-[445px]">
            {/* Image area */}
            <div
                className="relative aspect-square w-full overflow-hidden bg-[#e8e8e8]"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img
                    key={animKey}
                    src={currentImages[imgIdx]}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ animation: "imgFadeIn 0.35s ease forwards" }}
                />

                {/* Navigation */}
                {currentImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); prev(); }}
                            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/90 shadow-md transition-all duration-200 ${
                                hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                            }`}
                            aria-label="Previous image"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 3L5 8L10 13" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); next(); }}
                            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-white/90 shadow-md transition-all duration-200 ${
                                hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                            }`}
                            aria-label="Next image"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className={`absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
                            {currentImages.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); goTo(i, i > imgIdx ? 1 : -1); }}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? "w-4 bg-neutral-900" : "w-1.5 bg-neutral-900/30"}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <style>{`
                    @keyframes imgFadeIn {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                `}</style>
            </div>

            {/* Info */}
            <div className="pt-4 sm:pt-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-2.5 sm:gap-2.5">
                    {dotColors.map((color, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => handleColorClick(e, idx)}
                            className={`h-4 w-4 rounded-full border transition-all duration-150 sm:h-5 sm:w-5 ${
                                idx === colorIdx && hasVariants
                                    ? "ring-2 ring-offset-1 ring-neutral-700 scale-110"
                                    : "border-gray-200"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${idx + 1}`}
                        />
                    ))}
                </div>

                <p className="mb-2 text-xs font-beatrice font-medium text-[#5a5a5a] sm:mb-2.5 sm:text-[14px]">
                    {category}
                </p>

                <h3 className="mb-2 line-clamp-2 text-[16px] font-semibold leading-snug text-black font-beatrice sm:text-[18px] md:text-[20px]">
                    {title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`font-beatrice text-[12px] leading-none font-extrabold sm:text-[18px] md:text-[20px] ${oldPrice ? "text-[#FF0000]" : "text-black"}`}>
                        {price}
                    </span>
                    {oldPrice && (
                        <span className="font-beatrice text-[12px] leading-none font-normal text-[#4f4f4f] line-through sm:text-[16px] md:text-[20px]">
                            {oldPrice}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
