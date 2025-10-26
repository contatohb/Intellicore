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
    <footer className="border-t border-white/10 bg-gradient-to-br from-brand-navyDark via-brand-charcoalMuted to-black text-brand-sand/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between">
        <div className="space-y-3 text-sm md:max-w-sm">
          <div>
            <p className="font-semibold text-white">HB Intellicore</p>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-sand/60">by HB Advisory</p>
          </div>
          <p className="text-brand-sand/80">{t('summary')}</p>
          <p className="text-xs text-brand-sand/60">© {currentYear} HB Advisory. {t('copyright')}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-white">Institucional</p>
            <ul className="space-y-2">
              {navigation.footer.map((item) => (
                <li key={item.key}>
                  <Link href={withLocale(locale, item.path)} className="text-brand-sand/70 hover:text-white">
                    {tMenu(item.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Soluções</p>
            <ul className="space-y-2">
              {navigation.solutions.map((item) => (
                <li key={item.key}>
                  <Link href={withLocale(locale, item.path)} className="text-brand-sand/70 hover:text-white">
                    {tMenu(item.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="mb-3 font-semibold text-white">{t('newsletterTitle')}</p>
            <form className="space-y-2 text-sm" action="/api/newsletter" method="post">
              <label className="block text-brand-sand/70" htmlFor="newsletter-email">
                {t('newsletterDescription')}
              </label>
              <input
                type="email"
                id="newsletter-email"
                name="email"
                required
                placeholder={t('emailPlaceholder')}
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-brand-sand/50 focus:border-brand-sand focus:outline-none"
              />
              <button type="submit" className="w-full rounded-md bg-white/20 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30">
                {t('newsletterCta')}
              </button>
              <p className="text-xs text-brand-sand/60">{t('privacy')}</p>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};
