import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/api/settings';
import BranchDetailClient from '@/components/Branches/BranchDetailClient';

type Params = Promise<{ locale: string; id: string }>;

// No per-branch endpoint — find it in the (cached) branches list from the settings.
async function findBranch(locale: string, id: string) {
    const settings = await getSettings(locale);
    return settings?.branches?.find((b) => String(b.id) === id) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, id } = await params;
    const branch = await findBranch(locale, id);
    return branch?.name ? { title: branch.name } : {};
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
