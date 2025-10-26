import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { navigation } from '@/data/navigation';
import { withLocale } from '@/lib/paths';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const t = useTranslations('footer');
  const tMenu = useTranslations('footer.menu');
  const locale = useLocale();

  return (
    <footer className="border-t border-brand-sand bg-brand-sand/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between">
        <div className="space-y-3 text-sm text-brand-charcoal/80 md:max-w-sm">
          <p className="font-semibold text-brand-navy">HB Advisory</p>
          <p>{t('summary')}</p>
          <p className="text-xs text-brand-charcoal/60">© {currentYear} HB Advisory. {t('copyright')}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-brand-navy">Institucional</p>
            <ul className="space-y-2">
              {navigation.footer.map((item) => (
                <li key={item.key}>
                  <Link href={withLocale(locale, item.path)} className="text-brand-charcoal/70 hover:text-brand-navy">
                    {tMenu(item.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-brand-navy">Hubs</p>
            <ul className="space-y-2">
              {navigation.hubs.map((item) => (
                <li key={item.key}>
                  <Link href={withLocale(locale, item.path)} className="text-brand-charcoal/70 hover:text-brand-navy">
                    {tMenu(item.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="mb-3 font-semibold text-brand-navy">{t('newsletterTitle')}</p>
            <form className="space-y-2 text-sm" action="/api/newsletter" method="post">
              <label className="block text-brand-charcoal/70" htmlFor="newsletter-email">
                {t('newsletterDescription')}
              </label>
              <input
                type="email"
                id="newsletter-email"
                name="email"
                required
                placeholder={t('emailPlaceholder')}
                className="w-full rounded-md border border-brand-sand px-3 py-2 text-brand-charcoal focus:border-brand-navy focus:outline-none"
              />
              <button type="submit" className="w-full rounded-md bg-brand-navy px-3 py-2 text-white hover:bg-brand-slate">
                {t('newsletterCta')}
              </button>
              <p className="text-xs text-brand-charcoal/60">{t('privacy')}</p>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};
