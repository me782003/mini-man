import React, { JSX } from "react";
import { useTranslations } from "next-intl";

interface SectionHeaderProps {
    primaryTitle?: string | React.ReactNode;
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
    const t = useTranslations("Site");
    return (
        <div className="w-full container px-4">
            <div className="flex items-end justify-between gap-4">
                <div className="flex items-start">
                    {/* English stacks the two words; Arabic reads better on one line. */}
                    <h2 className="flex flex-col rtl:flex-row rtl:flex-wrap rtl:gap-x-3 text-[34px] font-beatrice font-extrabold uppercase leading-[35px] md:leading-[50px] text-black sm:text-[48px]">
                        <span>{primaryTitle}</span>
                        <span>{secondaryTitle}</span>
                    </h2>

                    <span className="text-[18px] font-beatrice font-extrabold text-[#FF0000] sm:text-[20px]">
                        ({count})
                    </span>
                </div>

                <a
                    href={seeAllHref}
                    className="mb-1 hidden shrink-0 items-center gap-2 bg-gray-100 px-4 py-2.5 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-black hover:text-white active:bg-black active:text-white md:flex"
                >
                    <span className="font-beatrice">{t("seeAll")}</span>
                    <span className="flex leading-none">
                        <svg
                            width="24"
                            height="12"
                            viewBox="0 0 37 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="rtl:rotate-180"
                        >
                            <path
                                d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                stroke="currentColor"
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