import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';

export const metadata: Metadata = {
  title: 'Minha HB',
  description: 'Área do cliente em construção para dashboards, módulos e materiais exclusivos.'
};

export default async function MinhaHBPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'minhaHb' });

  const title = t('title');
  const subtitle = t('subtitle');
  const description = t('description');
  const cta = t('cta');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <LayeredSection variant="brand">
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-white/85">{subtitle}</p>
          <p className="text-sm text-white/70">{description}</p>
          <a
            href="mailto:contato@hb-advisory.com.br?subject=Quero%20acesso%20ao%20Minha%20HB"
            className="inline-flex rounded-full bg-white px-6 py-2 text-sm font-semibold text-brand-navy shadow hover:bg-brand-sand"
          >
            {cta}
          </a>
        </div>
      </LayeredSection>
    </div>
  );
}
