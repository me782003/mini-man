import ContactClient from '@/components/Contact/ContactClient';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localizedAlternates } from '@/lib/seo';
import { pageOpenGraph } from '@/lib/seo-server';

export async function generateMetadata(): Promise<Metadata> {
    const [t, locale] = await Promise.all([getTranslations('Seo'), getLocale()]);
    return {
        title: t('contactTitle'),
        description: t('contactDescription'),
        alternates: localizedAlternates(locale, '/contact'),
        openGraph: await pageOpenGraph(locale, { title: t('contactTitle'), description: t('contactDescription'), url: `/${locale}/contact` }),
    };
}

export default function ContactPage() {
    return (
        <main className="my-7 md:my-10">
            <ContactClient />
        </main>
    );
}
