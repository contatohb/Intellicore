import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { organizationJsonLd } from '@/lib/seo';
import { withLocale } from '@/lib/paths';
import Image from 'next/image';
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
  const ecosystem = t.raw('ecosystem') as { title: string; paragraphs: string[]; pills: string[] };
  const hubs = t.raw('hubs.items') as Array<{ title: string; description: string; cta?: string; href?: string }>;
  const hubsTitle = t('hubs.title');
  const agroPreview = t.raw('agroPreview') as {
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    href: string;
  };
  const finalCta = t.raw('cta') as { title: string; subtitle: string; cta: string; href: string };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(54,94,168,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(242,155,56,0.28),transparent_60%)]" />
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
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {hero.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="relative hidden flex-1 md:block">
            <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              <Image src="/images/dashboard-preview.jpg" alt="HB Intellicore illustration" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
        <LayeredSection variant="brand">
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <div className="space-y-4 text-brand-charcoal/90">
              <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{ecosystem.title}</h2>
              {ecosystem.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-white shadow-sm backdrop-blur">
              <ul className="space-y-3">
                {ecosystem.pills.map((pill) => (
                  <li key={pill} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-amber" />
                    <span>{pill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LayeredSection>

        <LayeredSection variant="sand">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{hubsTitle}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {hubs.map((hub) => (
                <article key={hub.title} className="rounded-3xl border border-brand-sand bg-white/90 p-6 shadow">
                  <h3 className="text-lg font-semibold text-brand-navy">{hub.title}</h3>
                  <p className="mt-2 text-sm text-brand-charcoal/80">{hub.description}</p>
                  {hub.cta && hub.href && (
                    <Link
                      href={withLocale(locale, hub.href)}
                      className="mt-4 inline-flex items-center text-sm font-semibold text-brand-slate hover:text-brand-navy"
                    >
                      {hub.cta}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </LayeredSection>

        <LayeredSection variant="slate">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{agroPreview.title}</h2>
              <p className="text-brand-charcoal/80">{agroPreview.description}</p>
            </div>
            <ul className="grid gap-3 text-sm text-brand-charcoal/75 md:grid-cols-2">
              {agroPreview.bullets.map((item) => (
                <li key={item} className="rounded-3xl border border-brand-sand bg-white/90 px-4 py-3 shadow">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={withLocale(locale, agroPreview.href)}
              className="inline-flex w-fit items-center rounded-full border border-brand-navy px-5 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              {agroPreview.cta}
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
