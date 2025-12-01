'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Briefcase, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig, CHART_COLORS } from '@/lib/theme';

interface PortfolioAggregatorProps {
  ticker?: string;
  tickers?: string;
  autoRefresh?: boolean;
}

interface TickerSentiment {
  ticker: string;
  sentiment: number;
  velocity: number;
  mentions: number;
  trend: 'up' | 'down' | 'neutral';
}

interface PortfolioData {
  tickers: TickerSentiment[];
  overallSentiment: number;
  averageVelocity: number;
  totalMentions: number;
  generatedAt: string;
}

const generateMockData = (tickerString: string): PortfolioData => {
  const now = new Date();
  const tickerList = tickerString.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);

  const tickers: TickerSentiment[] = tickerList.map((ticker) => {
    const sentiment = Math.round(30 + Math.random() * 40);
    const velocity = 3 + Math.random() * 5;
    return {
      ticker,
      sentiment,
      velocity,
      mentions: Math.round(50 + Math.random() * 300),
      trend: sentiment > 55 ? 'up' : sentiment < 45 ? 'down' : 'neutral',
    };
  });

  const overallSentiment = Math.round(
    tickers.reduce((sum, t) => sum + t.sentiment, 0) / tickers.length
  );
  const averageVelocity = tickers.reduce((sum, t) => sum + t.velocity, 0) / tickers.length;
  const totalMentions = tickers.reduce((sum, t) => sum + t.mentions, 0);

  return {
    tickers,
    overallSentiment,
    averageVelocity,
    totalMentions,
    generatedAt: now.toISOString(),
  };
};

function getSentimentColor(sentiment: number): string {
  if (sentiment >= 60) return 'text-green-400';
  if (sentiment >= 50) return 'text-emerald-400';
  if (sentiment >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function PortfolioAggregatorContent({
  data,
  isLoading,
}: {
  data: PortfolioData | null;
  isLoading: boolean;
}) {
  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { tickers = [], overallSentiment = 50, averageVelocity = 0, totalMentions = 0 } = data;

  const radarData = (tickers || []).map(t => ({
    ticker: t.ticker,
    sentiment: t.sentiment,
    velocity: t.velocity * 10,
  }));

  const barData = tickers.map((t, i) => ({
    ticker: t.ticker,
    sentiment: t.sentiment,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">Portfolio Aggregator</h1>
            <p className="text-slate-400 text-sm">
              Sentiment across {tickers.length} holdings
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getSentimentColor(overallSentiment)}`}>
            {overallSentiment}
          </div>
          <div className="text-slate-400 text-sm">Overall Sentiment</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>{averageVelocity.toFixed(1)}</div>
          <div className="text-slate-400 text-xs">Avg Velocity</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400" suppressHydrationWarning>{totalMentions}</div>
          <div className="text-slate-400 text-xs">Total Mentions</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-violet-400">{tickers.length}</div>
          <div className="text-slate-400 text-xs">Holdings</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Radar */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Portfolio Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Sentiment"
                dataKey="sentiment"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Sentiment by Ticker</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ticker Breakdown */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Individual Holdings</h3>
        <div className="space-y-3">
          {tickers.map((ticker) => (
            <div key={ticker.ticker} className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
              <div className="w-16 font-bold">{ticker.ticker}</div>
              <div className="flex-1">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ticker.sentiment >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${ticker.sentiment}%` }}
                  />
                </div>
              </div>
              <div className={`w-12 text-right font-bold ${getSentimentColor(ticker.sentiment)}`}>
                {ticker.sentiment}
              </div>
              <div className="w-16 text-right text-sm text-slate-400">
                {ticker.velocity.toFixed(1)} vel
              </div>
              <div className="w-20 text-right text-sm text-slate-400">
                {ticker.mentions} mentions
              </div>
              <TrendIcon trend={ticker.trend} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortfolioAggregator({ tickers = 'TSLA,NVDA,AAPL,MSFT', autoRefresh }: PortfolioAggregatorProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="portfolio-aggregator"
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: PortfolioData } | null;
        const data = apiResponse?.data || generateMockData(tickers);
        return <PortfolioAggregatorContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default PortfolioAggregator;
