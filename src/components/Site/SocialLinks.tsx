'use client';

import React from 'react';
import { FooterFacebookIcon, FooterInstagramIcon, FooterTikTokIcon, FooterThreadsIcon, FooterYouTubeIcon } from '@/components/icons';
import type { SocialContact } from '@/lib/hooks/useSettings';

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
    );
}

// Our own brand icons for known networks; anything else falls back to the icon URL from the settings.
const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    facebook: FooterFacebookIcon,
    instagram: FooterInstagramIcon,
    tiktok: FooterTikTokIcon,
    threads: FooterThreadsIcon,
    youtube: FooterYouTubeIcon,
    x: XIcon,
    twitter: XIcon,
};

export default function SocialLinks({ socials, iconClassName = 'h-6 w-6', className = 'flex items-center gap-4' }: {
    socials: SocialContact[];
    iconClassName?: string;
    className?: string;
}) {
    const links = socials.filter(s => s.value);
    if (links.length === 0) return null;

    return (
        <div className={className}>
            {links.map((s) => {
                const Icon = PLATFORM_ICONS[s.platform.toLowerCase()];
                if (!Icon && !s.icon) return null;
                return (
                    <a
                        key={`${s.platform}-${s.value}`}
                        href={s.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="text-black transition-opacity hover:opacity-70"
                    >
                        {Icon ? (
                            <Icon className={iconClassName} />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- icon URL from the dashboard
                            <img src={s.icon!} alt="" className={`${iconClassName} object-contain`} />
                        )}
                    </a>
                );
            })}
        </div>
    );
}
