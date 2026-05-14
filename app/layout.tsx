import type { Metadata, Viewport } from 'next'
import { Poppins, Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SettingsProvider } from '@/components/settings-provider'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
})

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  variable: "--font-roboto-mono"
})

export const metadata: Metadata = {
  title: "Bizlink - Golden's Business Platform",
  description: "B2B product display and networking platform by Golden techS. Connect with companies worldwide.",
  generator: 'Golden techS',
  applicationName: 'Bizlink',
  keywords: ['B2B', 'business', 'products', 'networking', 'wholesale', 'manufacturing'],
  authors: [{ name: "Golden's (Golden techS)" }],
  creator: "Golden's (Golden techS)",
  publisher: "Golden's (Golden techS)",
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Bizlink',
    title: "Bizlink - Golden's Business Platform",
    description: "B2B product display and networking platform by Golden techS",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5c000' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${robotoMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        <SettingsProvider>
          {children}
        </SettingsProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
