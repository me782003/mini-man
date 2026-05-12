'use client';

import { useSettings } from '@/lib/hooks/useSettings';

export default function StaticPageClient({ slug }: { slug: string }) {
  const { data, isPending } = useSettings();
  const page = data?.data?.static_pages?.find((p) => p.slug === slug);

  if (isPending) {
    return (
      <div className="container space-y-4 px-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container px-4">
        <p className="font-cairo text-sm text-red-500">Page not found.</p>
      </div>
    );
  }

  return (
    <section className="container px-4">
      <h1 className="mb-8 font-headline text-[32px] font-bold uppercase tracking-tight text-black md:text-[42px]">
        {page.title}
      </h1>
      {page.content ? (
        <div
          className="prose prose-neutral max-w-none font-cairo"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="font-cairo text-neutral-500">No content available yet.</p>
      )}
    </section>
  );
}
