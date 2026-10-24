import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import sanitizeHtml from 'sanitize-html';
import { getSettings } from '@/lib/api/settings';
import { Link } from '@/i18n/navigation';
import ScrollFadeRow from '@/components/ScrollFadeRow';

type Params = Promise<{ locale: string; slug: string }>;

// Pages come from the store settings — there's no per-page endpoint. Slugs are the same in both languages.
async function loadPages(locale: string) {
    const settings = await getSettings(locale);
    return settings?.static_pages ?? [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, slug } = await params;
    const page = (await loadPages(locale)).find((p) => p.slug === slug);
    return page?.title ? { title: page.title.trim() } : {};
}

// Content is written in the dashboard and may contain HTML — allow formatting, strip scripts/handlers.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height'],
        '*': ['dir', 'lang'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
    // Some pages are whole pasted HTML documents: drop <title>/<head> text, not just the tags.
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'title', 'head'],
    // …and the empty paragraphs/wrappers left around them.
    exclusiveFilter: (frame) =>
        ['p', 'div', 'span'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
};

const toText = (html: string) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();

/**
 * Pages usually start with their own <h1>. Use it as the page heading (it's often better cased than
 * the dashboard title) and remove it from the body so the heading doesn't appear twice.
 */
function splitHeading(html: string): { heading: string | null; body: string } {
    const match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    if (!match) return { heading: null, body: html };
    return { heading: toText(match[1]) || null, body: html.replace(match[0], '') };
}

/** Gives every section heading an anchor id and returns them for the table of contents. */
function addSectionAnchors(html: string): { body: string; sections: { id: string; title: string }[] } {
    const sections: { id: string; title: string }[] = [];
    const body = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attrs: string, inner: string) => {
        const id = `section-${sections.length + 1}`;
        sections.push({ id, title: toText(inner) });
        return `<h2${attrs} id="${id}">${inner}</h2>`;
    });
    return { body, sections };
}

const PROSE = [
    'font-cairo text-[15px] leading-[1.9] text-neutral-700 md:text-[16px]',
    '[&_p]:mb-4',
    '[&_h1]:mb-3 [&_h1]:mt-10 [&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:text-black',
    // Sections: a divider above each one, and room for the fixed header when jumping to it.
    '[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-gray-200 [&_h2]:pt-8 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-black md:[&_h2]:text-[22px]',
    '[&_h2]:scroll-mt-[calc(var(--header-h,7rem)+1.5rem)] [&>h2:first-child]:mt-0 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0',
    '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-black',
    '[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6 [&_li]:ps-1 [&_li::marker]:text-gray-400',
    '[&_strong]:font-bold [&_strong]:text-black',
    '[&_a]:font-medium [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2',
    '[&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-xl',
].join(' ');

export default async function StaticPageRoute({ params }: { params: Params }) {
    const { locale, slug } = await params;
    const pages = await loadPages(locale);
    const page = pages.find((p) => p.slug === slug);
    if (!page) notFound();

    const t = await getTranslations('Site');
    const tc = await getTranslations('Common');
    const clean = page.content ? sanitizeHtml(page.content, SANITIZE_OPTIONS) : '';
    const { heading, body: withoutHeading } = splitHeading(clean);
    const { body, sections } = addSectionAnchors(withoutHeading.trim());
    const title = heading || page.title?.trim() || slug;
    const navPages = pages.filter((p) => p.title?.trim());

    return (
        <main className="my-7 md:my-10">
            <div className="container px-4">
                <nav className="mb-4 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                    <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                    <span>/</span>
                    <span className="text-black">{title}</span>
                </nav>

                {/* Mobile: all pages as scrollable tabs */}
                {navPages.length > 1 && (
                    <ScrollFadeRow aria-label={t('pagesNav')} className="-mx-4 mb-6 flex gap-2 px-4 lg:hidden">
                        {navPages.map((p) => (
                            <Link
                                key={p.id}
                                href={`/pages/${p.slug}`}
                                aria-current={p.slug === slug ? 'page' : undefined}
                                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-beatrice text-[13px] font-medium first-letter:uppercase ${p.slug === slug ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700'}`}
                            >
                                {p.title!.trim()}
                            </Link>
                        ))}
                    </ScrollFadeRow>
                )}

                <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
                    {/* Desktop: pages menu + table of contents */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-[calc(var(--header-h,7rem)+1.5rem)] space-y-8">
                            {navPages.length > 1 && (
                                <nav aria-label={t('pagesNav')}>
                                    <p className="mb-3 font-beatrice text-[12px] font-bold uppercase tracking-wider text-gray-400">{t('pagesNav')}</p>
                                    <ul className="space-y-1 border-s border-gray-200">
                                        {navPages.map((p) => {
                                            const current = p.slug === slug;
                                            return (
                                                <li key={p.id}>
                                                    <Link
                                                        href={`/pages/${p.slug}`}
                                                        aria-current={current ? 'page' : undefined}
                                                        className={`-ms-px block border-s-2 py-1.5 ps-4 font-beatrice text-[14px] transition-colors first-letter:uppercase ${current ? 'border-black font-semibold text-black' : 'border-transparent text-gray-500 hover:border-gray-400 hover:text-black'}`}
                                                    >
                                                        {p.title!.trim()}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            )}
                            {sections.length > 1 && <TableOfContents sections={sections} label={t('onThisPage')} />}
                        </div>
                    </aside>

                    <article className="min-w-0 max-w-[760px]">
                        <h1 className="mb-6 font-headline text-[30px] font-bold leading-tight tracking-tight text-black md:text-[40px]">
                            {title}
                        </h1>

                        {/* Mobile: collapsible table of contents */}
                        {sections.length > 1 && (
                            <details className="mb-8 rounded-xl border border-gray-200 lg:hidden">
                                <summary className="cursor-pointer select-none px-4 py-3 font-beatrice text-[14px] font-semibold text-black">
                                    {t('onThisPage')}
                                </summary>
                                <div className="border-t border-gray-200 px-4 py-3">
                                    <TableOfContents sections={sections} />
                                </div>
                            </details>
                        )}

                        {body ? (
                            <div className={PROSE} dangerouslySetInnerHTML={{ __html: body }} />
                        ) : (
                            <p className="font-cairo text-neutral-500">{t('noContent')}</p>
                        )}
                    </article>
                </div>
            </div>
        </main>
    );
}

function TableOfContents({ sections, label }: { sections: { id: string; title: string }[]; label?: string }) {
    return (
        <nav aria-label={label}>
            {label && <p className="mb-3 font-beatrice text-[12px] font-bold uppercase tracking-wider text-gray-400">{label}</p>}
            <ol className="space-y-2 font-beatrice text-[13px] text-gray-600">
                {sections.map((s) => (
                    <li key={s.id}>
                        <a href={`#${s.id}`} className="block leading-snug transition-colors hover:text-black">{s.title}</a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
