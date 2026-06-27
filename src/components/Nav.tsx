import Link from 'next/link'
import { SITE } from '@/lib/site'
import { CenterMark } from './CenterMark'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-sand/85 backdrop-blur-md">
      <nav className="container-page flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
          <CenterMark className="h-4 w-4 text-clay transition-transform duration-500 group-hover:rotate-90" />
          <span className="font-display text-[1.35rem] font-medium tracking-tight">{SITE.name}</span>
        </Link>

        <ul className="hidden items-center gap-9 text-sm md:flex">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="link-underline inline-block py-2.5 text-espresso/75 hover:text-espresso">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/suites"
          className="hidden items-center gap-2 py-2.5 text-sm font-medium text-espresso md:inline-flex"
        >
          <span className="link-underline">Reserve</span>
          <span aria-hidden className="text-clay">→</span>
        </Link>
      </nav>

      {/* Mobile nav — accessible real links, horizontally scrollable */}
      <div className="overflow-x-auto border-t border-line/50 bg-sand/90 md:hidden">
        <ul className="flex gap-6 px-5 text-sm whitespace-nowrap" role="list">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="block py-3 text-espresso/75 hover:text-clay">
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/suites" className="block py-3 font-medium text-clay">
              Reserve →
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
