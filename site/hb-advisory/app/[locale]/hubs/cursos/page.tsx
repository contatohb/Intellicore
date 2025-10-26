import { withLocale } from '@/lib/paths';

const cursos = [
  {
    titulo: 'Inteligência Regulatória no Agro (HB Agro Intel)',
    duracao: '12 horas',
    formato: 'On-demand + sessões ao vivo',
    link: 'https://hotmart.com/curso-hb-agro-intel',
    objetivos: [
      'Mapear jornadas regulatórias com o HB Agro Intel',
      'Construir alertas personalizados e workflows de aprovação',
      'Configurar dashboards e relatórios para diretoria'
    ]
  },
  {
    titulo: 'Copilotos de IA para times regulatórios',
    duracao: '8 horas',
    formato: 'Online em cohort',
    link: 'https://hotmart.com/ia-regintel',
    objetivos: [
      'Boas práticas de privacy & prompts',
      'Automação de pareceres e checklists',
      'Integração com Supabase e Mailgun'
    ]
  }
];

export default function CoursesHub({ params }: { params: { locale: string } }) {
  const { locale } = params;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Cursos & Certificações</h1>
        <p className="text-brand-charcoal/75">
          Capacite o time com formações exclusivas, conteúdo prático e acesso às automações da HB Advisory. Integração
          completa com Hotmart, incluindo pagamento, tracking e suporte pós-treinamento.
        </p>
      </header>
      <div className="space-y-6">
        {cursos.map((curso) => (
          <article key={curso.titulo} className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-brand-navy">{curso.titulo}</h2>
                <p className="text-sm text-brand-slate">
                  {curso.duracao} • {curso.formato}
                </p>
              </div>
              <a
                href={curso.link}
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-slate"
              >
                Acessar no Hotmart
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
            </div>
            <ul className="mt-4 space-y-2 text-sm text-brand-charcoal/80">
              {curso.objetivos.map((objetivo) => (
                <li key={objetivo}>• {objetivo}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="rounded-3xl border border-dashed border-brand-sand p-5 text-sm text-brand-charcoal/70">
        <p className="font-semibold text-brand-navy">Customizamos trilhas in-company</p>
        <p>
          Deseja um treinamento exclusivo ou onboarding acelerado? Envie seu briefing para academiahb@hb-advisory.com.br.
        </p>
        <a href={withLocale(locale, '/contato')} className="mt-3 inline-flex items-center gap-2 text-brand-slate underline">
          solicitar proposta
        </a>
      </div>
    </div>
  );
}
