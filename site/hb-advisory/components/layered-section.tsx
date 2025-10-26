import { PropsWithChildren, CSSProperties } from 'react';
import clsx from 'clsx';

type Variant = 'brand' | 'sand' | 'slate';

type LayeredSectionProps = PropsWithChildren<{
  variant?: Variant;
  className?: string;
  innerClassName?: string;
  noSurface?: boolean;
}>;

const gradientClasses: Record<Variant, string> = {
  brand: 'bg-gradient-to-br from-brand-navyDark/90 via-brand-slate/75 to-brand-leaf/65',
  sand: 'bg-gradient-to-br from-brand-sand/80 via-white/70 to-brand-amber/60',
  slate: 'bg-gradient-to-br from-brand-slateLight/75 via-brand-sky/70 to-white/65'
};

const accentStyles: Record<Variant, CSSProperties> = {
  brand: {
    background:
      'radial-gradient(120% 120% at 0% 0%, rgba(146,197,255,0.45) 0%, transparent 55%), radial-gradient(90% 90% at 100% 100%, rgba(242,155,56,0.35) 0%, transparent 60%)'
  },
  sand: {
    background:
      'radial-gradient(110% 110% at 0% 0%, rgba(18,58,115,0.25) 0%, transparent 55%), radial-gradient(90% 90% at 100% 100%, rgba(76,175,122,0.25) 0%, transparent 60%)'
  },
  slate: {
    background:
      'radial-gradient(110% 110% at 0% 0%, rgba(245,240,235,0.45) 0%, transparent 60%), radial-gradient(95% 95% at 100% 100%, rgba(242,155,56,0.25) 0%, transparent 60%)'
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
  const surfaceClass = noSurface ? 'bg-transparent shadow-none' : 'bg-white/85';

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
