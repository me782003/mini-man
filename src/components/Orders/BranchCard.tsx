'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Images, Mail, MapPin, Navigation, Phone, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** The full branch from /pages/branches, or the smaller `pickup_branch` copy saved on orders. */
export interface BranchLike {
    id?: number;
    name: string | null;
    address: string | null;
    phone?: string | null;
    email?: string | null;
    map_link: string | null;
    main_image?: string | null;
    is_main?: number;
    additional_images?: string[];
}

interface BranchCardProps {
    branch: BranchLike;
    /** full: branches page · selectable: checkout picker (radio) · compact: order / tracking / success pages. */
    variant?: 'full' | 'selectable' | 'compact';
    selected?: boolean;
    onSelect?: () => void;
    /** full variant: opens the photo gallery. */
    onOpenPhotos?: () => void;
    /** Overrides the "Main branch" badge text (e.g. checkout wording). */
    badge?: string;
}

/** Name in the current language, or "Branch #id" when the translation is missing. */
export function useBranchName() {
    const t = useTranslations('Branches');
    return (branch: Pick<BranchLike, 'id' | 'name'>) =>
        branch.name || (branch.id != null ? t('branchFallback', { id: branch.id }) : t('branch'));
}

const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;

export default function BranchCard({ branch, variant, selected = false, onSelect, onOpenPhotos, badge }: BranchCardProps) {
    const t = useTranslations('Branches');
    const nameOf = useBranchName();
    const mode = variant ?? (onSelect ? 'selectable' : 'compact');
    const name = nameOf(branch);
    const mainBadge = badge ?? (branch.is_main === 1 ? t('mainBranch') : undefined);
    const photoCount = (branch.main_image ? 1 : 0) + (branch.additional_images?.length ?? 0);

    const details = (
        <>
            {branch.address && (
                <p className="mt-1 flex items-start gap-1.5 font-beatrice text-[13px] text-gray-600">
                    <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
                    <span>{branch.address}</span>
                </p>
            )}
            {branch.phone && (
                <a
                    href={telHref(branch.phone)}
                    onClick={e => e.stopPropagation()}
                    className="mt-1 inline-flex items-center gap-1.5 font-beatrice text-[13px] text-gray-600 hover:text-black"
                >
                    <Phone size={14} className="shrink-0" aria-hidden />
                    <span dir="ltr">{branch.phone}</span>
                </a>
            )}
        </>
    );

    if (mode === 'full') {
        return (
            <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="relative aspect-video w-full bg-gray-100">
                    <BranchImage src={branch.main_image} alt={name} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                    {mainBadge && (
                        <span className="absolute start-3 top-3 rounded-full bg-black px-3 py-1 font-beatrice text-[11px] font-semibold text-white">
                            {mainBadge}
                        </span>
                    )}
                    {photoCount > 1 && onOpenPhotos && (
                        <button
                            type="button"
                            onClick={onOpenPhotos}
                            className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-beatrice text-[12px] font-semibold text-black shadow hover:bg-white"
                        >
                            <Images size={14} aria-hidden />
                            {t('photos', { n: photoCount })}
                        </button>
                    )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-beatrice text-[18px] font-bold text-black">{name}</h3>
                    {details}
                    {branch.email && (
                        <a href={`mailto:${branch.email}`} className="mt-1 inline-flex items-center gap-1.5 font-beatrice text-[13px] text-gray-600 hover:text-black">
                            <Mail size={14} className="shrink-0" aria-hidden />
                            <span dir="ltr">{branch.email}</span>
                        </a>
                    )}
                    <BranchActions branch={branch} className="mt-auto pt-5" />
                </div>
            </article>
        );
    }

    if (mode === 'selectable') {
        return (
            <div
                onClick={onSelect}
                onKeyDown={e => { if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${selected ? 'border-[#6aaa84] bg-[#f0f9f4]' : 'border-[#E0E0E0] bg-white hover:border-gray-400'}`}
            >
                <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-[#6aaa84]' : 'border-gray-300'}`}>
                    {selected && <div className="h-2.5 w-2.5 rounded-full bg-[#6aaa84]" />}
                </div>
                {branch.main_image !== undefined && (
                    <div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:block">
                        <BranchImage src={branch.main_image} alt="" sizes="80px" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-beatrice text-[14px] font-bold text-black">{name}</p>
                        {mainBadge && (
                            <span className="rounded bg-black px-2 py-0.5 font-beatrice text-[10px] text-white">{mainBadge}</span>
                        )}
                    </div>
                    {details}
                    {branch.map_link && (
                        <a
                            href={branch.map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="mt-2 inline-flex items-center gap-1 font-beatrice text-[13px] font-semibold text-black underline underline-offset-2"
                        >
                            <Navigation size={13} aria-hidden /> {t('getDirections')}
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // compact
    return (
        <div className="rounded-lg border border-[#E0E0E0] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
                <Store size={16} className="shrink-0 text-gray-500" aria-hidden />
                <p className="font-beatrice text-[14px] font-bold text-black">{name}</p>
                {mainBadge && (
                    <span className="rounded bg-black px-2 py-0.5 font-beatrice text-[10px] text-white">{mainBadge}</span>
                )}
            </div>
            {details}
            <BranchActions branch={branch} className="mt-3" small />
        </div>
    );
}

/** "Get directions" + "Call" — each hidden when its field is missing. */
export function BranchActions({ branch, className = '', small = false }: { branch: Pick<BranchLike, 'map_link' | 'phone'>; className?: string; small?: boolean }) {
    const t = useTranslations('Branches');
    if (!branch.map_link && !branch.phone) return null;
    const size = small ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2.5 text-[13px]';
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {branch.map_link && (
                <a
                    href={branch.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 rounded-md bg-black font-beatrice font-semibold text-white hover:bg-neutral-800 ${size}`}
                >
                    <Navigation size={14} aria-hidden /> {t('getDirections')}
                </a>
            )}
            {branch.phone && (
                <a
                    href={telHref(branch.phone)}
                    onClick={e => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 rounded-md border border-gray-300 font-beatrice font-semibold text-black hover:border-black ${size}`}
                >
                    <Phone size={14} aria-hidden /> {t('call')}
                </a>
            )}
        </div>
    );
}

/** Branch photo with a store-icon placeholder when missing or broken. */
function BranchImage({ src, alt, sizes }: { src?: string | null; alt: string; sizes: string }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <div className="flex h-full w-full items-center justify-center text-gray-300" aria-hidden>
                <Store size={40} strokeWidth={1.5} />
            </div>
        );
    }
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />;
}
