'use client';

import React, { useState } from 'react';
import { Grid, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { CategoryHeatmapData, CategoryData, TickerHeat, Trend } from '@/types/widgets';

interface CategoryHeatmapProps {
  autoRefresh?: boolean;
}

const CATEGORIES = [
  { name: 'Tech Giants', tickers: ['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN'] },
  { name: 'AI & Chips', tickers: ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO'] },
  { name: 'EV & Energy', tickers: ['TSLA', 'RIVN', 'LCID', 'NIO', 'PLUG'] },
  { name: 'Crypto', tickers: ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'] },
  { name: 'Finance', tickers: ['JPM', 'GS', 'MS', 'BAC', 'C'] },
];

const generateMockData = (): CategoryHeatmapData => {
  const now = new Date();

  const categories: CategoryData[] = CATEGORIES.map(cat => {
    const tickers: TickerHeat[] = cat.tickers.map(ticker => {
      const velocity = 2 + Math.random() * 8;
      const trends: Trend[] = ['accelerating', 'decelerating', 'stable'];
      return {
        ticker,
        velocity,
        mentions: Math.round(20 + Math.random() * 200),
        trend: trends[Math.floor(Math.random() * 3)],
      };
    });

    const avgVelocity = tickers.reduce((sum, t) => sum + t.velocity, 0) / tickers.length;

    return {
      name: cat.name,
      avgVelocity,
      tickers,
    };
  });

  return {
    categories,
    generatedAt: now.toISOString(),
  };
};

function getHeatColor(velocity: number): string {
  if (velocity >= 8.5) return 'bg-rose-600';
  if (velocity >= 7.5) return 'bg-red-500';
  if (velocity >= 6.5) return 'bg-orange-500';
  if (velocity >= 5.5) return 'bg-amber-500';
  if (velocity >= 4.5) return 'bg-emerald-500';
  if (velocity >= 3.5) return 'bg-cyan-500';
  return 'bg-blue-600';
}

function CategoryHeatmapContent({
  data,
  isLoading,
}: {
  data: CategoryHeatmapData | null;
  isLoading: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { categories = [] } = data;

  const TrendIcon = ({ trend }: { trend: Trend }) => {
    if (trend === 'accelerating') return <span suppressHydrationWarning><TrendingUp className="w-3 h-3 text-green-400" /></span>;
    if (trend === 'decelerating') return <span suppressHydrationWarning><TrendingDown className="w-3 h-3 text-red-400" /></span>;
    return <span suppressHydrationWarning><Minus className="w-3 h-3 text-gray-400" /></span>;
  };

  const selectedCategoryData = selectedCategory
    ? categories.find(c => c.name === selectedCategory)
    : null;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">Category Heatmap Today</h1>
            <p className="text-slate-400 text-sm">
              Today's social velocity across market sectors
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid gap-4 mb-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`bg-slate-800 rounded-lg p-4 cursor-pointer transition-all ${
              selectedCategory === category.name ? 'ring-2 ring-blue-500' : 'hover:bg-slate-750'
            }`}
            onClick={() => setSelectedCategory(
              selectedCategory === category.name ? null : category.name
            )}
            suppressHydrationWarning
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{category.name}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getHeatColor(category.avgVelocity)}`} suppressHydrationWarning>
                Avg: {category.avgVelocity.toFixed(1)}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2" suppressHydrationWarning>
              {category.tickers.map((ticker) => (
                <div
                  key={ticker.ticker}
                  className={`${getHeatColor(ticker.velocity)} rounded-lg p-3 text-center transition-transform hover:scale-105`}
                  suppressHydrationWarning
                >
                  <div className="font-bold text-sm">{ticker.ticker}</div>
                  <div className="text-lg font-bold" suppressHydrationWarning>{ticker.velocity.toFixed(1)}</div>
                  <div className="flex items-center justify-center gap-1 text-xs opacity-80" suppressHydrationWarning>
                    <TrendIcon trend={ticker.trend} />
                    <span suppressHydrationWarning>{ticker.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Category Detail */}
      {selectedCategoryData && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">{selectedCategoryData.name} Detail</h3>
          <div className="space-y-3">
            {selectedCategoryData.tickers
              .sort((a, b) => b.velocity - a.velocity)
              .map((ticker, i) => (
                <div key={ticker.ticker} className="flex items-center gap-4">
                  <div className="w-8 text-slate-400 text-sm">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{ticker.ticker}</span>
                      <span className="text-sm" suppressHydrationWarning>{ticker.velocity.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden" suppressHydrationWarning>
                      <div
                        className={`h-full ${getHeatColor(ticker.velocity)} transition-all`}
                        style={{ width: `${(ticker.velocity / 10) * 100}%` }}
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400" suppressHydrationWarning>
                    <TrendIcon trend={ticker.trend} />
                    <span suppressHydrationWarning>{ticker.mentions}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-rose-600">8.5+ Very Hot</span>
        <span className="px-2 py-1 rounded bg-red-500">7.5+ Hot</span>
        <span className="px-2 py-1 rounded bg-orange-500">6.5+ Elevated</span>
        <span className="px-2 py-1 rounded bg-amber-500">5.5+ Above</span>
        <span className="px-2 py-1 rounded bg-emerald-500">4.5+ Normal</span>
        <span className="px-2 py-1 rounded bg-cyan-500">3.5+ Below</span>
        <span className="px-2 py-1 rounded bg-blue-600">&lt;3.5 Cold</span>
      </div>
    </div>
  );
}

export function CategoryHeatmap({ autoRefresh }: CategoryHeatmapProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="category-heatmap"
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        // Don't use generateMockData() - causes hydration errors due to Math.random()
        const apiResponse = rawData as { success: boolean; data: CategoryHeatmapData } | null;
        const data = apiResponse?.data || null;
        return <CategoryHeatmapContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default CategoryHeatmap;
