const BASE_URL = 'https://aquadorcy.com';

export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BASE_URL}/about#webpage`,
  url: `${BASE_URL}/about`,
  name: "About Aquad'or",
  description: "Cyprus's premier luxury fragrance house in Nicosia.",
  isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website` },
  about: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
};

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${BASE_URL}/contact#webpage`,
  url: `${BASE_URL}/contact`,
  name: "Contact Aquad'or",
  description: 'Visit our Nicosia boutique or contact us for fragrance consultations.',
  mainEntity: {
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: "Aquad'or",
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledra 145',
      addressLocality: 'Nicosia',
      postalCode: '1011',
      addressCountry: 'CY',
    },
    telephone: '+357-99-980809',
    email: 'info@aquadorcy.com',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '12:00', closes: '18:00' },
    ],
  },
};

export const shippingPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/shipping#webpage`,
  url: `${BASE_URL}/shipping`,
  name: 'Shipping & Returns',
  description: 'Same-day delivery in Nicosia, 1-3 days across Cyprus. 14-day returns on unopened items.',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '.shipping-summary'],
  },
};

export const createPerfumeServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE_URL}/create-perfume#service`,
  name: 'Bespoke Perfume Creation',
  serviceType: 'Custom fragrance design',
  provider: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
  areaServed: { '@type': 'Country', name: 'Cyprus' },
  offers: [
    { '@type': 'Offer', name: 'Custom Perfume 50ml', price: '29.99', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Custom Perfume 100ml', price: '199.00', priceCurrency: 'EUR' },
  ],
  description: 'Design your own custom perfume from floral, fruity, woody, oriental, and gourmand notes.',
};

