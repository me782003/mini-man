import ProductDetail from '@/components/Products/ProductDetail';
import SwiperSection from '@/components/SwiperSection';

const PRODUCT = {
    title: 'Nike Air Max Plus',
    category: "Men's Shoes",
    price: '2,590 EGP',
    sizes: [41, 42, 43, 44, 45],
    description:
        'Step into bold street performance with this futuristic Nike Shox sneaker, designed to deliver standout style and responsive comfort. The upper features breathable mesh layered with molded TPU overlays that create a sleek, ribbed structure for support and durability. A vibrant neon Swoosh adds a striking contrast, giving the shoe a modern, energetic look perfect for everyday wear or active lifestyles.',
    colorVariants: [
        {
            color: '#2d3e40',
            images: ['/images/sh-1.png', '/images/sh-2.png', '/images/image 9.png', '/images/sh-1.png', '/images/sh-2.png', '/images/image 9.png', '/images/sh-1.png', '/images/sh-2.png', '/images/image 9.png',],
        },
        {
            color: '#c84c5e',
            images: ['/images/sh-2.png', '/images/sh-3.png', '/images/sh-1.png'],
        },
        {
            color: '#4dd9ac',
            images: ['/images/sh-3.png', '/images/image 9.png', '/images/sh-2.png'],
        },
    ],
};

const SIMILAR_PRODUCTS = [
    { image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#9ea0a3', '#c84c5e', '#56ad7b'] },
    { image: '/images/image 10.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#c4a882', '#000000', '#4dd9ac'] },
    { image: '/images/sh-1.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#1a1a2e', '#e63946'] },
    { image: '/images/sh-2.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#f5a623', '#e88080'] },
    { image: '/images/image 9.png', title: 'Nike Air Max Plus', category: "Men's Shoes", price: '2,590 EGP', colors: ['#9ea0a3', '#1a237e'] },
];

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    await params;

    return (
        <main className=' my-10'>
            <ProductDetail product={PRODUCT} />
            <SwiperSection
                primaryTitle="YOU MIGHT ALSO LIKE"
                secondaryTitle=""
                count={0}
                seeAllHref="/products"
                items={SIMILAR_PRODUCTS}
            />
        </main>
    );
}
