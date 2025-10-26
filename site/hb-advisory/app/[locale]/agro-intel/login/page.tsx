import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';

export default async function AgroIntelLoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'agro' });
  const login = t.raw('login') as { title: string; subtitle: string; cta: string; support: string; home: string };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <LayeredSection variant="agro">
        <div className="space-y-4 text-brand-charcoal/85">
          <div className="flex items-center justify-center">
            <Image
              src="/images/hb-agro-intel-logo.svg"
              alt="HB Agro Intel"
              width={160}
              height={68}
              className="h-auto w-36"
            />
          </div>
          <h1 className="text-2xl font-semibold text-brand-navy">{login.title}</h1>
          <p className="text-sm text-brand-charcoal/70">{login.subtitle}</p>
          <form className="space-y-4" action="/auth/agro-intel/login" method="post">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-brand-charcoal/70 uppercase tracking-wide">
                Email corporativo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-[#0E4227]/40 px-3 py-2 text-sm focus:border-[#0E4227] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-brand-charcoal/70 uppercase tracking-wide">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-md border border-[#0E4227]/40 px-3 py-2 text-sm focus:border-[#0E4227] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#0E4227] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#467A3C]"
            >
              {login.cta}
            </button>
          </form>
          <p className="text-xs text-brand-charcoal/60">{login.support}</p>
        </div>
      </LayeredSection>
      <Link
        href={`/${locale}/agro-intel`}
        className="mt-6 text-center text-sm font-medium text-brand-slate hover:text-brand-navy"
      >
        ← {login.home}
      </Link>
    </div>
  );
}
