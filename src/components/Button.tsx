import Link from 'next/link'
import { clsx } from 'clsx'

type Props = { href?: string; variant?: 'primary' | 'ghost'; className?: string; children: React.ReactNode }

const base =
  'group inline-flex items-center justify-center gap-2 rounded-card px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300'
const variants = {
  primary: 'bg-espresso text-sand hover:bg-clay',
  ghost: 'bg-transparent text-espresso ring-1 ring-espresso/25 hover:ring-espresso/70',
}

export function Button({ href, variant = 'primary', className, children }: Props) {
  const cls = clsx(base, variants[variant], className)
  const inner = (
    <>
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        →
      </span>
    </>
  )
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button className={cls}>{inner}</button>
  )
}
