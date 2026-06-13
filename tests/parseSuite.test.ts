import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { parseSuiteCards, parseListingPage } from '../scripts/parseSuite'

const html = fs.readFileSync('tests/fixtures/suite.html', 'utf8')
const listingHtml = fs.readFileSync('tests/fixtures/listing-343003.html', 'utf8')

describe('parseSuiteCards', () => {
  const cards = parseSuiteCards(html)
  it('finds multiple suites', () => { expect(cards.length).toBeGreaterThan(1) })
  it('each has a name and photo', () => {
    for (const c of cards) {
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.photoUrls.length).toBeGreaterThan(0)
    }
  })
})

describe('parseListingPage', () => {
  const suite = parseListingPage(listingHtml)
  it('parses name', () => { expect(suite?.name).toContain('Maui Private Suite') })
  it('parses price', () => { expect(suite?.priceText).toBe('200') })
  it('parses rating', () => { expect(Number(suite?.ratingText)).toBeGreaterThan(4) })
  it('has multiple photos', () => { expect(suite?.photoUrls.length).toBeGreaterThan(1) })
  it('has a description', () => { expect(suite?.description?.length).toBeGreaterThan(50) })
})
