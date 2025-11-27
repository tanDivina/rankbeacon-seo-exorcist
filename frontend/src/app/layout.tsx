import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '👻 RankBeacon SEO Exorcist',
  description: 'AI-powered SEO monitoring with supernatural twist - Banish your SEO demons',
  keywords: ['SEO', 'AI', 'monitoring', 'exorcist', 'supernatural', 'website analysis'],
  authors: [{ name: 'RankBeacon Team' }],
  openGraph: {
    title: '👻 RankBeacon SEO Exorcist',
    description: 'Banish your SEO demons with AI-powered supernatural monitoring',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
          {children}
        </div>
      </body>
    </html>
  )
}
