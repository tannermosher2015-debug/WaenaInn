export interface QuoteInput { pricePerNight: number; cleaningFee: number; nights: number; taxRate: number }
export interface Quote {
  nights: number; subtotal: number; cleaningFee: number; taxableBase: number
  taxRate: number; tax: number; total: number; amountCents: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function quote({ pricePerNight, cleaningFee, nights, taxRate }: QuoteInput): Quote {
  if (nights < 1) throw new Error('nights must be >= 1')
  const subtotal = round2(pricePerNight * nights)
  const taxableBase = round2(subtotal + cleaningFee)
  const tax = round2(taxableBase * taxRate)
  const total = round2(taxableBase + tax)
  return { nights, subtotal, cleaningFee, taxableBase, taxRate, tax, total, amountCents: Math.round(total * 100) }
}
