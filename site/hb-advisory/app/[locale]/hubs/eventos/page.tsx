import { withLocale } from '@/lib/paths';

const eventos = [
  {
    nome: 'Congresso Brasileiro de Agroquímicos',
    data: '03-05 abril 2026',
    local: 'São Paulo, SP',
    foco: 'Regulação, compliance, inovação',
    link: 'https://example.com/evento1'
  },
  {
    nome: 'Missão Técnica Europe Agro',
    data: '22-28 maio 2026',
    local: 'Paris & Bruxelas',
    foco: 'Benchmark regulatório e networking institucional',
    link: 'https://example.com/evento2'
  },
  {
    nome: 'Workshop HB Agro Intel',
    data: 'Junho 2026',
    local: 'Online',
    foco: 'Uso do hub, dashboards e automações de IA',
    link: '/contato'
  }
];

export default function EventsHub({ params }: { params: { locale: string } }) {
  const { locale } = params;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Calendário de eventos do setor agro</h1>
        <p className="text-brand-charcoal/75">
          Mantenha o time alinhado com os principais congressos, prazos de consulta pública, reuniões com órgãos e
          iniciativas internas da HB Advisory.
        </p>
      </header>
      <div className="grid gap-4">
        {eventos.map((evento) => {
          const href = evento.link.startsWith('http') ? evento.link : withLocale(locale, evento.link);
          return (
            <article key={evento.nome} className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-navy">{evento.nome}</h2>
                  <p className="text-sm text-brand-charcoal/70">{evento.foco}</p>
                </div>
                <div className="text-sm text-brand-slate">
                  <p>{evento.data}</p>
                  <p>{evento.local}</p>
                </div>
              </div>
              <a
                href={href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-slate hover:text-brand-navy"
              >
                Saiba mais
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14m0 0l-6-6m6 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </article>
          );
        })}
      </div>
      <p className="rounded-2xl border border-dashed border-brand-sand p-5 text-sm text-brand-charcoal/70">
        Quer incluir seu evento ou receber a agenda completa via newsletter? Envie os detalhes para agenda@hb-advisory.com.br.
      </p>
    </div>
  );
}
