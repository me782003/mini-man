'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../i18n/navigation';
import { useCatalogCategories } from '@/lib/hooks/useCatalog';
import { useScrollFade } from '@/lib/hooks/useScrollFade';

export default function TopCategories() {
    // Wider fade here: the header row is the first thing people see.
    const [rowRef, rowFade] = useScrollFade<HTMLDivElement>(44);
    const { data, isPending } = useCatalogCategories();
    const categories = data?.data ?? [];
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

    const activeCategory = categories.find((c) => c.id === openCategoryId);
    const rootRef = useRef<HTMLDivElement>(null);

    // Tapping anywhere outside the row / dropdown (or pressing Escape) closes the dropdown.
    useEffect(() => {
        if (openCategoryId === null) return;
        const onPointer = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenCategoryId(null);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenCategoryId(null); };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [openCategoryId]);

    const handleToggle = (id: number) => {
        setOpenCategoryId((prev) => (prev === id ? null : id));
    };

    if (isPending) {
        return (
            <div className="w-full py-2.5 md:hidden">
                <div className="flex gap-8 px-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-2.5 md:hidden">
            <div ref={rootRef} className="relative mx-auto">
                {/* Native swipe row; edges fade where more categories are hidden. */}
                <div
                    ref={rowRef}
                    style={rowFade}
                    className="no-scrollbar overflow-x-auto overscroll-x-contain"
                >
                    {/* w-max + mx-auto: centred when everything fits, scrollable (not clipped) when it doesn't. */}
                    <div className="mx-auto flex w-max items-center gap-8 px-4 py-0.5">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleToggle(category.id)}
                                aria-expanded={openCategoryId === category.id}
                                className={[
                                    'shrink-0 whitespace-nowrap border-b-2 pb-0.5 text-[12px] font-beatrice font-medium leading-none text-black transition-opacity hover:opacity-70',
                                    openCategoryId === category.id ? 'border-black' : 'border-transparent',
                                ].join(' ')}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    className={`absolute left-0 top-[calc(100%+10px)] z-30 w-full bg-white shadow-lg transition-all duration-200 ${activeCategory
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0'
                        }`}
                >
                    <div className="flex flex-col py-2">
                        {activeCategory?.subCategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/products?sub_category_id=${sub.id}`}
                                className="px-4 py-3 text-start font-beatrice text-[12px] text-black transition-colors hover:bg-gray-50"
                                onClick={() => setOpenCategoryId(null)}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
