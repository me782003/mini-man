'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Banknote, CreditCard, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary, { SecurePaymentBadge } from '@/components/OrderSummary';
import BranchCard from '@/components/Orders/BranchCard';
import { useCart } from '@/lib/hooks/useCart';
import { useBranches } from '@/lib/hooks/useBranches';
import { isPaymentMethod, isPaymobUnavailable, type PaymentMethod } from '@/lib/hooks/useOrders';
import { useAppliedCoupon } from '@/lib/hooks/useAppliedCoupon';

const METHOD_OPTIONS: { value: PaymentMethod; label: 'cod' | 'online' | 'branch'; hint: 'codHint' | 'onlineHint' | 'branchHint'; icon: React.ElementType }[] = [
    { value: 'cash_on_delivery', label: 'cod', hint: 'codHint', icon: Banknote },
    { value: 'paymob', label: 'online', hint: 'onlineHint', icon: CreditCard },
    { value: 'branch_pickup', label: 'branch', hint: 'branchHint', icon: Store },
];

export default function PaymentClient() {
    const t = useTranslations('Orders');
    const tc = useTranslations('Checkout');
    const c = useTranslations('Common');
    const router = useRouter();
    const searchParams = useSearchParams();
    const addressId = searchParams.get('address_id');
    const methodParam = searchParams.get('method');
    // sessionStorage flag set after a 503; read on the client only (false during SSR).
    const paymobDown = useSyncExternalStore(() => () => {}, isPaymobUnavailable, () => false);
    const requested: PaymentMethod = isPaymentMethod(methodParam) ? methodParam : 'cash_on_delivery';
    const paymentMethod: PaymentMethod = requested === 'paymob' && paymobDown ? 'cash_on_delivery' : requested;
    const branchParam = searchParams.get('branch_id');

    const { data: cartResponse, isLoading: cartLoading } = useCart();
    const items = cartResponse?.data.items ?? [];
    const summary = cartResponse?.data.summary;
    const subtotal = Number(summary?.subtotal ?? 0);

    const { data: branchesResponse, isLoading: branchesLoading } = useBranches();
    // Main branch first.
    const branches = [...(branchesResponse?.data ?? [])].sort((a, b) => b.is_main - a.is_main);
    const branchId = branchParam ? Number(branchParam) : branches[0]?.id ?? null;

    const { coupon, discount: discountAmount } = useAppliedCoupon(subtotal);

    useEffect(() => {
        if (!cartLoading && items.length === 0) {
            router.replace('/cart');
        }
    }, [cartLoading, items.length]);

    // Selections live in the URL so Back / refresh keep them.
    const withParams = (path: string, overrides: Record<string, string | null>) => {
        const qs = new URLSearchParams(searchParams.toString());
        Object.entries(overrides).forEach(([k, v]) => (v == null ? qs.delete(k) : qs.set(k, v)));
        const query = qs.toString();
        return query ? `${path}?${query}` : path;
    };

    const selectMethod = (method: PaymentMethod) => {
        router.replace(withParams('/payment', { method }), { scroll: false });
    };

    const selectBranch = (id: number) => {
        router.replace(withParams('/payment', { branch_id: String(id) }), { scroll: false });
    };

    const isPickup = paymentMethod === 'branch_pickup';
    const canContinue = isPickup ? branchId != null : true;

    // Delivery orders need an address: send customers who skipped the address step back to it.
    const continueHref = isPickup
        ? withParams('/checkout', { method: paymentMethod, branch_id: String(branchId), address_id: null })
        : addressId
            ? withParams('/checkout', { method: paymentMethod, branch_id: null })
            : withParams('/shipping', { method: null, branch_id: null });
    const backHref = withParams('/shipping', { method: null, branch_id: null, address_id: null });

    return (
        <div className="container ">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{c('home')}</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">{c('cart')}</Link>
                <span>/</span>
                <span className="font-semibold text-black">{tc('payment')}</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase text-black">
                {tc('payment')}
            </h1>

            {/* Progress stepper */}
            <CheckoutStepper currentStep={1} />

            <div className="flex flex-col md:flex-row gap-5 md:gap-10 " >
                <div className="flex-1 w-full border border-gray-200 p-5 md:p-10">
                    <h2 className="mb-6 font-beatrice text-[20px] font-bold text-black">
                        {t('paymentMethod')}
                    </h2>

                    {/* Payment method selection */}
                    <div role="radiogroup" aria-label={t('paymentMethod')} className="mb-8 space-y-3">
                        {METHOD_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
                            // No pickup without branches; no Paymob after it reported "unavailable".
                            if (value === 'branch_pickup' && !branchesLoading && branches.length === 0) return null;
                            const unavailable = value === 'paymob' && paymobDown;
                            const checked = paymentMethod === value && !unavailable;
                            return (
                                <label
                                    key={value}
                                    aria-disabled={unavailable}
                                    className={`flex items-center gap-4 border px-5 py-[10px] md:py-4 transition-colors ${unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked
                                        ? 'border-[#6aaa84] bg-[#f0f9f4]'
                                        : 'border-[#E0E0E0] bg-white'
                                        }`}
                                >
                                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-[#6aaa84]' : 'border-gray-300'}`}>
                                        {checked && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-[#6aaa84]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={value}
                                        checked={checked}
                                        disabled={unavailable}
                                        onChange={() => selectMethod(value)}
                                        className="sr-only"
                                    />
                                    <span className="flex items-center gap-3">
                                        <Icon size={22} strokeWidth={1.8} className="shrink-0" />
                                        <span>
                                            <span className="block font-beatrice text-[12px] md:text-[13px] font-bold text-black">{t(label)}</span>
                                            <span className="block font-beatrice text-[12px] md:text-[13px] text-gray-500">
                                                {unavailable ? t('onlineUnavailableShort') : t(hint)}
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Branch selector (pickup only — no address needed) */}
                    {isPickup && (
                        <div>
                            <h3 className="mb-4 font-beatrice text-[13px] md:text-[16px] font-bold text-black">
                                {t('chooseBranch')}
                            </h3>
                            {branchesLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                                </div>
                            ) : branches.length === 0 ? (
                                <p className="font-beatrice text-[14px] text-gray-500">{t('noBranches')}</p>
                            ) : (
                                <div role="radiogroup" aria-label={t('chooseBranch')} className="space-y-3">
                                    {branches.map(branch => (
                                        <BranchCard
                                            key={branch.id}
                                            branch={branch}
                                            badge={branch.is_main ? t('mainBranch') : undefined}
                                            selected={branchId === branch.id}
                                            onSelect={branches.length > 1 ? () => selectBranch(branch.id) : undefined}
                                        />
                                    ))}
                                </div>
                            )}
                            <p className="mt-4 border border-[#388E3C] bg-[#E8F5E9] px-4 py-3 font-beatrice text-[13px] font-medium text-[#388E3C]">
                                {t('payAtBranch')}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <Actions mobile={false} continueHref={continueHref} backHref={backHref} disabled={!canContinue} />
                </div>

                {/* Order Summary */}
                <OrderSummary
                    summary={cartResponse?.data?.summary}
                    isLoading={cartLoading}
                    couponCode={coupon?.code}
                    discountAmount={discountAmount || undefined}
                >
                    <SecurePaymentBadge />
                </OrderSummary>
            </div>
            <Actions mobile={true} continueHref={continueHref} backHref={backHref} disabled={!canContinue} />
        </div>
    );
}



const Actions = ({ mobile, continueHref, backHref, disabled }: { mobile?: boolean; continueHref: string; backHref: string; disabled?: boolean }) => {
    const tc = useTranslations('Checkout');
    const c = useTranslations('Common');
    return <div className={`mt-5 md:mt-6 flex gap-[10px] md:gap-4 ${mobile ? 'md:hidden' : 'hidden md:flex'}`}>
        <Link
            href={continueHref}
            aria-disabled={disabled}
            onClick={e => { if (disabled) e.preventDefault(); }}
            className={`flex w-full items-center justify-between bg-black px-[14px] md:px-5 py-[10px] md:py-3 font-beatrice text-[16px] md:text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
            <span>{tc('continueToDelivery')}</span>
            <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
                <path
                    d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </Link>
        <Link
            href={backHref}
            className="flex items-center justify-center border border-black px-4 md:px-8 py-[10px] md:py-3 font-beatrice text-[16px] font-semibold text-black transition-colors hover:bg-gray-100"
        >
            {c('back')}
        </Link>
    </div>

}
