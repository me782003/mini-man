'use client';

import React, { useState } from 'react';

const SIZES = [41, 42, 43, 44, 45];

const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#e63946' },
    { name: 'Blue', hex: '#1d3557' },
    { name: 'Gray', hex: '#9ea0a3' },
    { name: 'Yellow', hex: '#f5a623' },
    { name: 'Teal', hex: '#4dd9ac' },
];

interface AccordionSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={16} height={16}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-gray-200 py-4">
            <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-beatrice text-[16px] font-medium text-black">{title}</span>
                <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-3">{children}</div>}
        </div>
    );
}

export default function FiltersSidebar() {
    const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
    const [availability, setAvailability] = useState({ inStock: false, outOfStock: false });
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState(10000);

    const toggleSize = (size: number) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const toggleColor = (hex: string) => {
        setSelectedColors(prev =>
            prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
        );
    };

    return (
        <aside className="w-[265px] shrink-0">
            <h2 className="font-beatrice text-[22px] font-bold uppercase tracking-widest text-black mb-5">
                Filters
            </h2>

            {/* Size */}
            <div className="border-t border-gray-200 py-6">
                <p className="font-beatrice text-[16px] font-bold text-black mb-5">Size</p>
                <div className="flex flex-wrap gap-2">
                    {SIZES.map(size => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`h-9 w-9 border text-[13px] font-beatrice font-medium transition-colors ${selectedSizes.includes(size)
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 bg-white text-black hover:border-black'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <AccordionSection title="Availability" defaultOpen={true}>
                <label className="flex items-center gap-2.5 mb-2.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={availability.inStock}
                        onChange={e => setAvailability(prev => ({ ...prev, inStock: e.target.checked }))}
                        className="h-4 w-4 cursor-pointer accent-black"
                    />
                    <span className="font-beatrice text-[14px] text-black">
                        Available{' '}
                        <span className="text-red-500 font-semibold">(450)</span>
                    </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={availability.outOfStock}
                        onChange={e => setAvailability(prev => ({ ...prev, outOfStock: e.target.checked }))}
                        className="h-4 w-4 cursor-pointer accent-black"
                    />
                    <span className="font-beatrice text-[14px] text-black">
                        Out Of Stack{' '}
                        <span className="text-red-500 font-semibold">(19)</span>
                    </span>
                </label>
            </AccordionSection>

            {/* Color */}
            <AccordionSection title="Color">
                <div className="flex flex-wrap gap-2.5">
                    {COLORS.map(color => (
                        <button
                            key={color.hex}
                            onClick={() => toggleColor(color.hex)}
                            title={color.name}
                            className={`h-6 w-6 rounded-full border-2 transition-all ${selectedColors.includes(color.hex)
                                ? 'scale-110 border-black'
                                : color.hex === '#ffffff'
                                    ? 'border-gray-300 hover:border-gray-500'
                                    : 'border-transparent hover:border-gray-400'
                                }`}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </AccordionSection>

            {/* Shop by Price */}
            <AccordionSection title="Shop by Price">
                <input
                    type="range"
                    min={0}
                    max={10000}
                    step={100}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-black"
                />
                <div className="mt-1 flex justify-between font-beatrice text-[13px] text-gray-500">
                    <span>0 EGP</span>
                    <span>{maxPrice.toLocaleString()} EGP</span>
                </div>
            </AccordionSection>

            <button className="mt-5 w-full bg-black py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800">
                View Results
            </button>
        </aside>
    );
}
