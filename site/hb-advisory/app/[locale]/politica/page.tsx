import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Transparência sobre como tratamos dados pessoais nos hubs HB Advisory.'
};

const sections = [
  {
    title: 'Coleta de dados',
    body: [
      'Coletamos informações fornecidas voluntariamente em formulários (nome, email, empresa) e dados técnicos básicos (IP, navegador) para métricas e segurança.',
      'Integrações com Supabase, Mailgun e Google Workspace armazenam dados exclusivamente para entregar comunicações e relatórios.'
    ]
  },
  {
    title: 'Uso de dados',
    body: [
      'Envio de relatórios, newsletters, convites para eventos e materiais educacionais.',
      'Personalização de experiências nos hubs e priorização de roadmap com base em feedback.'
    ]
  },
  {
    title: 'Compartilhamento',
    body: [
      'Não vendemos dados. Compartilhamos apenas com provedores contratados (infraestrutura, automação de marketing, suporte técnico) sob acordos de confidencialidade.'
    ]
  },
  {
    title: 'Seus direitos',
    body: [
      'Solicitar acesso, portabilidade ou exclusão dos seus dados a qualquer momento via contato@hb-advisory.com.br.',
      'Atualizações desta política serão comunicadas por email e publicadas nesta página.'
    ]
  }
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Política de Privacidade</h1>
        <p className="text-sm text-brand-charcoal/70">Última atualização: 26 de outubro de 2025</p>
      </header>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-brand-navy">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm text-brand-charcoal/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <p className="rounded-2xl border border-brand-sand bg-brand-sand/40 p-4 text-xs text-brand-charcoal/70">
        Dúvidas? Entre em contato com nosso time de privacidade pelo email privacy@hb-advisory.com.br.
      </p>
    </div>
  );
}
