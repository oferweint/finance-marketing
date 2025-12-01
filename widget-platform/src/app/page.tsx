import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { FINANCE_WIDGETS } from '@/types/widgets';

const CATEGORIES = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Social sentiment & velocity tracking for stocks and crypto',
    icon: BarChart3,
    widgetCount: Object.keys(FINANCE_WIDGETS).length,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Brand monitoring, influencer tracking, campaign analytics',
    icon: Users,
    widgetCount: 0,
    color: 'from-purple-500 to-pink-500',
    comingSoon: true,
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Destination trends, airline sentiment, hotel buzz',
    icon: Activity,
    widgetCount: 0,
    color: 'from-green-500 to-emerald-500',
    comingSoon: true,
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Pharma sentiment, clinical trial buzz, health trends',
    icon: Zap,
    widgetCount: 0,
    color: 'from-orange-500 to-red-500',
    comingSoon: true,
  },
];

const FEATURED_WIDGETS = [
  {
    id: 'velocity-tracker',
    name: 'Velocity Tracker',
    description: 'Real-time social mention velocity',
    ticker: 'TSLA',
  },
  {
    id: 'category-heatmap',
    name: 'Category Heatmap',
    description: 'Sector velocity heatmap',
    ticker: null,
  },
  {
    id: 'sentiment-deep-dive',
    name: 'Sentiment Deep Dive',
    description: 'Multi-dimensional sentiment',
    ticker: 'NVDA',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              XPOZ Widgets
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Real-time social intelligence widgets. Track sentiment, velocity, and
            influencer activity. Embed anywhere with one line of code.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/finance"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Browse Widgets
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#embed"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              How to Embed
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Widget Categories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={category.comingSoon ? '#' : `/${category.slug}`}
                className={`relative group bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors ${
                  category.comingSoon ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                {category.comingSoon && (
                  <span className="absolute top-3 right-3 text-xs bg-slate-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {category.description}
                </p>
                {category.widgetCount > 0 && (
                  <span className="text-blue-400 text-sm">
                    {category.widgetCount} widgets
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Widgets */}
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">Featured Widgets</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_WIDGETS.map((widget) => (
              <Link
                key={widget.id}
                href={`/finance/${widget.id}${widget.ticker ? `?ticker=${widget.ticker}` : ''}`}
                className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold">{widget.name}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {widget.description}
                </p>
                {widget.ticker && (
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                    Demo: {widget.ticker}
                  </span>
                )}
                <div className="mt-4 text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Widget
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Embed Section */}
      <section id="embed" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Easy Embedding</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Option 1: Script Tag</h3>
            <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">
{`<div
  data-xpoz-widget="velocity-tracker"
  data-xpoz-ticker="TSLA"
  data-xpoz-auto-refresh="true"
></div>
<script src="https://widgets.xpoz.io/embed.js"></script>`}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Option 2: iframe</h3>
            <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">
{`<iframe
  src="https://widgets.xpoz.io/embed/finance/velocity-tracker?ticker=TSLA"
  width="100%"
  height="500"
  style="border: none; border-radius: 12px;"
></iframe>`}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Widget Parameters</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-3">Parameter</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Example</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-t border-slate-700">
                <td className="py-3 font-mono text-blue-400">data-xpoz-widget</td>
                <td className="py-3">Widget type</td>
                <td className="py-3 font-mono">velocity-tracker</td>
              </tr>
              <tr className="border-t border-slate-700">
                <td className="py-3 font-mono text-blue-400">data-xpoz-ticker</td>
                <td className="py-3">Stock/crypto ticker</td>
                <td className="py-3 font-mono">TSLA, BTC, NVDA</td>
              </tr>
              <tr className="border-t border-slate-700">
                <td className="py-3 font-mono text-blue-400">data-xpoz-auto-refresh</td>
                <td className="py-3">Auto-refresh every 30min</td>
                <td className="py-3 font-mono">true / false</td>
              </tr>
              <tr className="border-t border-slate-700">
                <td className="py-3 font-mono text-blue-400">data-xpoz-width</td>
                <td className="py-3">Widget width</td>
                <td className="py-3 font-mono">100%, 600px</td>
              </tr>
              <tr className="border-t border-slate-700">
                <td className="py-3 font-mono text-blue-400">data-xpoz-height</td>
                <td className="py-3">Widget height</td>
                <td className="py-3 font-mono">500px, 600px</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>XPOZ Widget Platform - Real-time Social Intelligence</p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://xpoz.io"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              XPOZ
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
