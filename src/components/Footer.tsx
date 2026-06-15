import Link from 'next/link'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-24 bg-espresso text-sand/80">
      <div className="container-page grid gap-8 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-sand">{SITE.name}</p>
          <p className="mt-2 text-sm">{SITE.tagline}</p>
        </div>
        <div className="text-sm">
          <p>{SITE.address}</p>
          <a href={`mailto:${SITE.email}`} className="hover:text-clay">{SITE.email}</a>
        </div>
        <ul className="space-y-2 text-sm">
          <li><Link href="/privacy" className="hover:text-clay">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-clay">Terms &amp; Conditions</Link></li>
          <li><Link href="/contact" className="hover:text-clay">Contact Us</Link></li>
        </ul>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}</p>
        <p>
          Designed by{' '}
          <a
            href="https://frontlinewebdesign.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sand hover:text-clay"
          >
            Frontline Web Designs
          </a>
        </p>
      </div>
    </footer>
  )
}
