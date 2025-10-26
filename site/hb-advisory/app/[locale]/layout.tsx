import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { getMessages } from '@/i18n/get-messages';
import { Locale, locales } from '@/i18n/config';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: {
    default: 'HB Advisory | Inteligência Regulatória e Agro Inteligente',
    template: '%s | HB Advisory'
  },
  description:
    'HB Advisory conecta dados regulatórios, inteligência agro e automações de IA para acelerar decisões e compliance.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'HB Advisory',
    description:
      'Soluções de inteligência regulatória e agro para equipes que precisam de dados confiáveis e automação.',
    url: 'https://hb-advisory.com.br',
    siteName: 'HB Advisory',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'HB Advisory'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HB Advisory',
    description:
      'Soluções de inteligência regulatória e agro para equipes que precisam de dados confiáveis e automação.'
  }
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
