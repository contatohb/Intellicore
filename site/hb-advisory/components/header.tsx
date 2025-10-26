'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { navigation } from '@/data/navigation';
import { withLocale } from '@/lib/paths';

export const Header = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('header');
  const locale = useLocale();

  const mainNav = useMemo(
    () =>
      navigation.main.map((item) => ({
        key: item.key,
        href: withLocale(locale, item.path),
        label: t(`menu.${item.key}` as const)
      })),
    [locale, t]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-brand-navy/85">
      <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top_left,rgba(76,117,181,0.25),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(242,155,56,0.18),transparent_60%),linear-gradient(135deg,rgba(4,9,16,0.95),rgba(12,34,80,0.9))]" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white md:px-6">
        <Link href={withLocale(locale, '')} className="flex items-center gap-3 md:gap-4">
          <Image
            src="/hb-advisory-logo.png"
            alt="HB Intellicore mark"
            width={64}
            height={64}
            className="h-14 w-auto md:h-16"
            priority
          />
          <div className="flex flex-col leading-tight text-xs font-medium text-white md:text-sm">
            <span className="text-base font-semibold tracking-wide md:text-lg">HB Intellicore</span>
            <span className="uppercase tracking-[0.32em] text-[0.65rem] text-white/80 md:text-[0.75rem]">
              {t('tagline')}
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {mainNav.map((item) => (
            <Link key={item.key} href={item.href} className="text-brand-sand hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
          <Link
            href={withLocale(locale, '/contato')}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-white shadow hover:bg-white/20"
          >
            {t('cta')}
          </Link>
        </nav>
        <button
          className="md:hidden rounded-md border border-white/30 p-2 text-white"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Menu"
        >
          <span className="sr-only">Menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div className={clsx('md:hidden transition-all duration-200', open ? 'max-h-screen' : 'max-h-0 overflow-hidden')}>
        <div className="space-y-4 border-t border-white/10 bg-brand-navyDark/95 px-4 pb-6 pt-4 text-sm font-medium text-brand-sand">
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block hover:text-white"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={withLocale(locale, '/contato')}
            className="block rounded-full bg-white/20 px-5 py-2 text-center text-white shadow hover:bg-white/30"
            onClick={() => setOpen(false)}
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </header>
  );
};
