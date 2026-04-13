import Image from 'next/image';
import Link from 'next/link';

import { FooterFacebookIcon, FooterInstagramIcon, FooterTikTokIcon, FooterThreadsIcon, FooterYouTubeIcon } from './icons';


export default function Footer() {
    return (
        <footer className="w-full bg-1">

            {/* ── Mobile layout (hidden on lg+) ── */}
            <div className="lg:hidden container px-4 pt-10 pb-6 flex flex-col gap-8">

                {/* Follow Us */}
                <div className="flex flex-col items-center gap-4">
                    <p className="font-beatrice text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        Follow Us
                    </p>
                    <div className="flex items-center gap-5">
                        <a href="#" aria-label="Facebook">
                            <FooterFacebookIcon className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Instagram">
                            <FooterInstagramIcon className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="TikTok">
                            <FooterTikTokIcon className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Threads">
                            <FooterThreadsIcon className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="YouTube">
                            <FooterYouTubeIcon className="h-6 w-6" />
                        </a>
                    </div>
                </div>

                {/* Shop */}
                <div>
                    <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
                        Shop
                    </p>
                    <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
                        <Link href="/products">Men</Link>
                        <Link href="/products">Women</Link>
                        <Link href="/products">Kids</Link>
                        <Link href="/products">Accessories</Link>
                    </div>
                </div>

                {/* Help */}
                <div>
                    <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
                        Help
                    </p>
                    <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
                        <Link href="#">Shipping Policy</Link>
                        <Link href="#">Refuned and Exchange Policy</Link>
                        <Link href="/contact">Contact</Link>
                    </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center pt-2">
                    <div className="relative h-[80px] w-[180px]">
                        <Image src="/images/logo.svg" alt="Logo" fill className="object-contain" />
                    </div>
                </div>

                {/* Divider + copyright */}
                <div className="flex flex-col items-center gap-3 border-t border-gray-300 pt-4">
                    <p className="font-beatrice text-[14px] text-black">
                        © 2026 Miniman Rights Reserved.
                    </p>
                </div>
            </div>

            {/* ── Desktop layout (hidden below lg) ── */}
            <div className="mx-auto hidden lg:flex items-start container justify-between py-16">
                <div className="flex flex-col items-start gap-5 font-beatrice">
                    <Link href="/" className="text-[18px] font-normal uppercase text-black">
                        Home
                    </Link>
                    <Link href="/order" className="text-[18px] font-normal uppercase text-black">
                        Order Now
                    </Link>
                    <Link href="/branches" className="text-[18px] font-normal uppercase text-black">
                        Our Branches
                    </Link>
                    <Link href="/contact" className="text-[18px] font-normal uppercase text-black">
                        Contact Us
                    </Link>
                </div>

                <div className="flex items-center justify-center">
                    <div className="relative h-[120px] w-[260px] md:h-[140px] md:w-[300px]">
                        <Image
                            src="/images/logo.png"
                            alt="Miniman Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-start gap-4">
                    <a href="mailto:miniman@gmail.com" className="text-[18px] uppercase text-black">
                        miniman@gmail.com
                    </a>

                    <div className="flex flex-col gap-1 text-[18px] uppercase text-black">
                        <a href="tel:+2001000000000">+20 0100 000 0000</a>
                        <a href="tel:+2001000000000">+20 0100 000 0000</a>
                    </div>

                    <p className="pt-1 text-[18px] uppercase text-black">Cairo, Egypt</p>

                    <div className="flex items-center gap-4 pt-2">
                        <a href="#" aria-label="Facebook">
                            <FooterFacebookIcon className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="Instagram">
                            <FooterInstagramIcon className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="TikTok">
                            <FooterTikTokIcon className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="Threads">
                            <FooterThreadsIcon className="h-5 w-5" />
                        </a>
                        <a href="#" aria-label="YouTube">
                            <FooterYouTubeIcon className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}