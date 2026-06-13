export const SITE = {
  name: 'Waena Inn',
  tagline: 'Boutique Lodging in Wailuku, Maui — Central & Comfortable',
  email: 'uncletonyshale@gmail.com',
  phone: '', // TODO(client): confirm phone or leave email-only
  address: 'Wailuku, Maui, HI', // TODO(client): confirm street address
  url: 'https://waenainn.com', // TODO(client): confirm production domain
  nav: [
    { href: '/', label: 'Home' },
    { href: '/suites', label: 'Suites' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
