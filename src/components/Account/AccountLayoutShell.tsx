'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AccountSidebar from '@/components/Account/AccountSidebar';

export default function AccountLayoutShell({ children }: { children: React.ReactNode }) {
    const t = useTranslations('Account');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="container relative">
            {/* Floating trigger — mobile/tablet only */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    // Takes the bottom spot on account pages; WhatsApp moves up above it (see WhatsAppButton).
                    className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-[1.03] hover:bg-neutral-800 lg:hidden"
                    aria-label={t('openMenu')}
                >
                    <Menu size={22} />
                </button>
            )}

            {/* Backdrop overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex lg:gap-8">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <AccountSidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>

                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}