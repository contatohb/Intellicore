import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';
import { withLocale } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'HB Agro Intel',
  description: 'Hub regulatório do agronegócio com automação, dashboards e integrações oficiais.'
};

export default async function AgroIntelPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'agro' });

  const hero = t.raw('hero') as { title: string; subtitle: string };
  const context = t.raw('context') as { title: string; paragraphs: string[] };
  const module = t.raw('module') as {
    title: string;
    subtitle: string;
    features: Array<{ title: string; description: string }>;
    notes: { public: string; corporate: string; remark: string };
  };
  const personas = t.raw('personas') as { title: string; items: string[] };
  const metrics = t.raw('metrics') as { title: string; items: string[] };
  const roadmap = t.raw('roadmap') as { title: string; phases: Array<{ label: string; description: string }>; note: string };
  const cta = t.raw('cta') as { title: string; cta: string; href: string };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <LayeredSection variant="brand">
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-semibold">{hero.title}</h1>
          <p className="text-white/80 md:text-lg">{hero.subtitle}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="sand">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-brand-navy">{context.title}</h2>
          {context.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-brand-charcoal/80">
              {paragraph}
            </p>
          ))}
        </div>
      </LayeredSection>

      <LayeredSection variant="slate">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-brand-navy">{module.title}</h2>
            <p className="text-brand-charcoal/80">{module.subtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {module.features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
                <h3 className="text-lg font-semibold text-brand-navy">{feature.title}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/80">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-3xl border border-brand-sand bg-white/80 p-4 text-xs text-brand-charcoal/80 shadow">
            <p>{module.notes.public}</p>
            <p>{module.notes.corporate}</p>
            <p className="text-brand-slate">{module.notes.remark}</p>
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="brand">
        <div className="space-y-4 text-white">
          <h2 className="text-2xl font-semibold">{personas.title}</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            {personas.items.map((item) => (
              <span key={item} className="rounded-full bg-white/20 px-4 py-1 shadow">
                {item}
              </span>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="sand">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-navy">{metrics.title}</h2>
          <ul className="space-y-2 text-sm text-brand-charcoal/80">
            {metrics.items.map((item) => (
              <li key={item} className="rounded-3xl border border-brand-sand bg-white/85 px-4 py-2 shadow">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </LayeredSection>

      <LayeredSection variant="slate">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-navy">{roadmap.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {roadmap.phases.map((phase) => (
              <div key={phase.label} className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
                <span className="font-semibold text-brand-navy">{phase.label}</span>
                <p className="mt-2 text-sm text-brand-charcoal/80">{phase.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-charcoal/70">{roadmap.note}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="brand">
        <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">{cta.title}</h2>
          </div>
          <Link
            href={withLocale(locale, cta.href)}
            className="inline-flex rounded-full bg-white px-6 py-2 text-sm font-semibold text-brand-navy shadow hover:bg-brand-sand"
          >
            {cta.cta}
          </Link>
        </div>
      </LayeredSection>
    </div>
  );
}
