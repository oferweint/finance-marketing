'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  ArrowRight,
  Grid,
  List,
} from 'lucide-react';
import { FINANCE_WIDGETS } from '@/types/widgets';

const WIDGET_ICONS: Record<string, typeof Activity> = {
  'velocity-tracker': Activity,
  'acceleration-alerts': TrendingUp,
  'category-heatmap': Grid,
  'influencer-radar': Users,
  'position-tracker': Activity,
  'rising-tickers': TrendingUp,
  'sentiment-deep-dive': BarChart3,
  'portfolio-aggregator': Grid,
  'correlation-radar': Activity,
  'quality-index': Users,
  'sentiment-shift': TrendingUp,
  'volume-anomaly': BarChart3,
  'narrative-tracker': BarChart3,
  'divergence-detector': Activity,
  'basket-builder': Grid,
};

const DEFAULT_TICKERS: Record<string, string> = {
  'velocity-tracker': 'TSLA',
  'acceleration-alerts': 'NVDA',
  'category-heatmap': '',
  'influencer-radar': 'BTC',
  'position-tracker': 'AAPL',
  'rising-tickers': '',
  'sentiment-deep-dive': 'GOOGL',
  'portfolio-aggregator': 'TSLA,NVDA,AAPL',
  'correlation-radar': 'BTC',
  'quality-index': 'DOGE',
  'sentiment-shift': 'META',
  'volume-anomaly': 'COIN',
  'narrative-tracker': 'NVDA',
  'divergence-detector': 'TSLA',
  'basket-builder': '',
};

export default function FinanceCategoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const widgets = Object.entries(FINANCE_WIDGETS).map(([id, config]) => ({
    ...config,
    id,
  }));

  const filteredWidgets = widgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">XPOZ</span>
            <span className="text-sm text-slate-500">Widgets</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/finance" className="text-blue-600 text-sm font-medium">
              Finance
            </Link>
            <a href="/#embed" className="text-slate-600 hover:text-slate-800 text-sm font-medium">
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

      {/* Header */}
      <section className="hero-gradient text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Finance</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Finance Widgets</h1>
              <p className="text-white/70">
                {widgets.length} widgets for social sentiment & velocity tracking
              </p>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Track real-time social mentions, sentiment, and velocity for stocks
            and crypto. All widgets include manual refresh and optional 30-minute
            auto-refresh.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-slate-600'
                } transition-colors`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-slate-600'
                } transition-colors`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Grid/List */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {filteredWidgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No widgets found matching &quot;{searchQuery}&quot;</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWidgets.map((widget) => {
              const Icon = WIDGET_ICONS[widget.id] || Activity;
              const defaultTicker = DEFAULT_TICKERS[widget.id];
              const href = `/finance/${widget.id}${defaultTicker ? `?ticker=${defaultTicker}` : ''}`;

              return (
                <Link
                  key={widget.id}
                  href={href}
                  className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                    {defaultTicker && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Demo: {defaultTicker}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {widget.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {widget.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {widget.inputs.some(i => i.type === 'ticker') && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                          Ticker
                        </span>
                      )}
                      {widget.inputs.some(i => i.type === 'tickers') && (
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                          Multi-Ticker
                        </span>
                      )}
                    </div>
                    <div className="text-blue-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWidgets.map((widget) => {
              const Icon = WIDGET_ICONS[widget.id] || Activity;
              const defaultTicker = DEFAULT_TICKERS[widget.id];
              const href = `/finance/${widget.id}${defaultTicker ? `?ticker=${defaultTicker}` : ''}`;

              return (
                <Link
                  key={widget.id}
                  href={href}
                  className="group flex items-center gap-6 bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {widget.name}
                    </h3>
                    <p className="text-slate-500 text-sm truncate">
                      {widget.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {defaultTicker && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Demo: {defaultTicker}
                      </span>
                    )}
                    <div className="text-blue-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Embed CTA */}
      <section className="section-dark">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Embed These Widgets</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            All widgets can be embedded on your website with a simple iframe or
            script tag. Check each widget page for the embed code.
          </p>
          <Link
            href="/#embed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            View Embed Documentation
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
