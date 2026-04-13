import Link from "next/link";
import React, { JSX } from "react";

interface ProductCardProps {
    image?: string;
    category?: string;
    title?: string;
    price?: string;
    oldPrice?: string;
    colors?: string[];
}

export default function ProductCard({
    image = "/images/sh-1.png",
    category = "Men's Shoes",
    title = "Nike Air Max Plus",
    price = "2,590 EGP",
    oldPrice,
    colors = ["#9ea0a3", "black", "#312be2"],
}: ProductCardProps): JSX.Element {
    return (
        <Link href={`/products/${title}`} className="group w-full max-w-full cursor-pointer sm:max-w-[445px]">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[#e8e8e8]">
                <img
                    src={image}
                    alt={title}
                    className="h-auto w-full  object-contain transition-transform duration-300 group-hover:scale-110 sm:max-w-full"
                />
            </div>

            <div className="pt-4 sm:pt-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-2.5 sm:gap-2.5">
                    {colors.map((color, index) => (
                        <span
                            key={index}
                            className="h-4 w-4 rounded-full border border-gray-200 sm:h-5 sm:w-5"
                            style={{ backgroundColor: color }}
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
                    <span
                        className={`font-beatrice text-[12px] leading-none font-extrabold sm:text-[18px] md:text-[20px] ${oldPrice ? "text-[#FF0000]" : "text-black"
                            }`}
                    >
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