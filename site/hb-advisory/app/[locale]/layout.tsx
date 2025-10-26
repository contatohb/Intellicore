import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { getMessages } from '@/i18n/get-messages';
import { Locale, locales } from '@/i18n/config';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hb-advisory.com.br';
const ogImage = new URL('/og-default.png', siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HB Intellicore | Guarda-chuva de hubs HB Advisory',
    template: '%s | HB Intellicore'
  },
  description:
    'HB Intellicore conecta dados regulatórios, inteligência agro e automações de IA para acelerar decisões e compliance sob o guarda-chuva HB Advisory.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'HB Intellicore',
    description:
      'Guarda-chuva HB Intellicore: hubs de inteligência regulatória, agro e inovação com dados confiáveis e automação.',
    url: siteUrl,
    siteName: 'HB Intellicore',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'HB Intellicore'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HB Intellicore',
    description:
      'Guarda-chuva HB Intellicore: hubs de inteligência regulatória, agro e inovação com dados confiáveis e automação.',
    images: [ogImage]
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
