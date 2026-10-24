import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Header from '../../components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getSettings } from '@/lib/api/settings';
import { DEFAULT_SITE_NAME } from '@/lib/hooks/useSettings';
import { OG_LOCALE, SITE_URL } from '@/lib/seo';

// Site-wide defaults; pages override title / description / alternates / images.
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const settings = await getSettings(locale);
    const name = settings?.site_info?.name || DEFAULT_SITE_NAME;
    const description = settings?.site_info?.description || undefined;
    const ogImage = settings?.site_info?.header_logo || '/images/logo.png';

    return {
        metadataBase: new URL(SITE_URL),
        title: { template: `%s | ${name}`, default: name },
        description,
        applicationName: name,
        // No canonical here: pages inherit layout metadata, so each page sets its own (else all would point home).
        openGraph: {
            type: 'website',
            siteName: name,
            title: name,
            description,
            locale: OG_LOCALE[locale],
            alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
            images: [{ url: ogImage, alt: name }],
        },
        twitter: { card: 'summary_large_image', title: name, description, images: [ogImage] },
        robots: { index: true, follow: true },
    };
}

export default async function LocaleLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    // Same cached request as generateMetadata — Next dedupes it.
    const [messages, settings] = await Promise.all([getMessages(), getSettings(locale)]);

    // Organization data for search engines (logo, contacts, social profiles).
    const organization = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: settings?.site_info?.name || DEFAULT_SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        logo: `${SITE_URL}/icon.png`,
        email: settings?.contacts?.emails?.[0]?.value,
        telephone: settings?.contacts?.phone?.[0]?.value,
        sameAs: (settings?.contacts?.socials ?? []).map((s) => s.value).filter(Boolean),
    };

    return (
        <NextIntlClientProvider messages={messages}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} />
            <Providers locale={locale} settings={settings}>
                <Header />
                <div className="">
                    {children}
                </div>
                <Footer />
                <WhatsAppButton />
            </Providers>
        </NextIntlClientProvider>
    );
}
