export const SITE = {
  name: 'Waena Inn',
  tagline: 'Boutique Lodging in Wailuku, Maui — Central & Comfortable',
  email: 'uncletonyshale@gmail.com',
  phone: '', // TODO(client): confirm phone or leave email-only
  address: 'Wailuku, Maui, HI', // TODO(client): confirm street address
  mapQuery: 'Waena Inn, Wailuku, HI', // pins the Google Business listing on the embedded map
  googleUrl: 'https://www.google.com/maps/search/?api=1&query=Waena+Inn+Wailuku+HI', // opens the Google listing / reviews
  url: 'https://waenainn.com', // TODO(client): confirm production domain
  nav: [
    { href: '/', label: 'Home' },
    { href: '/suites', label: 'Suites' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
