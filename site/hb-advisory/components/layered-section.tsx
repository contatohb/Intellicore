import { PropsWithChildren, CSSProperties } from 'react';
import clsx from 'clsx';

type Variant = 'brand' | 'sand' | 'slate' | 'agro';

type LayeredSectionProps = PropsWithChildren<{
  variant?: Variant;
  className?: string;
  innerClassName?: string;
  noSurface?: boolean;
}>;

const gradientClasses: Record<Variant, string> = {
  brand: 'bg-gradient-to-br from-brand-navyDark via-brand-navyMuted to-brand-charcoalMuted',
  sand: 'bg-gradient-to-br from-brand-charcoalMuted via-brand-navyMuted/90 to-brand-sandDeep/80',
  slate: 'bg-gradient-to-br from-brand-slate via-brand-navy to-brand-charcoal',
  agro: 'bg-gradient-to-br from-[#0A2E1B] via-[#2F5A2B] to-[#B38F4A]'
};

const accentStyles: Record<Variant, CSSProperties> = {
  brand: {
    background:
      'radial-gradient(120% 120% at 0% 0%, rgba(76,117,181,0.35) 0%, transparent 58%), radial-gradient(95% 95% at 100% 100%, rgba(242,155,56,0.18) 0%, transparent 62%)'
  },
  sand: {
    background:
      'radial-gradient(110% 110% at 0% 0%, rgba(18,58,115,0.25) 0%, transparent 55%), radial-gradient(90% 90% at 100% 100%, rgba(76,175,122,0.2) 0%, transparent 60%)'
  },
  slate: {
    background:
      'radial-gradient(110% 110% at 0% 0%, rgba(245,240,235,0.35) 0%, transparent 60%), radial-gradient(95% 95% at 100% 100%, rgba(242,155,56,0.2) 0%, transparent 60%)'
  },
  agro: {
    background:
      'radial-gradient(115% 115% at 0% 0%, rgba(248,235,203,0.45) 0%, transparent 58%), radial-gradient(95% 95% at 100% 100%, rgba(88,173,116,0.28) 0%, transparent 60%)'
  }
};

export function LayeredSection({
  children,
  variant = 'brand',
  className,
  innerClassName,
  noSurface = false
}: LayeredSectionProps) {
  const baseInner =
    'relative z-10 rounded-[30px] p-8 backdrop-blur-sm shadow-sm transition-shadow duration-300';
const surfaceClass = noSurface ? 'bg-transparent shadow-none' : 'bg-white/90';

  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-[32px] border border-white/10 p-[1px]',
        className
      )}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-500',
          gradientClasses[variant]
        )}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80"
        style={accentStyles[variant]}
      />
      <div className={clsx(baseInner, surfaceClass, innerClassName)}>{children}</div>
    </section>
  );
}
