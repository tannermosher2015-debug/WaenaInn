import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SuiteCard } from '@/components/SuiteCard'

const suite = {
  id: '14', name: 'Maui Private Suite — Unit 14', slug: 'unit-14', summary: 'Central',
  description: '', photos: ['/suites/unit-14/1.jpg'], pricePerNight: 140, cleaningFee: 75,
  maxGuests: 4, bedrooms: 1, bathrooms: 1, beds: 1, rating: 4.8, reviewCount: 23,
  amenities: ['Free WiFi'], featured: false, blockedDates: [],
}

describe('SuiteCard', () => {
  it('shows name, price, and links to the detail page', () => {
    render(<SuiteCard suite={suite as any} />)
    expect(screen.getByText(/Unit 14/)).toBeInTheDocument()
    expect(screen.getByText(/\$140/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/suites/unit-14')
  })
})
