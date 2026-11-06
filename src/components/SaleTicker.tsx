'use client';

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useSettings, type SettingsTickerItem } from "@/lib/hooks/useSettings";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/** Announcement bar from the store settings. Hidden when the ticker is off or has no text. */
export default function SaleTicker() {
  const pathname = usePathname();
  const isHome = pathname === "/en" || pathname === "/ar";
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  const { data } = useSettings();
  const tickers = data?.data?.tickers;
  // Skip items with no text at all.
  const items = (tickers?.items ?? []).filter(
    (item) => item.primary_text?.trim() || item.secondary_text?.trim(),
  );

  if (!tickers || items.length === 0) return null;

  const bg = tickers.background;

  return (
    <div
      className={`w-full overflow-hidden shadow-2xl ${!bg ? 'bg-gradient-to-b from-[#D10C11] via-[#E23E38] to-[#E7090E]' : ''} ${isHome ? "md:!hidden" : ""}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {reducedMotion ? <RotatingItems items={items} /> : <Marquee items={items} />}
    </div>
  );
}

function TickerItem({ item }: { item: SettingsTickerItem }) {
  return (
    <div className="mx-4 flex items-center gap-4 font-beatrice text-[12px] uppercase leading-none sm:mx-5 sm:gap-6 sm:text-[14px]">
      {item.primary_text && <span className="font-bold" style={{ color: item.primary_text_color }}>{item.primary_text}</span>}
      {item.secondary_text && <span className="font-medium" style={{ color: item.secondary_text_color }}>{item.secondary_text}</span>}
    </div>
  );
}

function Marquee({ items }: { items: SettingsTickerItem[] }) {
  // Two identical copies side by side, each at least as wide as the bar. Both slide by exactly
  // one copy's width and restart, so the bar is never empty — whatever the screen size,
  // text length or number of tickers.
  const copy = Array.from({ length: Math.max(1, Math.ceil(6 / items.length)) }, () => items).flat();
  // Keep a steady reading speed: more text, longer loop.
  const duration = Math.max(18, copy.length * 4);

  return (
    <div className="ticker-viewport flex w-full overflow-hidden py-1.5 sm:py-2">
      {[0, 1].map((n) => (
        <div
          key={n}
          aria-hidden={n === 1 || undefined}
          className="ticker-copy flex min-w-full shrink-0 items-center justify-around whitespace-nowrap"
          style={{ animationDuration: `${duration}s` }}
        >
          {copy.map((item, idx) => (
            <TickerItem key={`${item.id}-${idx}`} item={item} />
          ))}
        </div>
      ))}
      <style jsx>{`
        .ticker-copy {
          animation-name: saleTicker;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .ticker-viewport:hover .ticker-copy {
          animation-play-state: paused;
        }
        /* RTL lays the copies out right-to-left, so slide them the other way. */
        :global([dir='rtl']) .ticker-copy {
          animation-name: saleTickerRtl;
        }
        @keyframes saleTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes saleTickerRtl {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/** Reduced motion: no scrolling — show one item at a time and switch every 4 seconds. */
function RotatingItems({ items }: { items: SettingsTickerItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length, paused]);

  return (
    <div
      className="flex items-center justify-center py-1.5 sm:py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <TickerItem item={items[index % items.length]} />
    </div>
  );
}
