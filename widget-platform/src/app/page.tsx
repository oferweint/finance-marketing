import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Code,
  RefreshCw,
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
    description: 'Real-time social mention velocity normalized against hourly baselines',
    ticker: 'TSLA',
    emoji: '🚀',
  },
  {
    id: 'category-heatmap',
    name: 'Category Heatmap',
    description: 'Visual heatmap of social velocity across market sectors',
    ticker: null,
    emoji: '🗺️',
  },
  {
    id: 'sentiment-deep-dive',
    name: 'Sentiment Deep Dive',
    description: 'Multi-dimensional sentiment analysis with sample posts',
    ticker: 'NVDA',
    emoji: '📊',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">XPOZ</span>
            <span className="text-sm text-slate-500">Widgets</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/finance" className="text-slate-600 hover:text-slate-800 text-sm font-medium">
              Finance
            </Link>
            <a href="#embed" className="text-slate-600 hover:text-slate-800 text-sm font-medium">
              Embed
            </a>
            <a
              href="https://xpoz.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              XPOZ.ai
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Purple to Blue Gradient */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-violet-200 text-sm font-medium mb-4">
              Embeddable Social Intelligence
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Real-time Social Widgets for{' '}
              <span className="text-white/90">Finance & Beyond</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              Track sentiment, velocity, and influencer activity on any asset.{' '}
              <strong className="text-white">Embed anywhere with one line of code.</strong>
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/finance"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                Browse Widgets
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#embed"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
              >
                View Embed Code
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold">{Object.keys(FINANCE_WIDGETS).length}</div>
              <div className="text-white/60 text-sm">Finance Widgets</div>
            </div>
            <div>
              <div className="text-3xl font-bold">30 sec</div>
              <div className="text-white/60 text-sm">Setup Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Free</div>
              <div className="text-white/60 text-sm">To Get Started</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Widget Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose from specialized widget categories for different industries
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={category.comingSoon ? '#' : `/${category.slug}`}
                  className={`relative bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all ${
                    category.comingSoon ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  {category.comingSoon && (
                    <span className="absolute top-3 right-3 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{category.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {category.description}
                  </p>
                  {category.widgetCount > 0 && (
                    <span className="text-blue-500 text-sm font-medium">
                      {category.widgetCount} widgets →
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Widgets */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Try These Widgets</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Popular widgets you can start using immediately
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_WIDGETS.map((widget) => (
              <Link
                key={widget.id}
                href={`/finance/${widget.id}${widget.ticker ? `?ticker=${widget.ticker}` : ''}`}
                className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-4">{widget.emoji}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {widget.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  {widget.description}
                </p>
                {widget.ticker && (
                  <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Demo: {widget.ticker}
                  </span>
                )}
                <div className="mt-4 text-blue-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 section-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-sm font-medium mb-2">Built For Real Work</p>
            <h2 className="text-3xl font-bold text-white mb-4">Why XPOZ Widgets?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Where finance and social voices meet together — Get real-time social signals on any financial asset you choose
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <Code className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">One-Line Embed</h3>
              <p className="text-slate-400 text-sm">
                Add widgets to any website with a single script tag or iframe
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <RefreshCw className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Auto-Refresh</h3>
              <p className="text-slate-400 text-sm">
                Optional 30-minute auto-refresh keeps data current without manual intervention
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Data</h3>
              <p className="text-slate-400 text-sm">
                Powered by XPOZ&apos;s 1.5B+ indexed posts with live social intelligence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Section */}
      <section id="embed" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Easy Embedding</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose your preferred method to embed widgets on your website
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🌐</span>
                <h3 className="text-lg font-bold text-slate-800">Script Tag</h3>
              </div>
              <div className="code-block">
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
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📦</span>
                <h3 className="text-lg font-bold text-slate-800">iframe</h3>
              </div>
              <div className="code-block">
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

          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Widget Parameters</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-3 font-medium">Parameter</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Example</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-mono text-blue-600">data-xpoz-widget</td>
                  <td className="py-3">Widget type</td>
                  <td className="py-3 font-mono text-slate-500">velocity-tracker</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-mono text-blue-600">data-xpoz-ticker</td>
                  <td className="py-3">Stock/crypto ticker</td>
                  <td className="py-3 font-mono text-slate-500">TSLA, BTC, NVDA</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-mono text-blue-600">data-xpoz-auto-refresh</td>
                  <td className="py-3">Auto-refresh every 30min</td>
                  <td className="py-3 font-mono text-slate-500">true / false</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-mono text-blue-600">data-xpoz-width</td>
                  <td className="py-3">Widget width</td>
                  <td className="py-3 font-mono text-slate-500">100%, 600px</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-blue-600">data-xpoz-height</td>
                  <td className="py-3">Widget height</td>
                  <td className="py-3 font-mono text-slate-500">500px, 600px</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 hero-gradient text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8">
            Browse our widget library and start embedding social intelligence today
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/finance"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="https://help.xpoz.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 XPOZ. Built with ❤️ for the AI community.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://xpoz.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                XPOZ.ai
              </a>
              <a
                href="https://help.xpoz.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Documentation
              </a>
              <a
                href="https://github.com/hossenco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
