import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { organizationJsonLd } from '@/lib/seo';
import { withLocale } from '@/lib/paths';
import { LayeredSection } from '@/components/layered-section';

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });

  const hero = t.raw('hero') as {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };

  const valueItems = t.raw('value.items') as Array<{ title: string; description: string }>;
  const intellicore = t.raw('intellicore') as { title: string; description: string; cta: string; href: string };
  const agro = t.raw('agro') as {
    title: string;
    description: string;
    points: string[];
    cta: string;
    href: string;
  };
  const howSteps = t.raw('how.steps') as Array<{ title: string; description: string }>;
  const howTitle = t('how.title');
  const integrations = t.raw('integrations') as { title: string; items: string[]; note: string };
  const authority = t.raw('authority') as { title: string; quote: string; cta: string; href: string };
  const finalCta = t.raw('cta') as { title: string; subtitle: string; cta: string; href: string };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(146,197,255,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(242,155,56,0.3),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 text-white md:flex-row md:items-center">
          <div className="space-y-6 md:flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
              {hero.badge}
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">{hero.title}</h1>
            <p className="text-white/85 md:text-lg">{hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={withLocale(locale, hero.primaryHref)}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-navy shadow-lg hover:bg-brand-sand"
              >
                {hero.primaryCta}
              </Link>
              <Link
                href={withLocale(locale, hero.secondaryHref)}
                className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {hero.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="md:w-2/5">
            <LayeredSection variant="sand" className="border-white/20 bg-white/5" noSurface>
              <ul className="space-y-3 text-sm text-white/90">
                {valueItems.map((item) => (
                  <li key={item.title} className="flex flex-col">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-white/75">{item.description}</span>
                  </li>
                ))}
              </ul>
            </LayeredSection>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
        <LayeredSection variant="sand">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{t('value.title')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {valueItems.map((item) => (
                <article key={item.title} className="rounded-3xl border border-brand-sand bg-white/85 p-6 shadow">
                  <h3 className="text-lg font-semibold text-brand-navy">{item.title}</h3>
                  <p className="mt-2 text-sm text-brand-charcoal/80">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </LayeredSection>

        <LayeredSection variant="brand">
          <div className="grid gap-6 md:grid-cols-[2fr,1fr] md:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{intellicore.title}</h2>
              <p className="text-brand-charcoal/80">{intellicore.description}</p>
              <Link
                href={withLocale(locale, intellicore.href)}
                className="inline-flex items-center rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-slate"
              >
                {intellicore.cta}
              </Link>
            </div>
            <div className="rounded-3xl border border-brand-sand bg-white/85 p-5 text-sm text-brand-charcoal/80 shadow">
              <p>
                {agro.description}
              </p>
              <ul className="mt-4 space-y-1 text-brand-slate">
                {agro.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          </div>
        </LayeredSection>

        <LayeredSection variant="slate">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{agro.title}</h2>
              <p className="text-brand-charcoal/80">{agro.description}</p>
            </div>
            <ul className="grid gap-3 text-sm text-brand-charcoal/75 md:grid-cols-2">
              {agro.points.map((point) => (
                <li key={point} className="rounded-3xl border border-brand-sand bg-white/85 px-4 py-3 shadow">
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={withLocale(locale, agro.href)}
              className="inline-flex w-fit items-center rounded-full border border-brand-navy px-5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              {agro.cta}
            </Link>
          </div>
        </LayeredSection>

        <LayeredSection variant="brand">
          <div className="space-y-6 text-brand-charcoal/85">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{howTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {howSteps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-brand-sand bg-white/85 p-5 shadow">
                  <h3 className="text-lg font-semibold text-brand-navy">{step.title}</h3>
                  <p className="mt-2 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </LayeredSection>

        <LayeredSection variant="sand" noSurface>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-brand-navy sm:text-2xl">{integrations.title}</h2>
            <div className="flex flex-wrap gap-2 text-sm text-brand-slate">
              {integrations.items.map((item) => (
                <span key={item} className="rounded-full bg-white/80 px-4 py-1 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-xs text-brand-charcoal/70">{integrations.note}</p>
          </div>
        </LayeredSection>

        <LayeredSection variant="brand">
          <div className="space-y-4 text-white">
            <h2 className="text-xl font-semibold sm:text-2xl">{authority.title}</h2>
            <p className="text-white/80">“{authority.quote}”</p>
            <Link
              href={withLocale(locale, authority.href)}
              className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-semibold text-brand-navy shadow hover:bg-brand-sand"
            >
              {authority.cta}
            </Link>
          </div>
        </LayeredSection>

        <LayeredSection variant="brand">
          <div className="space-y-4 text-white">
            <h2 className="text-2xl font-semibold">{finalCta.title}</h2>
            <p className="text-white/80">{finalCta.subtitle}</p>
            <Link
              href={withLocale(locale, finalCta.href)}
              className="inline-flex rounded-full bg-white px-6 py-2 text-sm font-semibold text-brand-navy shadow hover:bg-brand-sand"
            >
              {finalCta.cta}
            </Link>
          </div>
        </LayeredSection>
      </div>
    </>
  );
}
