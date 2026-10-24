import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/api/settings';
import { localizedAlternates } from '@/lib/seo';
import BranchDetailClient from '@/components/Branches/BranchDetailClient';
import { pageOpenGraph } from '@/lib/seo-server';

type Params = Promise<{ locale: string; id: string }>;

// No per-branch endpoint — find it in the (cached) branches list from the settings.
async function findBranch(locale: string, id: string) {
    const settings = await getSettings(locale);
    return settings?.branches?.find((b) => String(b.id) === id) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, id } = await params;
    const branch = await findBranch(locale, id);
    if (!branch) return {};
    const title = branch.name || `#${branch.id}`;
    const description = [branch.address, branch.phone].filter(Boolean).join(' · ') || undefined;
    return {
        title,
        description,
        alternates: localizedAlternates(locale, `/branches/${id}`),
        openGraph: await pageOpenGraph(locale, {
            title,
            description,
            url: `/${locale}/branches/${id}`,
            ...(branch.main_image ? { images: [{ url: branch.main_image, alt: title }] } : {}),
        }),
    };
}

export default async function BranchPage({ params }: { params: Params }) {
    const { locale, id } = await params;
    const branch = await findBranch(locale, id);
    if (!branch) notFound();
    return (
        <main className="my-7 md:my-10">
            <BranchDetailClient branch={branch} />
        </main>
    );
}
