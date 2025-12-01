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
import { FINANCE_WIDGETS, WidgetConfig } from '@/types/widgets';

const WIDGET_ICONS: Record<string, typeof Activity> = {
  'velocity-tracker': Activity,
  'category-heatmap': Grid,
  'sentiment-deep-dive': BarChart3,
  'momentum-scanner': TrendingUp,
  'influencer-radar': Users,
  'social-pulse': Activity,
  'breakout-detector': TrendingUp,
  'narrative-tracker': BarChart3,
  'correlation-matrix': Grid,
  'alert-dashboard': Activity,
  'whale-tracker': Users,
  'sector-rotation': BarChart3,
  'event-impact': Activity,
  'liquidity-gauge': BarChart3,
  'risk-sentiment': TrendingUp,
};

const DEFAULT_TICKERS: Record<string, string> = {
  'velocity-tracker': 'TSLA',
  'category-heatmap': '',
  'sentiment-deep-dive': 'NVDA',
  'momentum-scanner': 'AAPL',
  'influencer-radar': 'BTC',
  'social-pulse': 'META',
  'breakout-detector': 'AMZN',
  'narrative-tracker': 'MSFT',
  'correlation-matrix': '',
  'alert-dashboard': '',
  'whale-tracker': 'ETH',
  'sector-rotation': '',
  'event-impact': 'GOOGL',
  'liquidity-gauge': 'SOL',
  'risk-sentiment': 'SPY',
};

export default function FinanceCategoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const widgets = Object.entries(FINANCE_WIDGETS).map(([id, config]) => ({
    ...config,
    id, // override with the key in case config.id differs
  }));

  const filteredWidgets = widgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Finance</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Finance Widgets</h1>
              <p className="text-slate-400">
                {widgets.length} widgets for social sentiment & velocity tracking
              </p>
            </div>
          </div>
          <p className="text-slate-300 max-w-2xl">
            Track real-time social mentions, sentiment, and velocity for stocks
            and crypto. All widgets include manual refresh and optional 30-minute
            auto-refresh.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              } transition-colors`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              } transition-colors`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Widget Grid/List */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        {filteredWidgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No widgets found matching "{searchQuery}"</p>
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
                  className="group bg-slate-800 rounded-xl p-6 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    {defaultTicker && (
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        Demo: {defaultTicker}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {widget.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {widget.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {widget.requiresTicker && (
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                          Ticker
                        </span>
                      )}
                      {widget.supportsTickers && (
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                          Multi-Ticker
                        </span>
                      )}
                    </div>
                    <div className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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
                  className="group flex items-center gap-6 bg-slate-800 rounded-xl p-4 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
                      {widget.name}
                    </h3>
                    <p className="text-slate-400 text-sm truncate">
                      {widget.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {defaultTicker && (
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        Demo: {defaultTicker}
                      </span>
                    )}
                    <div className="text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
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
      <section className="border-t border-slate-800 bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Embed These Widgets</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            All widgets can be embedded on your website with a simple iframe or
            script tag. Check each widget page for the embed code.
          </p>
          <Link
            href="/#embed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            View Embed Documentation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
