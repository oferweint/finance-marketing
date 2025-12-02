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
import { Users, TrendingUp, MessageSquare, Heart } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { InfluencerRadarData, Influencer } from '@/types/widgets';
import { chartConfig } from '@/lib/theme';

interface InfluencerRadarProps {
  ticker?: string;
  autoRefresh?: boolean;
}

const MOCK_USERNAMES = [
  { username: 'CryptoWhale', name: 'Crypto Whale' },
  { username: 'TechAnalyst', name: 'Tech Analyst Pro' },
  { username: 'MarketGuru', name: 'Market Guru' },
  { username: 'StockPicker', name: 'Stock Picker AI' },
  { username: 'BullishTrader', name: 'Bullish Trader' },
  { username: 'InvestorDaily', name: 'Investor Daily' },
  { username: 'FinanceNews', name: 'Finance News Hub' },
  { username: 'TradingView', name: 'Trading View Pro' },
];

const generateMockData = (ticker: string): InfluencerRadarData => {
  const now = new Date();
  const sentiments: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral'];

  const influencers: Influencer[] = MOCK_USERNAMES.map((user, i) => ({
    username: user.username,
    name: user.name,
    followers: Math.round(10000 + Math.random() * 990000),
    engagement: Math.round(1 + Math.random() * 10),
    sentiment: sentiments[Math.floor(Math.random() * 3)],
    recentPosts: Math.round(1 + Math.random() * 10),
    influenceScore: Math.round(30 + Math.random() * 70),
  })).sort((a, b) => b.influenceScore - a.influenceScore);

  return {
    ticker,
    influencers,
    totalInfluencers: influencers.length,
    generatedAt: now.toISOString(),
  };
};

function formatFollowers(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function InfluencerRadarContent({
  data,
  isLoading,
}: {
  data: InfluencerRadarData | null;
  isLoading: boolean;
}) {
  const [sortBy, setSortBy] = useState<'influence' | 'followers' | 'engagement'>('influence');

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { ticker, influencers = [], totalInfluencers = 0 } = data;

  const sortedInfluencers = [...(influencers || [])].sort((a, b) => {
    if (sortBy === 'followers') return b.followers - a.followers;
    if (sortBy === 'engagement') return b.engagement - a.engagement;
    return b.influenceScore - a.influenceScore;
  });

  const chartData = sortedInfluencers.slice(0, 6).map(inf => ({
    name: inf.username,
    score: inf.influenceScore,
    sentiment: inf.sentiment,
  }));

  const sentimentCounts = {
    bullish: influencers.filter(i => i.sentiment === 'bullish').length,
    bearish: influencers.filter(i => i.sentiment === 'bearish').length,
    neutral: influencers.filter(i => i.sentiment === 'neutral').length,
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-400/20';
      case 'bearish': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Influencer Radar</h1>
            <p className="text-slate-400 text-sm">
              Top voices discussing {ticker}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-cyan-400" suppressHydrationWarning>{totalInfluencers}</div>
          <div className="text-slate-400 text-sm">Influencers Found</div>
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-green-400 text-2xl font-bold" suppressHydrationWarning>{sentimentCounts.bullish}</div>
          <div className="text-slate-400 text-xs">Bullish</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-gray-400 text-2xl font-bold" suppressHydrationWarning>{sentimentCounts.neutral}</div>
          <div className="text-slate-400 text-xs">Neutral</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-red-400 text-2xl font-bold" suppressHydrationWarning>{sentimentCounts.bearish}</div>
          <div className="text-slate-400 text-xs">Bearish</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium mb-4">Influence Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid {...chartConfig.grid} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
            />
            <Bar dataKey="score" fill="#22d3ee" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 mb-4">
        {(['influence', 'followers', 'engagement'] as const).map((sort) => (
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

      {/* Influencer List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Top Influencers</h3>
        <div className="space-y-3">
          {sortedInfluencers.slice(0, 6).map((inf, i) => (
            <div key={inf.username} className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                #{i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">@{inf.username}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getSentimentColor(inf.sentiment)}`}>
                    {inf.sentiment}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{inf.name}</div>
              </div>
              <div className="flex items-center gap-4 text-sm" suppressHydrationWarning>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3 h-3" />
                  {formatFollowers(inf.followers)}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Heart className="w-3 h-3" />
                  {inf.engagement}%
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  {inf.recentPosts}
                </div>
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-bold" suppressHydrationWarning>{inf.influenceScore}</div>
                <div className="text-xs text-slate-400">score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InfluencerRadar({ ticker = 'BTC', autoRefresh }: InfluencerRadarProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="influencer-radar"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        // Don't use generateMockData() - causes hydration errors due to Math.random()
        const apiResponse = rawData as { success: boolean; data: InfluencerRadarData } | null;
        const data = apiResponse?.data || null;
        return <InfluencerRadarContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default InfluencerRadar;
