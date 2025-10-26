import type { Metadata } from 'next';
import Link from 'next/link';
import { withLocale } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'HB Agro Intel',
  description: 'Base viva de legislação, manuais, concorrência e automações para o agro.'
};

const features = [
  {
    title: 'Base pesquisável',
    description: 'Coleta contínua de DOU, QD, AgroAPI, manuais MAPA/ANVISA/IBAMA e concorrentes.',
    tags: ['Backfill 1990+', 'Deduplicação', 'Full-text search']
  },
  {
    title: 'Alertas inteligentes',
    description: 'Notificações configuráveis por cultura, substância, órgão e impacto regulatório.',
    tags: ['Mailgun', 'Supabase Functions', 'Playbooks']
  },
  {
    title: 'Insights competitivos',
    description: 'Monitoramento de players globais, eventos e lançamentos para orientar marketing e P&D.',
    tags: ['Concorrência', 'Eventos', 'Newsletter IA']
  }
];

const roadmap = [
  { label: 'Dashboard self-service', status: 'Em desenvolvimento' },
  { label: 'API pública / GraphQL', status: 'Planejado' },
  { label: 'Integração ERPs Agro', status: 'Em pesquisa' },
  { label: 'Modelos preditivos de risco', status: 'Exploratório' }
];

export default function AgroIntelHub({ params }: { params: { locale: string } }) {
  const { locale } = params;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16">
      <section className="grid gap-10 md:grid-cols-[3fr,2fr]">
        <div className="space-y-4">
          <span className="rounded-full bg-brand-sand px-3 py-1 text-xs font-semibold uppercase text-brand-slate">
            Hub
          </span>
          <h1 className="text-3xl font-semibold text-brand-navy">HB Agro Intel</h1>
          <p className="text-brand-charcoal/80 md:text-lg">
            Tudo que a sua equipe precisa para navegar legislação agro, acompanhar concorrentes e decidir rápido.
            Construído sobre pipelines confiáveis, arquitetura escalável e experiências alimentadas por IA.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-brand-sand px-3 py-1">AgroAPI + Bioinsumos</span>
            <span className="rounded-full border border-brand-sand px-3 py-1">Calendário regulatório</span>
            <span className="rounded-full border border-brand-sand px-3 py-1">Monitor de manuais</span>
            <span className="rounded-full border border-brand-sand px-3 py-1">IA para resumos</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={withLocale(locale, '/contato')}
              className="inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-slate"
            >
              Solicitar acesso
            </Link>
            <Link
              href={withLocale(locale, '/hubs/eventos')}
              className="inline-flex items-center justify-center rounded-full border border-brand-navy px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-navy/5"
            >
              Ver calendário do setor
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-brand-sand bg-brand-sand/50 p-6">
          <h2 className="text-lg font-semibold text-brand-navy">Status do backfill</h2>
          <p className="text-sm text-brand-charcoal/70">
            Os pipelines rodam 24/7. Receba atualizações horárias por email ou acompanhe dashboards (em breve).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-charcoal/80">
            <li>• DOU 1990+ — processamento contínuo via INLabs/Ro-dou</li>
            <li>• Querido Diário — expansão de municípios e histórico 2015+</li>
            <li>• AgroAPI — credenciais configuradas, ingest inicial em andamento</li>
            <li>• Bioinsumos — ajuste do endpoint de classes e categorias</li>
          </ul>
          <p className="mt-4 text-xs text-brand-charcoal/60">
            Envie feedbacks para hb-agro-intel@hb-advisory.com.br e participe do roteiro público.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-navy">{feature.title}</h3>
            <p className="mt-2 text-sm text-brand-charcoal/80">{feature.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-slate">
              {feature.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-brand-sand px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-brand-sand p-6">
        <h2 className="text-xl font-semibold text-brand-navy">Roadmap público</h2>
        <p className="mt-2 text-sm text-brand-charcoal/75">
          Atualizamos semanalmente conforme os pipelines avançam e novas funcionalidades são priorizadas.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {roadmap.map((item) => (
            <div key={item.label} className="rounded-2xl bg-brand-sand/40 px-4 py-3 text-sm text-brand-charcoal/80">
              <span className="font-medium text-brand-navy">{item.label}</span>
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-slate">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
