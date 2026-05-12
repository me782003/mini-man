import StaticPageClient from '@/components/StaticPage/StaticPageClient';

export default async function StaticPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="my-28">
      <StaticPageClient slug={slug} />
    </main>
  );
}
