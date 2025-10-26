import Link from 'next/link';
import { withLocale } from '@/lib/paths';

const hubs = [
  {
    title: 'HB Agro Intel',
    description: 'Legislação, manuais, monitor de concorrentes e alertas inteligentes.',
    path: '/hubs/agro-intel'
  },
  {
    title: 'Calendário do Setor',
    description: 'Eventos e prazos críticos para times regulatórios e de negócios.',
    path: '/hubs/eventos'
  },
  {
    title: 'Cursos & Certificações',
    description: 'Trilhas integradas ao Hotmart para capacitar seu time.',
    path: '/hubs/cursos'
  },
  {
    title: 'IA & Copilotos',
    description: 'Automação de análises, resumos e atendimento especializado.',
    path: '/hubs/ia'
  }
];

export default function HubsIndex({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-brand-navy">Hubs HB Advisory</h1>
        <p className="text-brand-charcoal/75">
          Experiências especializadas para diferentes momentos da jornada regulatória e de negócios.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {hubs.map((hub) => (
          <Link
            key={hub.title}
            href={withLocale(locale, hub.path)}
            className="rounded-3xl border border-brand-sand bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-brand-navy">{hub.title}</h2>
            <p className="mt-2 text-sm text-brand-charcoal/80">{hub.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
