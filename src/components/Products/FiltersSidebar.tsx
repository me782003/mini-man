'use client';

import React, { useCallback, useId, useState } from 'react';
import { X } from 'lucide-react';

const SIZES = [41, 42, 43, 44, 45] as const;

const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#e63946' },
    { name: 'Blue', hex: '#1d3557' },
    { name: 'Gray', hex: '#9ea0a3' },
    { name: 'Yellow', hex: '#f5a623' },
    { name: 'Teal', hex: '#4dd9ac' },
] as const;

interface AccordionSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

interface FiltersSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

interface AvailabilityState {
    inStock: boolean;
    outOfStock: boolean;
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width={16}
            height={16}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );
}

function AccordionSection({
    title,
    children,
    defaultOpen = false,
}: AccordionSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = useId();

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <div className="border-t border-gray-200 py-4">
            <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-controls={contentId}
            >
                <span className="font-beatrice text-[16px] font-medium text-black">
                    {title}
                </span>

                <ChevronDownIcon
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div id={contentId} className="mt-3">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function FiltersSidebar({
    isOpen = false,
    onClose,
}: FiltersSidebarProps) {
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
    const [availability, setAvailability] = useState<AvailabilityState>({
        inStock: false,
        outOfStock: false,
    });
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState(10000);

    const toggleSize = useCallback((size: number) => {
        setSelectedSizes((prev) =>
            prev.includes(size)
                ? prev.filter((item) => item !== size)
                : [...prev, size]
        );
    }, []);

    const toggleColor = useCallback((hex: string) => {
        setSelectedColors((prev) =>
            prev.includes(hex)
                ? prev.filter((item) => item !== hex)
                : [...prev, hex]
        );
    }, []);

    const handleAvailabilityChange =
        useCallback(
            (key: keyof AvailabilityState) =>
                (event: React.ChangeEvent<HTMLInputElement>) => {
                    const { checked } = event.target;
                    setAvailability((prev) => ({
                        ...prev,
                        [key]: checked,
                    }));
                },
            []
        );

    const handlePriceChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setMaxPrice(Number(event.target.value));
        },
        []
    );

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`
          fixed top-0 z-50 h-full w-[300px] shrink-0 overflow-y-auto bg-white p-6
          ltr:left-0 rtl:right-0
          transition-transform duration-300
          md:static md:z-auto md:h-auto md:w-[265px] md:overflow-visible md:p-0 md:translate-x-0
          ${isOpen
                        ? 'translate-x-0'
                        : 'ltr:-translate-x-full rtl:translate-x-full md:!translate-x-0'
                    }
        `}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-beatrice text-[22px] font-bold uppercase tracking-widest text-black">
                        Filters
                    </h2>

                    <button
                        type="button"
                        className="p-1 text-gray-500 transition-colors hover:text-black md:hidden"
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="border-t border-gray-200 py-6">
                    <p className="mb-5 font-beatrice text-[16px] font-bold text-black">
                        Size
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {SIZES.map((size) => {
                            const isSelected = selectedSizes.includes(size);

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    aria-pressed={isSelected}
                                    className={`h-9 w-9 border text-[13px] font-beatrice font-medium transition-colors ${isSelected
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <AccordionSection title="Availability" defaultOpen>
                    <label className="mb-2.5 flex cursor-pointer items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={availability.inStock}
                            onChange={handleAvailabilityChange('inStock')}
                            className="h-4 w-4 cursor-pointer accent-black"
                        />
                        <span className="font-beatrice text-[14px] text-black">
                            Available{' '}
                            <span className="font-semibold text-red-500">(450)</span>
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={availability.outOfStock}
                            onChange={handleAvailabilityChange('outOfStock')}
                            className="h-4 w-4 cursor-pointer accent-black"
                        />
                        <span className="font-beatrice text-[14px] text-black">
                            Out Of Stack{' '}
                            <span className="font-semibold text-red-500">(19)</span>
                        </span>
                    </label>
                </AccordionSection>

                <AccordionSection title="Color">
                    <div className="flex flex-wrap gap-2.5">
                        {COLORS.map((color) => {
                            const isSelected = selectedColors.includes(color.hex);
                            const isWhite = color.hex === '#ffffff';

                            return (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => toggleColor(color.hex)}
                                    title={color.name}
                                    aria-label={`Select ${color.name}`}
                                    aria-pressed={isSelected}
                                    className={`h-6 w-6 rounded-full border-2 transition-all ${isSelected
                                            ? 'scale-110 border-black'
                                            : isWhite
                                                ? 'border-gray-300 hover:border-gray-500'
                                                : 'border-transparent hover:border-gray-400'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                />
                            );
                        })}
                    </div>
                </AccordionSection>

                <AccordionSection title="Shop by Price">
                    <input
                        type="range"
                        min={0}
                        max={10000}
                        step={100}
                        value={maxPrice}
                        onChange={handlePriceChange}
                        className="w-full accent-black"
                        aria-label="Maximum price"
                    />

                    <div className="mt-1 flex justify-between font-beatrice text-[13px] text-gray-500">
                        <span>0 EGP</span>
                        <span>{maxPrice.toLocaleString()} EGP</span>
                    </div>
                </AccordionSection>

                <button
                    type="button"
                    className="mt-5 w-full bg-black py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
                >
                    View Results
                </button>
            </aside>
        </>
    );
}