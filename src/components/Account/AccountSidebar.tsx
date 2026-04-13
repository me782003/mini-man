'use client';

import React from 'react';
import { Gift, LogOut, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import {
    AccountOrdersHistoryIcon,
    AccountSavedAddressesIcon,
    AccountUserIcon,
} from '@/components/icons';

export type ActiveTab = 'personal' | 'orders' | 'addresses' | 'rewards';

interface NavItem {
    key: ActiveTab;
    label: string;
    icon: React.ElementType;
    href?: string;
}

const NAV_ITEMS: NavItem[] = [
    { key: 'personal', label: 'Personal Information', icon: AccountUserIcon, href: '/account' },
    { key: 'orders', label: 'Order History', icon: AccountOrdersHistoryIcon, href: '/account/orders' },
    { key: 'addresses', label: 'Saved Addresses', icon: AccountSavedAddressesIcon, href: '/account/addresses' },
    { key: 'rewards', label: 'Rewards points', icon: Gift, href: '/account/rewards' },
];

interface AccountSidebarProps {
    activeTab?: ActiveTab;
    onTabChange?: (tab: ActiveTab) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AccountSidebar({ activeTab, onTabChange, isOpen = false, onClose }: AccountSidebarProps) {
    const pathname = usePathname();

    function isActive(item: NavItem): boolean {
        if (item.href) return pathname == (item.href);
        return activeTab === item.key;
    }

    const drawerTranslate = isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full';

    return (
        <aside className={`fixed top-0 z-50 h-screen w-[280px] overflow-y-auto bg-white ltr:left-0 rtl:right-0 transition-transform duration-300 ease-in-out ${drawerTranslate} lg:static lg:z-auto lg:h-auto lg:w-[336px] lg:!translate-x-0 lg:overflow-visible lg:shrink-0 border border-gray-200 p-4 md:p-10`}>
            {/* Close button — mobile/tablet only */}
            <button
                onClick={onClose}
                className="absolute top-4 ltr:right-4 rtl:left-4 p-1 text-gray-500 hover:text-black lg:hidden"
                aria-label="Close menu"
            >
                <X size={20} />
            </button>

            <h2 className="font-beatrice text-[22px] font-bold text-black">Account</h2>
            <p className="mt-5 font-beatrice text-[13px] leading-snug text-gray-400">
                Manage your editorial skincare journey
            </p>

            <nav className="space-y-[20px] mt-[40px]">
                {NAV_ITEMS.map((item) => {
                    const { key, label, icon: Icon, href } = item;
                    const active = isActive(item);
                    const itemClass = `flex w-full items-center gap-3 px-3 py-2.5 text-left font-beatrice text-[14px] transition-colors ${active
                        ? 'bg-gray-100 font-medium text-black'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                        }`;
                    const iconClass = active ? '!fill-black !text-black' : '!fill-gray-500 !text-gray-500';

                    if (href) {
                        return (
                            <Link key={key} href={href} className={itemClass} onClick={onClose}>
                                <Icon size={15} strokeWidth={1.8} className={iconClass} />
                                {label}
                            </Link>
                        );
                    }

                    return (
                        <button key={key} onClick={() => { onTabChange?.(key); onClose?.(); }} className={itemClass}>
                            <Icon size={15} strokeWidth={1.8} className={iconClass} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            <hr className="my-5 border-gray-200" />

            <button className="flex w-full items-center gap-3 px-3 py-2.5 font-beatrice text-[14px] font-medium text-red-500 transition-colors hover:text-red-600">
                <LogOut size={15} strokeWidth={1.8} />
                Log Out
            </button>
        </aside>
    );
}
