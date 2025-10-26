import { notFound } from 'next/navigation';
import { Locale, locales } from './config';

export async function getMessages(locale: Locale) {
  if (!locales.includes(locale)) {
    notFound();
  }
  const messages = await import(`../messages/${locale}.json`).then((mod) => mod.default);
  return messages;
}
