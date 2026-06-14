import 'server-only'
import fs from 'node:fs'
import path from 'node:path'

export interface SiteContent {
  about: {
    heading: string
    intro: string
    body: string[]
    closing: string
    highlights: string[]
  }
  testimonials: {
    name: string
    rating: number
    date: string
    badge?: string
    text: string
    response?: string
    photos?: string[]
  }[]
}

export function getSiteContent(): SiteContent {
  const file = path.join(process.cwd(), 'content', 'site.json')
  return JSON.parse(fs.readFileSync(file, 'utf8')) as SiteContent
}
