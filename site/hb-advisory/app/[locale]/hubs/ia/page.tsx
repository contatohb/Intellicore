import { withLocale } from '@/lib/paths';

const funcionalidades = [
  {
    titulo: 'Resumo automático de legislações',
    descricao:
      'Pipeline que interpreta publicações do DOU/QD, gera highlights e sugere ações específicas por área de negócio.'
  },
  {
    titulo: 'Classificação de risco e impacto',
    descricao:
      'Modelos treinados com histórico HB identificam impacto jurídico ou comercial em segundos, gerando alertas segmentados.'
  },
  {
    titulo: 'Assistente por voz / WhatsApp',
    descricao:
      'Interface conversacional para consultas rápidas sobre registros, prazos e manuais, integrada ao Supabase.'
  }
];

const stack = [
  'OpenAI / Azure OpenAI com monitoramento e logs internos',
  'Supabase Edge Functions para orquestração',
  'Pipelines Python com guardrails e validação humana',
  'Integração futura com Vertex AI / Llama para cenários on-prem'
];

export default function AiHub({ params }: { params: { locale: string } }) {
  const { locale } = params;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Funcionalidades de IA</h1>
        <p className="text-brand-charcoal/75">
          IA como copiloto — sempre com supervisão, trilhas de auditoria e opções de uso interno ou white-label para
          clientes.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {funcionalidades.map((item) => (
          <article key={item.titulo} className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-navy">{item.titulo}</h2>
            <p className="mt-2 text-sm text-brand-charcoal/80">{item.descricao}</p>
          </article>
        ))}
      </div>
      <section className="space-y-3 rounded-3xl border border-brand-sand bg-brand-sand/40 p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Stack e governança</h2>
        <ul className="space-y-2 text-sm text-brand-charcoal/80">
          {stack.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="text-xs text-brand-charcoal/60">
          Consulte o diretório “Funcionalidades de AI” para protótipos visuais e fluxos planejados. Sugestões? Envie
          para <a className="underline" href="mailto:ai@hb-advisory.com.br">ai@hb-advisory.com.br</a>.
        </p>
        <a
          href={withLocale(locale, '/contato')}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-slate underline"
        >
          falar com especialistas em IA
        </a>
      </section>
    </div>
  );
}
