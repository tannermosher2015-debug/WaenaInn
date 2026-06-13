import type { MetadataRoute } from 'next'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/suites', '/about', '/contact'].map((p) => ({ url: `${SITE.url}${p}` }))
  const suites = getAllSuites().map((s) => ({ url: `${SITE.url}/suites/${s.slug}` }))
  return [...routes, ...suites]
}
