import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { LayeredSection } from '@/components/layered-section';
import { withLocale } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'HB Agro Intel',
  description: 'Hub de inteligência para o agronegócio, com módulos regulatórios e operacionais.'
};

export default async function AgroIntelPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'agro' });

  const hero = t.raw('hero') as { title: string; subtitle: string };
  const identity = t.raw('identity') as {
    title: string;
    description: string[];
    palette: string[];
    tagline?: string;
    note?: string;
    logoAlt: string;
    download?: { label?: string; href?: string };
  };
  const overview = t.raw('overview') as { title: string; description: string; items: string[] };
  const video = t.raw('video') as { title: string; description: string; cta: string; href: string; note?: string; caption?: string };
  const modules = t.raw('modules.items') as Array<{
    label: string;
    description: string;
    features: string[];
  }>;
  const modulesTitle = t('modules.title');
  const examples = t.raw('examples') as {
    title: string;
    items: Array<{ title: string; description: string; tag: string }>;
  };
  const journey = t.raw('journey') as { title: string; steps: Array<{ title: string; description: string }> };
  const integrations = t.raw('integrations') as {
    title: string;
    groups: Array<{ title: string; items: string[] }>;
    note: string;
  };
  const roadmap = t.raw('roadmap') as {
    title: string;
    phases: Array<{ label: string; description: string; status: string }>;
  };
  const cta = t.raw('cta') as { title: string; cta: string; href: string };
  const login = t.raw('login') as { title: string; subtitle: string; cta: string; support: string };

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <LayeredSection variant="agro">
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-semibold">{hero.title}</h1>
          <p className="text-white/85 md:text-lg">{hero.subtitle}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{identity.title}</h2>
            {identity.description.map((paragraph) => (
              <p key={paragraph} className="text-sm text-brand-charcoal/80">
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold uppercase tracking-widest text-brand-charcoal/70">
              {identity.palette.map((tone) => (
                <span key={tone} className="rounded-full border border-[#0E4227]/25 bg-[#F5E9D4]/70 px-3 py-1 text-[#0E4227]">
                  {tone}
                </span>
              ))}
            </div>
            {identity.note && <p className="text-xs text-brand-charcoal/60">{identity.note}</p>}
            {identity.download?.href && identity.download?.label && (
              <Link
                href={identity.download.href}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0E4227] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow hover:bg-[#2F5A2B]"
              >
                {identity.download.label}
              </Link>
            )}
          </div>
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/95 p-8 text-center shadow">
            <Image
              src="/images/hb-agro-intel-logo.svg"
              alt={identity.logoAlt}
              width={240}
              height={120}
              className="h-auto w-48 md:w-56"
              priority
            />
            {identity.tagline && <p className="text-xs text-brand-charcoal/60">{identity.tagline}</p>}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro" className="bg-white/5" noSurface>
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{overview.title}</h2>
            <p className="text-sm text-brand-charcoal/80 md:text-base">{overview.description}</p>
            <ul className="space-y-2 text-sm text-brand-charcoal/75">
              {overview.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#B38F4A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-[#0E4227]/40 shadow">
            <Image
              src="/images/hb-agro-intel-poster.svg"
              alt={video.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            {video.caption && (
              <p className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
                {video.caption}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-brand-charcoal/70 md:text-base">{video.description}</p>
          <Link
            href={video.href}
            className="inline-flex items-center justify-center rounded-full bg-[#0E4227] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#2F5A2B]"
          >
            {video.cta}
          </Link>
        </div>
        {video.note && <p className="text-xs text-brand-charcoal/60">{video.note}</p>}
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-6 text-brand-charcoal/90">
          <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{modulesTitle}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((module) => (
              <article key={module.label} className="rounded-3xl border border-white/20 bg-white/92 p-6 shadow">
                <span className="inline-flex items-center rounded-full bg-[#0E4227]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0E4227]">
                  {module.label}
                </span>
                <p className="mt-3 text-sm text-brand-charcoal/75 md:text-base">{module.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-brand-charcoal/80">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#B38F4A]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{examples.title}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {examples.items.map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/15 bg-white/92 p-5 shadow">
                <span className="inline-flex items-center rounded-full bg-[#B38F4A]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0E4227]">
                  {item.tag}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-brand-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-4 text-brand-charcoal/85">
          <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{journey.title}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {journey.steps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/92 p-5 shadow">
                <h3 className="text-lg font-semibold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{integrations.title}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {integrations.groups.map((group) => (
              <div key={group.title} className="rounded-3xl border border-white/15 bg-white/92 p-5 shadow">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#0E4227]">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-brand-charcoal/75">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#0E4227]/45" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-charcoal/60">{integrations.note}</p>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-navy sm:text-3xl">{roadmap.title}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {roadmap.phases.map((phase) => (
              <div key={phase.label} className="rounded-3xl border border-white/15 bg-white/92 p-5 shadow">
                <span className="inline-flex items-center rounded-full bg-[#0E4227]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0E4227]">
                  {phase.status}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-brand-navy">{phase.label}</h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">{cta.title}</h2>
          <Link
            href={withLocale(locale, cta.href)}
            className="inline-flex rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#0E4227] shadow hover:bg-[#B38F4A]/40"
          >
            {cta.cta}
          </Link>
        </div>
      </LayeredSection>

      <LayeredSection variant="agro">
        <div className="space-y-4 text-brand-charcoal/85">
          <h2 className="text-2xl font-semibold text-brand-navy">{login.title}</h2>
          <p className="text-sm text-brand-charcoal/70">{login.subtitle}</p>
          <Link
            href={withLocale(locale, '/agro-intel/login')}
            className="inline-flex rounded-full bg-[#0E4227] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#2F5A2B]"
          >
            {login.cta}
          </Link>
          <p className="text-xs text-brand-charcoal/60">{login.support}</p>
        </div>
      </LayeredSection>
    </div>
  );
}
