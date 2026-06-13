import Link from 'next/link'
import { clsx } from 'clsx'

type Props = { href?: string; variant?: 'primary' | 'ghost'; className?: string; children: React.ReactNode }
const base = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition'
const variants = {
  primary: 'bg-clay text-sand hover:brightness-110',
  ghost: 'bg-transparent text-espresso ring-1 ring-taupe hover:bg-taupe/40',
}
export function Button({ href, variant = 'primary', className, children }: Props) {
  const cls = clsx(base, variants[variant], className)
  return href ? <Link href={href} className={cls}>{children}</Link> : <button className={cls}>{children}</button>
}
