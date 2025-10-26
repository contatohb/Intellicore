import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, type Locale} from './config';

const isSupportedLocale = (value: string): value is Locale =>
  locales.some((candidate) => candidate === value);

export default getRequestConfig(async ({locale}) => {
  const resolved: Locale = isSupportedLocale(locale) ? locale : defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});
