'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useBranches } from '@/lib/hooks/useBranches';
import type { Branch } from '@/lib/hooks/useSettings';
import BranchCard, { useBranchName } from '@/components/Orders/BranchCard';
import BranchGallery from './BranchGallery';

export function branchPhotos(branch: Pick<Branch, 'main_image' | 'additional_images'>): string[] {
    return [branch.main_image, ...(branch.additional_images ?? [])].filter((src): src is string => !!src);
}

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200" aria-hidden>
            <div className="aspect-video w-full animate-pulse bg-gray-100" />
            <div className="space-y-2 p-5">
                <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
        </div>
    );
}

export default function BranchesClient() {
    const t = useTranslations('Branches');
    const ts = useTranslations('Site');
    const tc = useTranslations('Common');
    const nameOf = useBranchName();
    const { data, isLoading, isError, refetch } = useBranches();
    // Keep the API order: main branch first, then the dashboard order.
    const branches = data?.data ?? [];
    const [gallery, setGallery] = useState<Branch | null>(null);

    return (
        <div className="container px-4">
            <nav className="mb-2 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                <span>/</span>
                <span className="text-black">{ts('branches')}</span>
            </nav>

            <h1 className="mb-1 font-beatrice text-[28px] font-extrabold uppercase text-black sm:text-[34px]">
                {t('title')}
            </h1>
            <p className="mb-8 font-cairo text-[14px] text-gray-500">{ts('branchesSubtitle')}</p>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 font-cairo text-sm text-red-600">
                    <p>{ts('branchesLoadError')}</p>
                    <button onClick={() => refetch()} className="mt-2 font-semibold text-black underline underline-offset-2">
                        {tc('tryAgain')}
                    </button>
                </div>
            ) : branches.length === 0 ? (
                <p className="py-16 text-center font-cairo text-[15px] text-gray-500">{t('empty')}</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {branches.map(branch => (
                        <div key={branch.id} className="flex flex-col">
                            <BranchCard branch={branch} variant="full" onOpenPhotos={() => setGallery(branch)} />
                            <Link
                                href={`/branches/${branch.id}`}
                                className="mt-2 self-start font-beatrice text-[13px] font-semibold text-gray-500 underline underline-offset-2 hover:text-black"
                            >
                                {t('viewDetails')}
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {gallery && (
                <BranchGallery images={branchPhotos(gallery)} title={nameOf(gallery)} onClose={() => setGallery(null)} />
            )}
        </div>
    );
}
