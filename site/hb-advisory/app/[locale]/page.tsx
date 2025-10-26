import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { organizationJsonLd } from '@/lib/seo';
import { withLocale } from '@/lib/paths';

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });

  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];

  const proofPoints = toStringArray(t.raw('proofPoints'));
  const highlightsRaw = t.raw('highlights') as unknown;
  const highlights = Array.isArray(highlightsRaw)
    ? highlightsRaw.map((item) => {
        const candidate = item as Record<string, unknown>;
        return {
          title: String(candidate?.title ?? ''),
          description: String(candidate?.description ?? ''),
          href: String(candidate?.href ?? '/')
        };
      })
    : [];
  const marketingPoints = toStringArray(t.raw('marketing.points'));
  const statusItems = toStringArray(t.raw('status.items'));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(146,208,80,0.25),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(242,155,56,0.25),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 text-white md:flex-row md:items-center">
          <div className="space-y-6 md:flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
              {t('badge')}
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">{t('title')}</h1>
            <p className="text-white/80 md:text-lg">{t('description')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={withLocale(locale, '/contato')}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-navy shadow-lg hover:bg-brand-sand"
              >
                {t('primaryCta')}
              </Link>
              <Link
                href={withLocale(locale, '/hubs/agro-intel')}
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t('secondaryCta')}
              </Link>
            </div>
            <ul className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
              {proofPoints.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-leaf" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden flex-1 md:block">
            <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
              <Image src="/images/dashboard-preview.jpg" alt="HB Agro Intel dashboard" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-sand bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{t('marketing.title')}</h2>
            <p className="text-brand-charcoal/75">{t('marketing.description')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.title} className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-brand-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/80">{item.description}</p>
                <Link
                  href={withLocale(locale, item.href)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-slate hover:text-brand-navy"
                >
                  {locale === 'en' ? 'Learn more' : 'Saiba mais'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14m0 0l-6-6m6 6l-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row">
          <div className="md:w-3/5">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t('marketing.title')}</h2>
            <p className="mt-3 text-brand-sand/80">{t('marketing.description')}</p>
            <ul className="mt-6 space-y-3 text-sm text-brand-sand/80">
              {marketingPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>
          <div className="md:w-2/5">
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-semibold">{locale === 'en' ? 'Ready for the next step?' : 'Pronto para o próximo passo?'}</h3>
              <p className="mt-2 text-sm text-brand-sand/80">{t('marketing.contactIntro')}</p>
              <div className="mt-5 space-y-3 text-sm">
                <p>
                  Email:{' '}
                  <a href="mailto:contato@hb-advisory.com.br" className="underline">
                    contato@hb-advisory.com.br
                  </a>
                </p>
                <p>
                  LinkedIn:{' '}
                  <a href="https://www.linkedin.com/company/hb-advisory" className="underline">
                    @hb-advisory
                  </a>
                </p>
            <Link
              href={withLocale(locale, '/contato')}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 font-semibold text-brand-navy shadow hover:bg-brand-sand"
                >
                  {t('marketing.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-sand bg-brand-sand/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-brand-navy">{t('status.title')}</h2>
            <p className="text-sm text-brand-charcoal/70">{t('status.description')}</p>
          </div>
          <Link
            href="mailto:hb-agro-intel@hb-advisory.com.br"
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-slate"
          >
            hb-agro-intel@hb-advisory.com.br
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid gap-4 md:grid-cols-2">
            {statusItems.map((item) => (
              <div key={item} className="rounded-2xl border border-brand-sand bg-white p-4 text-sm text-brand-charcoal/80">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-brand-charcoal/60">{t('status.note')}</p>
        </div>
      </section>
    </>
  );
}
