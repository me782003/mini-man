import BranchesClient from '@/components/Branches/BranchesClient';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localizedAlternates } from '@/lib/seo';
import { pageOpenGraph } from '@/lib/seo-server';

export async function generateMetadata(): Promise<Metadata> {
    const [t, locale] = await Promise.all([getTranslations('Seo'), getLocale()]);
    return {
        title: t('branchesTitle'),
        description: t('branchesDescription'),
        alternates: localizedAlternates(locale, '/branches'),
        openGraph: await pageOpenGraph(locale, { title: t('branchesTitle'), description: t('branchesDescription'), url: `/${locale}/branches` }),
    };
}

export default function BranchesPage() {
    return (
        <main className="my-7 md:my-10">
            <BranchesClient />
        </main>
    );
}
