'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/ProductCard';

interface FavoriteItem {
    id: number;
    image: string;
    category: string;
    title: string;
    price: string;
    oldPrice?: string;
    colors: string[];
}

const INITIAL_FAVORITES: FavoriteItem[] = [
    { id: 1, image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#1a1a2e', '#8b2222', '#4dd9ac'] },
    { id: 2, image: '/images/sh-2.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', oldPrice: '3,200 EGP', colors: ['#f5a623', '#e88080', '#4dd9ac'] },
    { id: 3, image: '/images/image 9.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#9ea0a3', '#000000', '#1a237e'] },
    { id: 4, image: '/images/image 10.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#c4a882', '#9ea0a3'] },
];

export default function FavoritesClient() {
    const [items, setItems] = useState<FavoriteItem[]>(INITIAL_FAVORITES);

    const remove = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <span className="text-black">Favorites</span>
            </nav>

            {/* Heading */}
            <div className="mb-5 flex items-baseline gap-3 md:mb-8">
                <h1 className="font-beatrice text-[20px] font-bold uppercase text-black">Favorites</h1>
                {items.length > 0 && (
                    <span className="font-beatrice text-[14px] text-gray-400">
                        ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                    <Heart size={52} className="mb-5 text-gray-200" strokeWidth={1.5} />
                    <p className="mb-2 font-beatrice text-[18px] font-semibold text-black">
                        Your favorites list is empty
                    </p>
                    <p className="mb-8 font-beatrice text-[14px] text-gray-400">
                        Save items you love by tapping the heart icon.
                    </p>
                    <Link
                        href="/products"
                        className="bg-black px-10 py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
                    >
                        Explore Products
                    </Link>
                </div>
            ) : (
                <>
                    {/* Mobile: list layout */}
                    <div className=" space-y-[20px] md:hidden">
                        {items.map(item => (
                            <div key={item.id} className="flex items-start gap-4 ">
                                {/* Image */}
                                <div className="h-[120px] w-[120px] shrink-0 bg-[#e8e8e8] flex items-center justify-center">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                                        {item.colors.map((color, i) => (
                                            <span
                                                key={i}
                                                className="h-4 w-4 rounded-full border border-gray-200"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <p className="font-beatrice text-[12px] text-gray-500">{item.category}</p>
                                    <h3 className="font-beatrice text-[16px] font-semibold text-black leading-snug">
                                        {item.title}
                                    </h3>
                                    <div className="mt-1 flex flex-col ">
                                        <span className={`font-beatrice text-[15px] font-extrabold ${item.oldPrice ? 'text-[#FF0000]' : 'text-black'}`}>
                                            {item.price}
                                        </span>
                                        {item.oldPrice && (
                                            <span className="font-beatrice text-[13px] text-[#4f4f4f] line-through">
                                                {item.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Heart */}
                                <button
                                    onClick={() => remove(item.id)}
                                    aria-label="Remove from favorites"
                                    className="shrink-0 p-1 text-[#e63946] transition-transform hover:scale-110"
                                >
                                    <Heart size={22} fill="#e63946" strokeWidth={0} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: product card grid */}
                    <div className="hidden md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 xl:grid-cols-4">
                        {items.map(item => (
                            <div key={item.id} className="relative">
                                <ProductCard
                                    image={item.image}
                                    category={item.category}
                                    title={item.title}
                                    price={item.price}
                                    oldPrice={item.oldPrice}
                                    colors={item.colors}
                                />
                                <button
                                    onClick={() => remove(item.id)}
                                    aria-label="Remove from favorites"
                                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
                                >
                                    <Heart size={16} fill="#e63946" strokeWidth={0} />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
