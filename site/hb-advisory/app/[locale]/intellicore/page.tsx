import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';
import { withLocale } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'HB Intellicore',
  description: 'Ecossistema de dados, automação e inteligência que conecta ciência, legislação e estratégia.'
};

export default async function IntellicorePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'intellicore' });

  const hero = t.raw('hero') as { title: string; subtitle: string };
  const core = t.raw('core') as { title: string; description: string };
  const architecture = t.raw('architecture') as { title: string; layers: Array<{ title: string; description: string }> };
  const connections = t.raw('connections') as { title: string; items: string[]; note: string };
  const security = t.raw('security') as { title: string; principles: string[] };
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
          <h2 className="text-2xl font-semibold text-brand-navy">{core.title}</h2>
          <p className="text-brand-charcoal/80">{core.description}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="slate">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy">{architecture.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {architecture.layers.map((layer) => (
              <div key={layer.title} className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
                <h3 className="text-lg font-semibold text-brand-navy">{layer.title}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/80">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="brand">
        <div className="space-y-4 text-white">
          <h2 className="text-2xl font-semibold">{connections.title}</h2>
          <ul className="space-y-2 text-sm text-white/85">
            {connections.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <p className="text-xs text-white/70">{connections.note}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="sand">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-navy">{security.title}</h2>
          <ul className="space-y-2 text-sm text-brand-charcoal/80">
            {security.principles.map((principle) => (
              <li key={principle} className="rounded-3xl border border-brand-sand bg-white/85 px-4 py-2 shadow">
                {principle}
              </li>
            ))}
          </ul>
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
