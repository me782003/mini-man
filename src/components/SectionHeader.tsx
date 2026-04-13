import React, { JSX } from "react";

interface SectionHeaderProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    count?: number;
    seeAllHref?: string;
}

export default function SectionHeader({
    primaryTitle = "MIRROR",
    secondaryTitle = "COLLECTION",
    count = 50,
    seeAllHref = "#",
}: SectionHeaderProps): JSX.Element {
    return (
        <div className="w-full container px-4">
            <div className="flex items-end justify-between gap-4">
                <div className="flex items-start">
                    <h2 className="flex flex-col text-[34px] font-beatrice font-extrabold uppercase leading-[35px] md:leading-[50px] text-black sm:text-[48px]">
                        <span>{primaryTitle}</span>
                        <span>{secondaryTitle}</span>
                    </h2>

                    <span className="text-[18px] font-beatrice font-extrabold text-[#FF0000] sm:text-[20px]">
                        ({count})
                    </span>
                </div>

                <a
                    href={seeAllHref}
                    className="mb-1 hidden shrink-0 items-center gap-2 text-[16px] font-medium text-[#6b6b6b] transition hover:text-[#4f4f4f] md:flex"
                >
                    <span className="font-beatrice">See All</span>
                    <span className="text-[28px] leading-none sm:text-[34px] lg:text-[52px]">
                        <svg
                            width="37"
                            height="14"
                            viewBox="0 0 37 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                stroke="#5E5E5E"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </a>
            </div>
        </div>
    );
}