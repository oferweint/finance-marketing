import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XPOZ Finance Widgets | Social Intelligence for Markets',
  description: 'Transform social data into actionable financial insights with 15 AI-powered widgets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  XPOZ
                </span>
                <span className="text-gray-400 text-sm">Finance</span>
              </a>
              <div className="flex items-center space-x-6">
                <a href="/widgets" className="text-gray-300 hover:text-white transition">
                  Widgets
                </a>
                <a href="/integrate" className="text-gray-300 hover:text-white transition">
                  Integrate
                </a>
                <a
                  href="https://github.com/xpoz/finance-widgets"
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
        <footer className="border-t border-gray-800 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>Built on XPOZ social intelligence infrastructure</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
