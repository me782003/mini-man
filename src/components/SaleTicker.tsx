'use client';

import { usePathname } from "next/navigation";
import { useHomePage } from "@/lib/hooks/useHomePage";

export default function SaleTicker() {
  const pathname = usePathname();
  const isHome = pathname === "/en" || pathname === "/ar";

  const { data } = useHomePage();
  const tickers = data?.data?.tickers;

  const bg = tickers?.background;
  const items = tickers?.items?.length
    ? ((): typeof tickers.items => {
        const src = tickers.items;
        const base = Array.from({ length: Math.ceil(12 / src.length) }, () => src).flat();
        return [...base, ...base];
      })()
    : Array.from({ length: 24 }, (_, i) => ({
      id: i,
      primary_text: '50% off',
      secondary_text: 'sale',
      primary_text_color: '#FFFFFF',
      secondary_text_color: '#000000',
    }));

  return (
    <div
      className={`w-full overflow-hidden shadow-2xl ${!bg ? 'bg-gradient-to-b from-[#D10C11] via-[#E23E38] to-[#E7090E]' : ''} ${isHome ? "md:!hidden" : ""}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div className="sale-ticker-track flex min-w-max items-center whitespace-nowrap py-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="mx-6 flex items-center gap-8 text-[14px] font-extrabold uppercase leading-none sm:text-[20px]"
          >
            <span style={{ color: item.primary_text_color }}>{item.primary_text}</span>
            <span style={{ color: item.secondary_text_color }}>{item.secondary_text}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .sale-ticker-track {
          animation: saleTicker 40s linear infinite;
        }
        @keyframes saleTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
