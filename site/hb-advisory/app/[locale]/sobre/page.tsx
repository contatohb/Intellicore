import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';
import { withLocale } from '@/lib/paths';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'about' });

  const manifest = t.raw('manifest') as { title: string; paragraphs: string[] };
  const founder = t.raw('founder') as { title: string; highlights: string[]; quote: string; cta: string };
  const mission = t('mission');
  const vision = t('vision');
  const values = t.raw('values') as Array<{ title: string; description: string }>;
  const method = t.raw('method') as { title: string; steps: Array<{ title: string; description: string }> };
  const careers = t.raw('careers') as { title: string; body: string; cta: string };
  const downloadCta = t('downloadCta');

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <LayeredSection variant="sand">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-brand-navy">{manifest.title}</h1>
          {manifest.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-brand-charcoal/80 md:text-lg">
              {paragraph}
            </p>
          ))}
          <Link
            href="/cv/hudson-borges-pt.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-navy"
          >
            {downloadCta}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5M12 15V3m7 18H5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </LayeredSection>

      <LayeredSection variant="brand">
        <div className="space-y-4 text-white">
          <h2 className="text-2xl font-semibold text-white">{founder.title}</h2>
          <ul className="space-y-2 text-sm text-white/85">
            {founder.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <blockquote className="border-l-2 border-white/40 pl-4 text-sm italic text-white/80">“{founder.quote}”</blockquote>
          <Link
            href={withLocale(locale, '/contato')}
            className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-semibold text-brand-navy shadow hover:bg-brand-sand"
          >
            {founder.cta}
          </Link>
        </div>
      </LayeredSection>

      <LayeredSection variant="slate">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
            <h3 className="text-lg font-semibold text-brand-navy">Missão</h3>
            <p className="mt-2 text-sm text-brand-charcoal/80">{mission}</p>
          </div>
          <div className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
            <h3 className="text-lg font-semibold text-brand-navy">Visão</h3>
            <p className="mt-2 text-sm text-brand-charcoal/80">{vision}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-navy">Valores</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-brand-sand bg-white/80 p-4 text-sm text-brand-charcoal/80 shadow">
                <span className="font-semibold text-brand-navy">{value.title}</span>
                <p className="mt-1">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="brand">
        <div className="space-y-6 text-white">
          <h2 className="text-2xl font-semibold text-white">{method.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {method.steps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/20 bg-white/15 px-4 py-5 text-sm text-white/85 shadow">
                <span className="font-semibold text-white">{step.title}</span>
                <p className="mt-2 text-white/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="sand">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-navy">{careers.title}</h2>
          <p className="text-sm text-brand-charcoal/80">{careers.body}</p>
          <Link
            href="mailto:talentos@hb-advisory.com.br"
            className="inline-flex rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-slate"
          >
            {careers.cta}
          </Link>
        </div>
      </LayeredSection>
    </div>
  );
}
