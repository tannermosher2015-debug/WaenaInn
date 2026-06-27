import Link from 'next/link'
import { SITE } from '@/lib/site'
import { CenterMark } from './CenterMark'

export function Footer() {
  return (
    <footer className="mt-28 bg-espresso text-sand/75">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-[1.4fr_1fr_1fr] sm:py-20">
        <div>
          <div className="flex items-center gap-2.5 text-sand">
            <CenterMark className="h-4 w-4 text-brasslt" />
            <p className="font-display text-2xl font-medium">{SITE.name}</p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{SITE.tagline}</p>
        </div>

        <div className="text-sm leading-relaxed">
          <p className="eyebrow !text-sand/45">Visit</p>
          <p className="mt-3 text-sand/80">{SITE.address}</p>
          <a href={`mailto:${SITE.email}`} className="link-underline mt-2 inline-block hover:text-sand">
            {SITE.email}
          </a>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="eyebrow !text-sand/45 !mb-1">Inn</li>
          <li><Link href="/suites" className="link-underline hover:text-sand">Suites</Link></li>
          <li><Link href="/about" className="link-underline hover:text-sand">About</Link></li>
          <li><Link href="/contact" className="link-underline hover:text-sand">Contact</Link></li>
          <li><Link href="/privacy" className="link-underline hover:text-sand">Privacy Policy</Link></li>
          <li><Link href="/terms" className="link-underline hover:text-sand">Terms &amp; Conditions</Link></li>
        </ul>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-sand/10 py-6 text-xs text-sand/55 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name} · Wailuku, Maui</p>
        <p>
          Designed by{' '}
          <a
            href="https://frontlinewebdesign.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-medium text-sand/80 hover:text-sand"
          >
            Frontline Web Designs
          </a>
        </p>
      </div>
    </footer>
  )
}
