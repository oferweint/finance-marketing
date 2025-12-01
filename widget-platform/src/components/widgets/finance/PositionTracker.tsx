'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Target, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface PositionTrackerProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface PositionData {
  ticker: string;
  bullCount: number;
  bearCount: number;
  bullPercentage: number;
  bearPercentage: number;
  totalPositions: number;
  topBulls: { username: string; followers: number; conviction: number }[];
  topBears: { username: string; followers: number; conviction: number }[];
  historicalRatio: { date: string; bullish: number; bearish: number }[];
  generatedAt: string;
}

const generateMockData = (ticker: string): PositionData => {
  const now = new Date();
  const bullCount = Math.round(30 + Math.random() * 70);
  const bearCount = Math.round(10 + Math.random() * 40);
  const total = bullCount + bearCount;

  const topBulls = Array.from({ length: 5 }, (_, i) => ({
    username: `BullTrader${i + 1}`,
    followers: Math.round(10000 + Math.random() * 500000),
    conviction: Math.round(70 + Math.random() * 30),
  })).sort((a, b) => b.followers - a.followers);

  const topBears = Array.from({ length: 5 }, (_, i) => ({
    username: `BearTrader${i + 1}`,
    followers: Math.round(5000 + Math.random() * 200000),
    conviction: Math.round(60 + Math.random() * 40),
  })).sort((a, b) => b.followers - a.followers);

  const historicalRatio = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const bullish = Math.round(40 + Math.random() * 30);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      bullish,
      bearish: 100 - bullish,
    };
  });

  return {
    ticker,
    bullCount,
    bearCount,
    bullPercentage: Math.round((bullCount / total) * 100),
    bearPercentage: Math.round((bearCount / total) * 100),
    totalPositions: total,
    topBulls,
    topBears,
    historicalRatio,
    generatedAt: now.toISOString(),
  };
};

function formatFollowers(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function PositionTrackerContent({
  data,
  isLoading,
}: {
  data: PositionData | null;
  isLoading: boolean;
}) {
  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const {
    ticker,
    bullCount = 0,
    bearCount = 0,
    bullPercentage = 50,
    bearPercentage = 50,
    totalPositions = 0,
    topBulls = [],
    topBears = [],
    historicalRatio = [],
  } = data;

  const pieData = [
    { name: 'Bullish', value: bullCount, color: '#22c55e' },
    { name: 'Bearish', value: bearCount, color: '#ef4444' },
  ];

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Position Tracker</h1>
            <p className="text-slate-400 text-sm">
              Track bull/bear positions from influencers
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-violet-400" suppressHydrationWarning>{totalPositions}</div>
          <div className="text-slate-400 text-sm">Total Positions</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Bulls</span>
          </div>
          <div className="text-3xl font-bold text-green-400" suppressHydrationWarning>{bullCount}</div>
          <div className="text-sm text-slate-400" suppressHydrationWarning>{bullPercentage}% of total</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Bears</span>
          </div>
          <div className="text-3xl font-bold text-red-400" suppressHydrationWarning>{bearCount}</div>
          <div className="text-sm text-slate-400" suppressHydrationWarning>{bearPercentage}% of total</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Position Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Ratio */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">7-Day Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historicalRatio}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Bar dataKey="bullish" stackId="a" fill="#22c55e" />
              <Bar dataKey="bearish" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Bulls & Bears */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Top Bulls
          </h3>
          <div className="space-y-2">
            {topBulls.map((user, i) => (
              <div key={user.username} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">#{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">@{user.username}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                      <Users className="w-3 h-3" />
                      {formatFollowers(user.followers)}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold" suppressHydrationWarning>{user.conviction}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Top Bears
          </h3>
          <div className="space-y-2">
            {topBears.map((user, i) => (
              <div key={user.username} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">#{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">@{user.username}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                      <Users className="w-3 h-3" />
                      {formatFollowers(user.followers)}
                    </div>
                  </div>
                </div>
                <div className="text-red-400 font-bold" suppressHydrationWarning>{user.conviction}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PositionTracker({ ticker = 'AAPL', autoRefresh }: PositionTrackerProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="position-tracker"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: PositionData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <PositionTrackerContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default PositionTracker;
