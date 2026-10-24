import type { MetadataRoute } from 'next';
import { LOCALES, PRIVATE_PATHS, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Personal pages (cart, account, checkout, auth) for both languages.
            disallow: LOCALES.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
