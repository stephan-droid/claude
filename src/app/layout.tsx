import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KI-Workshop Finder – Finden Sie das passende KI-Tool',
  description:
    'Individuell zugeschnittene KI-Tool-Empfehlungen und personalisierte Onlinekurse für Ihren beruflichen Alltag.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" className="fill-primary-600" />
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              KI-Workshop
            </a>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="/" className="hover:text-primary-700 transition-colors">Start</a>
              <a href="/fragebogen" className="hover:text-primary-700 transition-colors">Fragebogen</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} KI-Workshop Finder – Ihr Weg zum passenden KI-Tool</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
