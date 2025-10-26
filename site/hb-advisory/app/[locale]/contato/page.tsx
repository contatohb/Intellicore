import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { withLocale } from '@/lib/paths';

type ContactChannel = {
  title: string;
  email: string;
  details: string;
};

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const channels = (t('channels', { returnObjects: true }) as unknown as ContactChannel[]) ?? [];

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[2fr,3fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-brand-navy">{t('title')}</h1>
          <p className="text-brand-charcoal/80 md:text-lg">{t('description')}</p>
        </div>
        <div className="space-y-5">
          {channels.map((channel) => (
            <div key={channel.title} className="rounded-2xl border border-brand-sand bg-white p-4">
              <p className="font-semibold text-brand-navy">{channel.title}</p>
              <p className="text-sm text-brand-charcoal/70">{channel.details}</p>
              <a className="text-sm font-medium text-brand-slate" href={`mailto:${channel.email}`}>
                {channel.email}
              </a>
            </div>
          ))}
        </div>
      </div>

      <form
        action="https://formsubmit.co/hb-agro-intel@hb-advisory.com.br"
        method="POST"
        className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="_subject" value="Contato via hb-advisory.com.br" />
        <input type="hidden" name="_next" value={`https://hb-advisory.com.br/${locale}/contato?success=true`} />
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-brand-navy">
              {t('form.name')}*
            </label>
            <input
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-md border border-brand-sand px-3 py-2 text-brand-charcoal focus:border-brand-navy focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-brand-navy">
              {t('form.email')}*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 w-full rounded-md border border-brand-sand px-3 py-2 text-brand-charcoal focus:border-brand-navy focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="company" className="text-sm font-medium text-brand-navy">
              {t('form.company')}
            </label>
            <input
              id="company"
              name="company"
              className="mt-1 w-full rounded-md border border-brand-sand px-3 py-2 text-brand-charcoal focus:border-brand-navy focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-brand-navy">
              {t('form.message')}*
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="mt-1 w-full rounded-md border border-brand-sand px-3 py-2 text-brand-charcoal focus:border-brand-navy focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow hover:bg-brand-slate"
          >
            {t('form.submit')}
          </button>
          <p className="text-xs text-brand-charcoal/60">
            {t.rich('form.privacy', {
              privacy: (chunks) => (
                <Link href={withLocale(locale, '/politica')} className="underline">
                  {chunks}
                </Link>
              )
            })}
          </p>
        </div>
      </form>
    </div>
  );
}
