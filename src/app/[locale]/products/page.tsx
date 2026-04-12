import { Link } from '@/i18n/navigation';
import FiltersSidebar from '@/components/Products/FiltersSidebar';
import ProductsGrid from '@/components/Products/ProductsGrid';

export default function ProductsPage() {
    return (
        <main className="container mx-auto my-48 ">
            <div className="flex gap-12 items-start">
                <FiltersSidebar />

                <div className="flex-1 min-w-0">
                    {/* Breadcrumb */}
                    <nav className="mb-4 flex items-center gap-1.5 font-beatrice text-[14px] text-gray-500">
                        <Link href="/" className="hover:text-black transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-black">Products</span>
                    </nav>

                    {/* Heading */}
                    <h1 className="mb-6 font-beatrice text-[32px] font-bold uppercase tracking-widest text-black">
                        Products
                    </h1>

                    <ProductsGrid />
                </div>
            </div>
        </main>
    );
}
