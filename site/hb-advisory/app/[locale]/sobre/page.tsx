import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const buildHref = (locale: string, path: string) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/' || clean === '') {
    return `/${locale}`;
  }
  return `/${locale}${clean}`;
};

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'about' });

  const values = t<any>('values', { returnObjects: true }) as { title: string; description: string }[];
  const pillars = t<any>('pillars', { returnObjects: true }) as { title: string; items: string[] }[];

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16">
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold text-brand-navy">{t('title')}</h1>
        <p className="text-brand-charcoal/80 md:text-lg">{t('section1')}</p>
        <p className="text-brand-charcoal/70">{t('section2')}</p>
        <Link
          href="/cv/hudson-borges-pt.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-navy"
        >
          {t('downloadCta')}
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
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="rounded-3xl border border-brand-sand bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-navy">{value.title}</h2>
            <p className="mt-2 text-sm text-brand-charcoal/80">{value.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-brand-navy">{t('pillarsTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-3xl border border-brand-sand bg-brand-sand/30 p-6">
              <h3 className="text-lg font-semibold text-brand-navy">{pillar.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-brand-charcoal/80">
                {pillar.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="carreiras" className="space-y-4 rounded-3xl border border-dashed border-brand-sand p-8">
        <h2 className="text-2xl font-semibold text-brand-navy">{t('careersTitle')}</h2>
        <p className="text-sm text-brand-charcoal/80">
          {t.rich('careersDescription', {
            email: (chunks) => (
              <a className="text-brand-slate underline" href="mailto:talentos@hb-advisory.com.br">
                {chunks}
              </a>
            )
          })}
        </p>
        <Link
          href={buildHref(locale, '/contato')}
          className="inline-flex rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
        >
          {t('careersCta')}
        </Link>
      </section>
    </div>
  );
}
