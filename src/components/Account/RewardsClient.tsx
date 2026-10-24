'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { intlLocale } from '@/lib/intl';

type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

interface PointsEntry {
    id: string;
    orderId: string;
    status: OrderStatus;
    date: string;
    total: string;
    points: number;
}

const POINTS_HISTORY: PointsEntry[] = [
    { id: '1', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
    { id: '2', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
    { id: '3', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    Pending: 'bg-orange-400 text-white',
    Shipped: 'bg-green-500 text-white',
    Delivered: 'bg-green-500 text-white',
};

const TOTAL_POINTS = 2450;

export default function RewardsClient() {
    const t = useTranslations('Account');
    const tc = useTranslations('Common');
    const locale = useLocale();
    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">
                    {tc('home')}
                </Link>
                <span>/</span>
                <span className="font-semibold text-black">{tc('account')}</span>
            </nav>

            <p className="font-beatrice font-bold text-[20px] uppercase text-black">
                {tc('account')}
            </p>

            <h1 className="mt-8 font-beatrice text-[30px] font-bold leading-tight text-black sm:mt-10 sm:text-[42px]">
                {t('rewardsTitle')}
            </h1>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                {t('rewardsHint')}
            </p>

            {/* Balance */}
            <div className="mb-6 text-center">
                <p className="font-beatrice text-[34px] font-bold leading-none text-black sm:text-[44px] lg:text-[56px]">
                    {t('pointsCount', { points: TOTAL_POINTS.toLocaleString(intlLocale(locale)) })}
                </p>
                <p className="mt-2 font-beatrice text-[14px] text-gray-500 sm:text-[15px]">
                    {t('yourBalance')}
                </p>
            </div>

            {/* Points History card */}
            <div className="border border-gray-200 p-4 sm:p-6 lg:p-8">
                <h2 className="mb-5 font-beatrice text-[18px] font-semibold text-black sm:text-[20px]">
                    {t('pointsHistory')}
                </h2>

                <div className="divide-y divide-gray-200">
                    {POINTS_HISTORY.map(entry => (
                        <div
                            key={entry.id}
                            className="flex flex-col gap-3 py-4 sm:py-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="font-beatrice text-[15px] font-semibold text-black sm:text-[16px]">
                                        {t('orderNumber', { id: entry.orderId })}
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-0.5 font-beatrice text-[12px] font-medium ${STATUS_STYLES[entry.status]}`}
                                    >
                                        {t.has(`status_${entry.status.toLowerCase()}`) ? t(`status_${entry.status.toLowerCase()}`) : entry.status}
                                    </span>
                                </div>

                                <p className="mt-1 font-beatrice text-[13px] leading-relaxed text-gray-500">
                                    <span className="block sm:inline">
                                        {t('placedOn', { date: entry.date })}
                                    </span>
                                    <span className="hidden sm:inline"> | </span>
                                    <span className="block sm:inline">
                                        {t('totalLabel', { total: entry.total })}
                                    </span>
                                </p>
                            </div>

                            <span className="font-beatrice text-[15px] font-semibold text-green-500 lg:text-end">
                                {t('pointsEarned', { points: entry.points })}
                            </span>
                        </div>
                    ))}
                </div>

                <hr className="mb-6 mt-2 border-gray-200" />

                {/* Footer */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                    <p className="max-w-[400px] font-beatrice text-[13px] leading-relaxed text-gray-500">
                        {t('rewardsTerms')}
                    </p>

                    <button className="flex w-full items-center justify-between gap-6 bg-black px-5 py-3.5 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 sm:px-7 sm:text-[16px] md:w-auto md:shrink-0">
                        <span>{t('saveChanges')}</span>
                        <svg width="28" height="11" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
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
        </>
    );
}