import Image from 'next/image';
import Link from 'next/link';

import { FooterBehanceIcon, FooterFacebookIcon, FooterInstagramIcon, FooterLinkedInIcon } from './icons';


export default function Footer() {
    return (
        <footer className="w-full bg-1">
            <div className="mx-auto flex items-start  container justify-between   py-16 ">
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

                <div className="flex flex-col items-start gap-4 md:items-start lg:items-start">
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
                            <FooterFacebookIcon className="h-5 w-5 fill-black text-black" />
                        </a>
                        <a href="#" aria-label="Instagram">
                            <FooterInstagramIcon className="h-5 w-5 text-black" />
                        </a>
                        <a href="#" aria-label="Behance">
                            <FooterBehanceIcon className="h-5 w-5 text-black" />
                        </a>
                        <a href="#" aria-label="LinkedIn">
                            <FooterLinkedInIcon className="h-5 w-5 fill-black text-black" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}