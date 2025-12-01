import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/QueryProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'XPOZ Widgets - Real-time Social Intelligence',
  description:
    'Embeddable widgets for tracking social sentiment, velocity, and influencer activity on financial assets.',
  keywords: [
    'social sentiment',
    'stock analysis',
    'crypto',
    'twitter analytics',
    'financial widgets',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-800 min-h-screen`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
