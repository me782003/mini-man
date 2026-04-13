'use client';

import { Link } from '@/i18n/navigation';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary from '@/components/OrderSummary';

interface OrderItem {
    id: number;
    image: string;
    category: string;
    title: string;
    price: number;
    color: string;
    size: number;
}

const ORDER_ITEMS: OrderItem[] = [
    {
        id: 1,
        image: '/images/image 9.png',
        category: "Men's Shoes",
        title: 'Nike Air Max Plus',
        price: 2590,
        color: '#9ea0a3',
        size: 41,
    },
    {
        id: 2,
        image: '/images/image 10.png',
        category: "Men's Shoes",
        title: 'Nike Air Max Plus',
        price: 2000,
        color: '#c4a882',
        size: 44,
    },
];

const SHIPPING_INFO = {
    name: 'Ahmed Al Saud',
    phone: '+20 15578 15 853',
    address: 'Cairo, Building 123',
    country: 'Egypt, 12345',
};

const PAYMENT_METHOD = 'Credit/Debit Card';

const SUBTOTAL = 2590;
const FIXED_DISCOUNT = 500;

export default function CheckoutClient() {
    const currentStep = 2;

    return (
        <div className="container py-8">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">Shopping Cart</Link>
                <span>/</span>
                <span className="font-semibold text-black">Checkout</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase text-black">
                Checkout
            </h1>

            {/* Progress stepper */}
            <CheckoutStepper currentStep={currentStep} />

            <div className="flex flex-col md:flex-row gap-5 md:gap-10 items-start">
                {/* Left: Summary sections */}
                <div className="flex-1 space-y-4 p-0 md:p-10 md:border border-[#E0E0E0] w-full">
                    {/* Shipping info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <h2 className="mb-4 font-beatrice text-[20px] font-bold text-black">
                            Shipping
                        </h2>
                        <div className="space-y-1">
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">{SHIPPING_INFO.name}</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">{SHIPPING_INFO.phone}</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">{SHIPPING_INFO.address}</p>
                            <p className="font-beatrice text-[14px] text-[#616161] font-medium">{SHIPPING_INFO.country}</p>
                        </div>
                    </div>

                    {/* Payment info box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <h2 className="mb-4 font-beatrice text-[20px] font-bold text-black">
                            Payment
                        </h2>
                        <p className="font-beatrice text-[14px] text-black">{PAYMENT_METHOD}</p>
                    </div>

                    {/* Products box */}
                    <div className="border border-[#E0E0E0] bg-[#F5F5F5] p-5">
                        <div className="flex flex-col gap-5  divide-gray-200">
                            {ORDER_ITEMS.map(item => (
                                <div key={item.id} className="flex gap-5 ">
                                    {/* Image */}
                                    <div className="h-[126px] w-[126px] md:h-[159px] md:w-[159px] shrink-0 bg-[#e8e8e8] flex items-center justify-center">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-contain border-[#D7D7D7]"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <p className="font-beatrice text-[12px] md:text-[14px] font-medium text-gray-500 mb-0.5">
                                            {item.category}
                                        </p>
                                        <h3 className="font-beatrice font-medium text-[14px] md:text-[20px] text-black mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="font-beatrice text-[14px] md:text-[20px] font-extrabold text-black mb-3">
                                            {item.price.toLocaleString()} EGP
                                        </p>
                                        <div className="flex flex-col items-start gap-1 md:gap-2 font-beatrice text-[12px] md:text-[13px] text-black">
                                            <span className="flex items-center gap-1.5">
                                                Color
                                                <span
                                                    className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </span>
                                            <div></div>
                                            <span>
                                                Size{' '}
                                                <span className="font-semibold">{item.size}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <OrderSummary subtotal={SUBTOTAL} discount={FIXED_DISCOUNT} >
                    <button className="  hidden md:flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
                        <span>Complete the request</span>
                        <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                            <path
                                d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </OrderSummary>

                <button className=" flex md:hidden w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
                    <span>Complete the request</span>
                    <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                        <path
                            d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
