'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Branch } from '@/lib/hooks/useSettings';
import { BranchActions, useBranchName } from '@/components/Orders/BranchCard';
import BranchGallery from './BranchGallery';
import { branchPhotos } from './BranchesClient';

export default function BranchDetailClient({ branch }: { branch: Branch }) {
    const t = useTranslations('Branches');
    const tc = useTranslations('Common');
    const name = useBranchName()(branch);
    const photos = branchPhotos(branch);
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    // The data has no coordinates: only embed when the dashboard gave a Google Maps *embed* URL.
    const embedUrl = branch.map_link?.includes('/maps/embed') ? branch.map_link : null;

    return (
        <div className="container max-w-[1000px] px-4">
            <nav className="mb-2 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="hover:text-black">{tc('home')}</Link>
                <span>/</span>
                <Link href="/branches" className="hover:text-black">{t('title')}</Link>
                <span>/</span>
                <span className="text-black">{name}</span>
            </nav>

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <h1 className="font-beatrice text-[28px] font-extrabold text-black sm:text-[34px]">{name}</h1>
                {branch.is_main === 1 && (
                    <span className="rounded-full bg-black px-3 py-1 font-beatrice text-[12px] font-semibold text-white">{t('mainBranch')}</span>
                )}
            </div>

            {photos.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {photos.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            onClick={() => setGalleryIndex(i)}
                            className={`relative overflow-hidden rounded-lg bg-gray-100 ${i === 0 ? 'col-span-2 row-span-2 aspect-video sm:aspect-auto' : 'aspect-square'}`}
                            aria-label={t('openPhoto', { n: i + 1 })}
                        >
                            <Image src={src} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform hover:scale-105" />
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-2 font-beatrice text-[15px] text-gray-700">
                {branch.address && (
                    <p className="flex items-start gap-2"><MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />{branch.address}</p>
                )}
                {branch.phone && (
                    <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-black">
                        <Phone size={18} className="shrink-0" aria-hidden /><span dir="ltr">{branch.phone}</span>
                    </a>
                )}
                {branch.email && (
                    <a href={`mailto:${branch.email}`} className="flex items-center gap-2 hover:text-black">
                        <Mail size={18} className="shrink-0" aria-hidden /><span dir="ltr">{branch.email}</span>
                    </a>
                )}
            </div>

            <BranchActions branch={branch} className="mt-5" />

            {embedUrl && (
                <iframe
                    src={embedUrl}
                    title={t('mapOf', { name })}
                    className="mt-8 h-[360px] w-full rounded-xl border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                />
            )}

            {galleryIndex !== null && (
                <BranchGallery images={photos} startIndex={galleryIndex} title={name} onClose={() => setGalleryIndex(null)} />
            )}
        </div>
    );
}
