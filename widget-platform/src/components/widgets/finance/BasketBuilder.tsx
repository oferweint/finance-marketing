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
  Cell,
} from 'recharts';
import { ShoppingBasket, TrendingUp, Star, Filter } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig, CHART_COLORS } from '@/lib/theme';

interface BasketBuilderProps {
  ticker?: string;
  theme?: string;
  autoRefresh?: boolean;
}

interface BasketTicker {
  ticker: string;
  name: string;
  sentiment: number;
  velocity: number;
  mentions: number;
  score: number;
  reason: string;
}

interface BasketData {
  theme: string;
  tickers: BasketTicker[];
  averageSentiment: number;
  averageVelocity: number;
  totalMentions: number;
  generatedAt: string;
}

const THEME_TICKERS: Record<string, { ticker: string; name: string; reason: string }[]> = {
  'AI stocks': [
    { ticker: 'NVDA', name: 'NVIDIA', reason: 'Leading AI chip maker' },
    { ticker: 'MSFT', name: 'Microsoft', reason: 'OpenAI partnership' },
    { ticker: 'GOOGL', name: 'Alphabet', reason: 'Gemini AI development' },
    { ticker: 'AMD', name: 'AMD', reason: 'AI GPU competition' },
    { ticker: 'PLTR', name: 'Palantir', reason: 'Enterprise AI solutions' },
  ],
  'EV stocks': [
    { ticker: 'TSLA', name: 'Tesla', reason: 'Market leader' },
    { ticker: 'RIVN', name: 'Rivian', reason: 'Electric trucks' },
    { ticker: 'LCID', name: 'Lucid', reason: 'Luxury EVs' },
    { ticker: 'NIO', name: 'NIO', reason: 'China EV leader' },
    { ticker: 'F', name: 'Ford', reason: 'EV transition' },
  ],
  'Crypto': [
    { ticker: 'BTC', name: 'Bitcoin', reason: 'Digital gold' },
    { ticker: 'ETH', name: 'Ethereum', reason: 'Smart contracts' },
    { ticker: 'SOL', name: 'Solana', reason: 'High speed chain' },
    { ticker: 'COIN', name: 'Coinbase', reason: 'Crypto exchange' },
    { ticker: 'MSTR', name: 'MicroStrategy', reason: 'BTC treasury' },
  ],
  default: [
    { ticker: 'AAPL', name: 'Apple', reason: 'Tech leader' },
    { ticker: 'AMZN', name: 'Amazon', reason: 'E-commerce king' },
    { ticker: 'META', name: 'Meta', reason: 'Social media' },
    { ticker: 'NFLX', name: 'Netflix', reason: 'Streaming' },
    { ticker: 'GOOG', name: 'Google', reason: 'Search' },
  ],
};

const generateMockData = (theme: string): BasketData => {
  const now = new Date();
  const tickerList = THEME_TICKERS[theme] || THEME_TICKERS.default;

  const tickers: BasketTicker[] = tickerList.map((t) => {
    const sentiment = Math.round(40 + Math.random() * 35);
    const velocity = 3 + Math.random() * 5;
    const mentions = Math.round(50 + Math.random() * 400);
    const score = Math.round((sentiment * 0.4 + velocity * 8 + Math.min(mentions / 10, 20)) / 1.2);

    return {
      ...t,
      sentiment,
      velocity,
      mentions,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  const averageSentiment = Math.round(tickers.reduce((sum, t) => sum + t.sentiment, 0) / tickers.length);
  const averageVelocity = tickers.reduce((sum, t) => sum + t.velocity, 0) / tickers.length;
  const totalMentions = tickers.reduce((sum, t) => sum + t.mentions, 0);

  return {
    theme,
    tickers,
    averageSentiment,
    averageVelocity,
    totalMentions,
    generatedAt: now.toISOString(),
  };
};

function BasketBuilderContent({
  data,
  isLoading,
}: {
  data: BasketData | null;
  isLoading: boolean;
}) {
  const [sortBy, setSortBy] = useState<'score' | 'sentiment' | 'velocity'>('score');

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { theme, tickers = [], averageSentiment = 50, averageVelocity = 0, totalMentions = 0 } = data;

  const sortedTickers = [...(tickers || [])].sort((a, b) => {
    if (sortBy === 'sentiment') return b.sentiment - a.sentiment;
    if (sortBy === 'velocity') return b.velocity - a.velocity;
    return b.score - a.score;
  });

  const chartData = sortedTickers.map((t, i) => ({
    ticker: t.ticker,
    score: t.score,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBasket className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold">Basket Builder</h1>
            <p className="text-slate-400 text-sm">
              Theme: {theme}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-teal-400">{tickers.length}</div>
          <div className="text-slate-400 text-sm">Assets in Basket</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>{averageSentiment}</div>
          <div className="text-slate-400 text-xs">Avg Sentiment</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400" suppressHydrationWarning>{averageVelocity.toFixed(1)}</div>
          <div className="text-slate-400 text-xs">Avg Velocity</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400" suppressHydrationWarning>{totalMentions}</div>
          <div className="text-slate-400 text-xs">Total Mentions</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">Composite Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-400 mt-1" />
        {(['score', 'sentiment', 'velocity'] as const).map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              sortBy === sort
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sort.charAt(0).toUpperCase() + sort.slice(1)}
          </button>
        ))}
      </div>

      {/* Ticker List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Basket Components</h3>
        <div className="space-y-3">
          {sortedTickers.map((ticker, i) => (
            <div key={ticker.ticker} className="flex items-center gap-4 py-3 border-b border-slate-700 last:border-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Star className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{ticker.ticker}</span>
                  <span className="text-slate-400 text-sm">{ticker.name}</span>
                </div>
                <div className="text-xs text-slate-400">{ticker.reason}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{ticker.sentiment}</div>
                <div className="text-xs text-slate-400">sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{ticker.velocity.toFixed(1)}</div>
                <div className="text-xs text-slate-400">velocity</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{ticker.mentions}</div>
                <div className="text-xs text-slate-400">mentions</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-400">{ticker.score}</div>
                <div className="text-xs text-slate-400">score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BasketBuilder({ theme = 'AI stocks', autoRefresh }: BasketBuilderProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="basket-builder"
      theme={theme}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: BasketData } | null;
        const data = apiResponse?.data || generateMockData(theme);
        return <BasketBuilderContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default BasketBuilder;
