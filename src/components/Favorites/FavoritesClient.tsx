'use client';

import { Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ProductCard from '@/components/ProductCard';
import { useWishlist, useRemoveFromWishlist } from '@/lib/hooks/useWishlist';

export default function FavoritesClient() {
    const { data: response, isLoading } = useWishlist();
    const removeFromWishlist = useRemoveFromWishlist();

    const items = response?.data || [];

    const handleRemove = (productId: number | null) => {
        if (productId != null) {
            removeFromWishlist.mutate(productId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                <p className="mt-4 font-beatrice text-[14px] text-gray-500">Loading your favorites...</p>
            </div>
        );
    }

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
                            <Link href={`/products/${item.id}`} key={item.id} className="flex items-start gap-4 ">
                                {/* Image */}
                                <div className="h-[120px] w-[120px] shrink-0 bg-[#e8e8e8] flex items-center justify-center">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
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
                                                style={{ backgroundColor: color.hexa }}
                                            />
                                        ))}
                                    </div>
                                    <p className="font-beatrice text-[12px] text-gray-500">
                                        {item.category_collection.category.name}
                                    </p>
                                    <h3 className="font-beatrice text-[16px] font-semibold text-black leading-snug">
                                        {item.name}
                                    </h3>
                                    <div className="mt-1 flex flex-col ">
                                        <span className="font-beatrice text-[15px] font-extrabold text-black">
                                            {Number(item.price).toLocaleString()} EGP
                                        </span>
                                    </div>
                                </div>

                                {/* Heart */}
                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        handleRemove(item.id)
                                    }}
                                    disabled={removeFromWishlist.isPending}
                                    aria-label="Remove from favorites"
                                    className="shrink-0 p-1 text-[#e63946] transition-transform hover:scale-110 disabled:opacity-50"
                                >
                                    <Heart size={22} fill="#e63946" strokeWidth={0} />
                                </button>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: product card grid */}
                    <div className="hidden md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 xl:grid-cols-4">
                        {items.map(item => (
                            <div key={item.id} className="relative">
                                <ProductCard
                                    id={item.id}
                                    image={item.image_url}
                                    category={item.category_collection.category.name}
                                    title={item.name}
                                    price={`${Number(item.price).toLocaleString()} EGP`}
                                    colors={item.colors.map(c => c.hexa)}
                                />
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    disabled={removeFromWishlist.isPending}
                                    aria-label="Remove from favorites"
                                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 disabled:opacity-50"
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
