import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CompletePhoneClient from '@/components/Auth/CompletePhoneClient';
import { notFound } from 'next/navigation';
import { privatePage } from '@/lib/seo';
import { COMPLETE_PHONE_PAGE_ENABLED } from '@/lib/auth-session';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Auth');
    return privatePage(t('completePhoneTitle'));
}

export default function CompletePhonePage() {
    // Temporarily hidden (see COMPLETE_PHONE_PAGE_ENABLED).
    if (!COMPLETE_PHONE_PAGE_ENABLED) notFound();
    return (
        <main>
            <Suspense>
                <CompletePhoneClient />
            </Suspense>
        </main>
    );
}
