'use client';

import { usePathname } from "next/navigation";

const items = Array.from({ length: 12 }, (_, i) => i);

export default function SaleTicker() {


  const pathname = usePathname();

  const isHome = pathname === "/en" || pathname === "/ar";




  return (
    <div className={`w-full   overflow-hidden bg-[#ff2a2a] bg-gradient-to-b from-[#D10C11] via-[#E23E38] to-[#E7090E] shadow-2xl ${isHome ? " md:!hidden" : ""}`}>
      <div className="sale-ticker-track flex min-w-max items-center whitespace-nowrap py-3 ">
        {items.map((item) => (
          <div
            key={item}
            className="mx-6 flex items-center gap-8 text-[14px] font-extrabold uppercase leading-none sm:text-[20px]"
          >
            <span className="text-white">50% off</span>
            <span className="text-black">sale</span>
          </div>
        ))}

        {items.map((item) => (
          <div
            key={`duplicate-${item}`}
            className="mx-6 flex items-center gap-8 text-[14px] font-extrabold uppercase leading-none sm:text-[20px]"
          >
            <span className="text-white">50% off</span>
            <span className="text-black">sale</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .sale-ticker-track {
          animation: saleTicker 100s linear infinite;
        }

        @keyframes saleTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}