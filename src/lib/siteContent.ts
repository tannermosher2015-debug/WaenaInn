import 'server-only'
import fs from 'node:fs'
import path from 'node:path'

export interface SiteContent {
  about: { heading: string; body: string; highlights: string[] }
  testimonials: { name: string; quote: string }[]
}

export function getSiteContent(): SiteContent {
  const file = path.join(process.cwd(), 'content', 'site.json')
  return JSON.parse(fs.readFileSync(file, 'utf8')) as SiteContent
}
