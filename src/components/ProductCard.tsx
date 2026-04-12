import Image from "next/image";
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
        <div className="w-full max-w-[445px] group cursor-pointer">
            <div className="bg-[#e8e8e8] w-full aspect-square flex items-center justify-center overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
            </div>

            <div className="pt-5">
                <div className="mb-2.5 flex items-center gap-2.5">
                    {colors.map((color, index) => (
                        <span 
                            key={index} 
                            className="h-[20px] w-[20px] rounded-full border border-gray-200" 
                            style={{ backgroundColor: color }} 
                        />
                    ))}
                </div>

                <p className="mb-2.5 text-[14px] font-beatrice font-medium text-[#5a5a5a]">
                    {category}
                </p>

                <h3 className="mb-2 text-[20px] font-semibold leading-tight text-black font-beatrice">
                    {title}
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[20px] leading-none font-beatrice font-extrabold ${oldPrice ? "text-[#FF0000]" : "text-black"}`}>
                        {price}
                    </span>
                    {oldPrice && (
                        <span className="text-[20px]  leading-none text-[#4f4f4f] line-through font-beatrice font-normal">
                            {oldPrice}
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}