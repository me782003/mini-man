'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { get } from '@/lib/fetcher';
import { Branch } from '@/lib/hooks/useSettings';

interface BranchesResponse {
    data: Branch[];
    message: string;
}

function useBranches() {
    return useQuery({
        queryKey: ['branches'],
        queryFn: () => get<BranchesResponse>('/user/pages/branches'),
        staleTime: 10 * 60 * 1000,
    });
}

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
    const [index, setIndex] = useState(startIndex);

    const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, prev, next]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            {/* Close */}
            <button
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-70"
                onClick={onClose}
                aria-label="Close"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            <span className="absolute left-4 top-4 font-beatrice text-[13px] text-white/60">
                {index + 1} / {images.length}
            </span>

            {/* Image */}
            <div
                className="relative mx-16 max-h-[85vh] w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative aspect-[4/3] w-full">
                    <Image
                        src={images[index]}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="90vw"
                    />
                </div>
            </div>

            {/* Prev */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-3 flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-70"
                        aria-label="Previous"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-3 flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-70"
                        aria-label="Next"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}

/* ── Image Strip ── */
function ImageStrip({ images, name }: { images: string[]; name: string }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (images.length === 0) return null;

    const PREVIEW_MAX = 4;
    const shown = images.slice(0, PREVIEW_MAX);
    const remaining = images.length - PREVIEW_MAX;

    return (
        <>
            <div className="flex gap-2">
                {shown.map((src, i) => {
                    const isLast = i === PREVIEW_MAX - 1 && remaining > 0;
                    return (
                        <button
                            key={i}
                            onClick={() => setLightboxIndex(i)}
                            className="group relative aspect-square w-20 shrink-0 overflow-hidden bg-gray-100 sm:w-24"
                            aria-label={`View image ${i + 1}`}
                        >
                            <Image
                                src={src}
                                alt={`${name} ${i + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="96px"
                            />
                            {isLast && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                    <span className="font-beatrice text-[15px] font-bold text-white">+{remaining}</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    images={images}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
}

/* ── Info row helper ── */
function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
            <span className="font-cairo text-[14px] leading-snug text-gray-700">{children}</span>
        </div>
    );
}

/* ── Branch Row ── */
function BranchRow({ branch, index }: { branch: Branch; index: number }) {
    const allImages = [
        ...(branch.main_image ? [branch.main_image] : []),
        ...branch.additional_images,
    ];

    return (
        <div className={`flex flex-col gap-6 py-8 md:flex-row md:gap-10 ${index > 0 ? 'border-t border-gray-100' : ''}`}>
            {/* Left: number + info */}
            <div className="flex flex-1 flex-col gap-4">
                <div className="flex items-center gap-3">
                    <span className="font-beatrice text-[38px] font-extrabold leading-none text-gray-100">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-beatrice text-[18px] font-bold text-black sm:text-[20px]">
                                {branch.name}
                            </h2>
                            {branch.is_main === 1 && (
                                <span className="bg-black px-2 py-0.5 font-beatrice text-[10px] font-bold uppercase tracking-widest text-white">
                                    Main
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pl-1">
                    <InfoRow icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                    }>
                        {branch.address}
                    </InfoRow>

                    <InfoRow icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.98 1.2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z" />
                        </svg>
                    }>
                        <a href={`tel:${branch.phone}`} className="hover:text-black hover:underline transition-colors">
                            {branch.phone}
                        </a>
                    </InfoRow>

                    {branch.email && (
                        <InfoRow icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                            </svg>
                        }>
                            <a href={`mailto:${branch.email}`} className="hover:text-black hover:underline transition-colors">
                                {branch.email}
                            </a>
                        </InfoRow>
                    )}
                </div>

                {branch.map_link && (
                    <a
                        href={branch.map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex w-fit items-center gap-2 bg-black px-5 py-2.5 font-beatrice text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-800"
                    >
                        View on Map
                        <svg width="14" height="10" viewBox="0 0 37 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                )}
            </div>

            {/* Right: image strip */}
            {allImages.length > 0 && (
                <div className="shrink-0">
                    <ImageStrip images={allImages} name={branch.name} />
                </div>
            )}
        </div>
    );
}

/* ── Skeleton ── */
function Skeleton() {
    return (
        <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className={`flex flex-col gap-4 py-8 md:flex-row md:gap-10 ${i > 1 ? 'border-t border-gray-100' : ''}`}>
                    <div className="flex flex-1 flex-col gap-3">
                        <div className="h-8 w-1/3 animate-pulse bg-gray-100" />
                        <div className="h-4 w-2/3 animate-pulse bg-gray-100" />
                        <div className="h-4 w-1/2 animate-pulse bg-gray-100" />
                        <div className="h-4 w-1/3 animate-pulse bg-gray-100" />
                        <div className="mt-2 h-9 w-32 animate-pulse bg-gray-100" />
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((j) => <div key={j} className="h-24 w-24 animate-pulse bg-gray-100" />)}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Main ── */
export default function BranchesClient() {
    const { data, isLoading, isError } = useBranches();
    const branches = data?.data ?? [];

    return (
        <div className="container px-4">
            <nav className="mb-2 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <span className="text-black">Branches</span>
            </nav>

            <h1 className="mb-1 font-beatrice text-[28px] font-extrabold uppercase text-black sm:text-[34px]">
                Our Branches
            </h1>
            <p className="mb-6 font-cairo text-[14px] text-gray-500">
                Find us at any of our locations below.
            </p>

            <div className="border-t border-gray-200">
                {isLoading && <Skeleton />}

                {isError && (
                    <p className="py-10 font-cairo text-sm text-red-600">
                        Failed to load branches. Please try again later.
                    </p>
                )}

                {!isLoading && !isError && branches.length === 0 && (
                    <p className="py-10 font-cairo text-sm text-gray-500">No branches found.</p>
                )}

                {!isLoading && branches.map((branch, i) => (
                    <BranchRow key={branch.id} branch={branch} index={i} />
                ))}
            </div>
        </div>
    );
}
