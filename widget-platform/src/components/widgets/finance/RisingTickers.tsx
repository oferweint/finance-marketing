'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Flame, TrendingUp, Clock, Filter } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface RisingTickersProps {
  ticker?: string;
  category?: string;
  autoRefresh?: boolean;
}

interface RisingTicker {
  ticker: string;
  name: string;
  velocity: number;
  velocityChange: number;
  mentions: number;
  category: string;
  timeDiscovered: string;
}

interface RisingTickersData {
  tickers: RisingTicker[];
  totalDiscovered: number;
  generatedAt: string;
}

const MOCK_TICKERS = [
  { ticker: 'SMCI', name: 'Super Micro Computer', category: 'Tech' },
  { ticker: 'ARM', name: 'ARM Holdings', category: 'Semiconductors' },
  { ticker: 'PLTR', name: 'Palantir', category: 'AI' },
  { ticker: 'IONQ', name: 'IonQ', category: 'Quantum' },
  { ticker: 'RKLB', name: 'Rocket Lab', category: 'Space' },
  { ticker: 'MSTR', name: 'MicroStrategy', category: 'Crypto' },
  { ticker: 'SOUN', name: 'SoundHound AI', category: 'AI' },
  { ticker: 'LUNR', name: 'Intuitive Machines', category: 'Space' },
];

const generateMockData = (): RisingTickersData => {
  const now = new Date();

  const tickers: RisingTicker[] = MOCK_TICKERS.map((t, i) => ({
    ...t,
    velocity: 5 + Math.random() * 5,
    velocityChange: 20 + Math.random() * 80,
    mentions: Math.round(50 + Math.random() * 500),
    timeDiscovered: new Date(now.getTime() - i * 1800000).toISOString(),
  })).sort((a, b) => b.velocityChange - a.velocityChange);

  return {
    tickers,
    totalDiscovered: tickers.length,
    generatedAt: now.toISOString(),
  };
};

function getHeatColor(velocity: number): string {
  if (velocity >= 8.5) return 'bg-rose-600';
  if (velocity >= 7.5) return 'bg-red-500';
  if (velocity >= 6.5) return 'bg-orange-500';
  if (velocity >= 5.5) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function RisingTickersContent({
  data,
  isLoading,
}: {
  data: RisingTickersData | null;
  isLoading: boolean;
}) {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { tickers = [], totalDiscovered = 0 } = data;

  const categories = [...new Set((tickers || []).map(t => t.category))];
  const filteredTickers = filterCategory
    ? tickers.filter(t => t.category === filterCategory)
    : tickers;

  const chartData = filteredTickers.slice(0, 8).map(t => ({
    name: t.ticker,
    change: t.velocityChange,
  }));

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Rising Tickers</h1>
            <p className="text-slate-400 text-sm">
              Emerging assets gaining social attention
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-orange-400" suppressHydrationWarning>{totalDiscovered}</div>
          <div className="text-slate-400 text-sm">Discovered Today</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filterCategory === null
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-3 h-3 inline mr-1" />
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterCategory === cat
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">Velocity Change %</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid {...chartConfig.grid} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={60}
            />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
              formatter={(value: number) => [`+${value.toFixed(0)}%`, 'Change']}
            />
            <Bar dataKey="change" fill="#f97316" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ticker List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Rising Tickers</h3>
        <div className="space-y-3">
          {filteredTickers.map((ticker, i) => (
            <div
              key={ticker.ticker}
              className="flex items-center gap-4 py-3 border-b border-slate-700 last:border-0"
            >
              <div className="w-8 text-slate-400 text-sm font-bold">#{i + 1}</div>
              <div className={`w-12 h-12 rounded-lg ${getHeatColor(ticker.velocity)} flex items-center justify-center font-bold`} suppressHydrationWarning>
                {ticker.velocity.toFixed(1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{ticker.ticker}</span>
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{ticker.category}</span>
                </div>
                <div className="text-sm text-slate-400">{ticker.name}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 font-bold" suppressHydrationWarning>
                  <TrendingUp className="w-4 h-4" />
                  +{ticker.velocityChange.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3 h-3" />
                  {new Date(ticker.timeDiscovered).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium" suppressHydrationWarning>{ticker.mentions}</div>
                <div className="text-xs text-slate-400">mentions</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RisingTickers({ ticker, category, autoRefresh }: RisingTickersProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="rising-tickers"
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: RisingTickersData } | null;
        const data = apiResponse?.data || generateMockData();
        return <RisingTickersContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default RisingTickers;
