import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';

export const metadata: Metadata = {
  title: 'Projetos & Insights',
  description: 'Casos, estudos e publicações que conectam inteligência aplicada à estratégia.'
};

export default async function ProjectsInsightsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  const hero = t.raw('hero') as { title: string; subtitle: string };
  const highlights = t.raw('highlights') as { title: string; empty: string };
  const library = t.raw('library') as { title: string; filters: string[]; cta: string };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <LayeredSection variant="brand">
        <div className="space-y-3 text-white">
          <h1 className="text-3xl font-semibold">{hero.title}</h1>
          <p className="text-white/80 md:text-lg">{hero.subtitle}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="sand">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-brand-navy">{highlights.title}</h2>
          <p className="text-sm text-brand-charcoal/80">{highlights.empty}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="slate">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-navy">{library.title}</h2>
          <div className="flex flex-wrap gap-2 text-xs text-brand-slate">
            {library.filters.map((filter) => (
              <span key={filter} className="rounded-full bg-white/85 px-4 py-1 shadow">
                {filter}
              </span>
            ))}
          </div>
          <Link
            href="mailto:contato@hb-advisory.com.br"
            className="inline-flex w-fit rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-slate"
          >
            {library.cta}
          </Link>
        </div>
      </LayeredSection>
    </div>
  );
}
