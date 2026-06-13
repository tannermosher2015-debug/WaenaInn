import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Button } from './Button'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-taupe/60 bg-sand/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">{SITE.name}</Link>
        <ul className="hidden gap-8 text-sm md:flex">
          {SITE.nav.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-clay">{n.label}</Link></li>)}
        </ul>
        <Button href="/suites" className="hidden md:inline-flex">Book a Stay</Button>
      </nav>
      {/* Mobile nav — visible below md breakpoint, accessible real links */}
      <div className="md:hidden overflow-x-auto border-t border-taupe/40 bg-sand/95">
        <ul className="flex gap-6 px-5 py-2 text-sm whitespace-nowrap" role="list">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="block py-1 hover:text-clay">{n.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
