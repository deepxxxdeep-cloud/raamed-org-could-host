import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://raamed.online'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Raamed | Premium Medical Equipment & Healthcare Solutions (RAAMED / RAMMED)',
    template: '%s | Raamed Medical Equipment',
  },
  description: 'Raamed (RAAMED / RAMMED) is India’s leading medical equipment partner. Providing patient monitors, surgical lights, endoscopes, and hospital supplies to care teams, clinics, and hospitals.',
  keywords: [
    'RAAMED',
    'RAMMED',
    'Raamed',
    'Rammed',
    'Raamed Online',
    'raamed.online',
    'Raamed Medical',
    'Raamed Medical Equipment',
    'Raamed Healthcare',
    'Rammed Medical',
    'Medical Equipment India',
    'Hospital Equipment',
    'Patient Monitor',
    'LED Surgical Light',
    'Endoscope',
    'Clinical Partner',
    'Healthcare Solutions'
  ],
  authors: [{ name: 'Raamed Medical Equipment', url: baseUrl }],
  creator: 'Raamed Healthcare',
  publisher: 'Raamed Online',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: 'Raamed Medical (RAAMED / RAMMED)',
    title: 'Raamed | Dependable Medical & Clinical Equipment',
    description: 'Raamed (RAAMED / RAMMED) delivers reliable medical equipment, patient monitors, surgical lighting & diagnostic tools for hospitals and clinics across India.',
    images: [
      {
        url: '/raamed-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Raamed Medical Equipment (RAAMED / RAMMED)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raamed | Medical Equipment & Clinical Solutions (RAAMED / RAMMED)',
    description: 'Raamed (RAAMED / RAMMED) - Reliable medical devices and hospital equipment for clinics and care teams.',
    images: ['/raamed-logo.jpg'],
  },
  icons: {
    icon: '/raamed-logo.jpg',
    apple: '/raamed-logo.jpg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#102a43' },
  ],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Raamed',
      alternateName: ['RAAMED', 'RAMMED', 'Rammed', 'Raamed Medical', 'Raamed Online', 'Raamed Healthcare'],
      url: baseUrl,
      logo: `${baseUrl}/raamed-logo.jpg`,
      image: `${baseUrl}/raamed-logo.jpg`,
      description: 'Raamed (RAAMED / RAMMED) is a trusted provider of clinical and medical equipment including patient monitors, surgical lights, and diagnostic tools for hospitals and clinics.',
      telephone: '011-36650267',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '011-36650267',
        contactType: 'sales and support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
    },
    {
      '@type': 'MedicalBusiness',
      '@id': `${baseUrl}/#medicalbusiness`,
      name: 'Raamed Medical Equipment',
      alternateName: ['RAAMED', 'RAMMED', 'Rammed Medical'],
      url: baseUrl,
      logo: `${baseUrl}/raamed-logo.jpg`,
      telephone: '011-36650267',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'DDA BUILDING, LAXMI NAGAR COMMERCIAL COMPLEX',
        addressLocality: 'Delhi',
        postalCode: '110092',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Raamed',
      alternateName: ['RAAMED', 'RAMMED', 'Raamed Online'],
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

import { LanguageProvider } from '@/lib/language-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#f7fafb]">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
