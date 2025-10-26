export const withLocale = (locale: string, path: string) => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/' || clean === '') {
    return `/${locale}`;
  }
  return `/${locale}${clean}`;
};
