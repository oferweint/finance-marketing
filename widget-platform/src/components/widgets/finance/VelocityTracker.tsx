'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import {
  VelocityTrackerData,
  HourlyData,
  PeerData,
  Signal,
  Trend,
} from '@/types/widgets';
import {
  CHART_COLORS,
  getSignalClass,
  chartConfig,
  getVelocityDescription,
} from '@/lib/theme';

interface VelocityTrackerProps {
  ticker?: string;
  autoRefresh?: boolean;
}

// Mock data for development/demo
const generateMockData = (ticker: string): VelocityTrackerData => {
  const now = new Date();
  const currentHour = now.getHours();

  const hourlyData: HourlyData[] = [];
  for (let i = 0; i <= currentHour; i++) {
    const baseline = 50 + Math.sin(i / 3) * 30;
    const actual = baseline * (0.8 + Math.random() * 0.8);
    const velocity = 2.5 + (actual / baseline) * 2.5;
    hourlyData.push({
      time: `${String(i).padStart(2, '0')}:00`,
      hour: i,
      actual: Math.round(actual),
      baseline: Math.round(baseline),
      velocity: Math.min(10, Math.max(0, velocity)),
    });
  }

  const latestData = hourlyData[hourlyData.length - 1];
  const ratio = latestData.actual / latestData.baseline;

  const categoryPeers: PeerData[] = [
    {
      ticker,
      velocity: latestData.velocity,
      trend: 'accelerating',
      mentions: latestData.actual,
      color: CHART_COLORS[0],
    },
    {
      ticker: 'PEER1',
      velocity: 5 + Math.random() * 3,
      trend: 'stable',
      mentions: Math.round(50 + Math.random() * 100),
      color: CHART_COLORS[1],
    },
    {
      ticker: 'PEER2',
      velocity: 4 + Math.random() * 2,
      trend: 'decelerating',
      mentions: Math.round(30 + Math.random() * 60),
      color: CHART_COLORS[2],
    },
    {
      ticker: 'PEER3',
      velocity: 4.5 + Math.random() * 2,
      trend: 'accelerating',
      mentions: Math.round(40 + Math.random() * 80),
      color: CHART_COLORS[3],
    },
  ];

  let signal: Signal = 'NORMAL';
  if (ratio > 2) signal = 'VERY_HIGH';
  else if (ratio > 1.5) signal = 'HIGH_ACTIVITY';
  else if (ratio > 1.2) signal = 'ELEVATED';
  else if (ratio < 0.8) signal = 'LOW';

  return {
    ticker,
    category: 'Category',
    currentVelocity: latestData.velocity,
    currentActual: latestData.actual,
    currentBaseline: latestData.baseline,
    baselineRatio: ratio,
    trend: 'accelerating',
    signal,
    hourlyData,
    categoryPeers,
    generatedAt: now.toISOString(),
  };
};

function VelocityTrackerContent({
  data,
  isLoading,
}: {
  data: VelocityTrackerData | null;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'detail' | 'compare'>('detail');

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const {
    ticker,
    category = 'Unknown',
    currentVelocity = 0,
    currentActual = 0,
    currentBaseline = 1,
    baselineRatio = 1,
    trend = 'stable' as const,
    signal = 'NORMAL' as const,
    hourlyData = [],
    categoryPeers = [],
  } = data;

  const TrendIcon =
    trend === 'accelerating'
      ? TrendingUp
      : trend === 'decelerating'
      ? TrendingDown
      : Minus;
  const trendColor =
    trend === 'accelerating'
      ? 'text-green-400'
      : trend === 'decelerating'
      ? 'text-red-400'
      : 'text-gray-400';

  // Build comparison data for line chart using real hourly velocity data
  const comparisonData = hourlyData.map((h, i) => {
    const result: Record<string, number | string> = {
      time: h.time,
      [ticker]: h.velocity,
    };
    // Use real hourlyVelocity data from API if available, otherwise fallback to current velocity
    categoryPeers.slice(1).forEach((peer) => {
      if (peer.hourlyVelocity && peer.hourlyVelocity[i] !== undefined) {
        result[peer.ticker] = peer.hourlyVelocity[i];
      } else {
        // Fallback: use current velocity as constant line
        result[peer.ticker] = peer.velocity;
      }
    });
    return result;
  });

  // Calculate dynamic Y-axis max from all data
  const allVelocities: number[] = [
    ...hourlyData.map(h => h.velocity),
    ...categoryPeers.flatMap(p => p.hourlyVelocity || [p.velocity]),
  ];
  const maxVelocity = Math.max(...allVelocities, 10); // At least 10
  const yAxisMax = Math.ceil(maxVelocity * 1.1); // Add 10% headroom

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-400" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{ticker} Velocity</h1>
              <span className="text-slate-500 text-sm">({category})</span>
            </div>
            <p className="text-slate-400 text-sm">
              Normalized vs hourly baseline (3-day avg)
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-400" suppressHydrationWarning>
            {currentVelocity.toFixed(1)}
          </div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getSignalClass(
              signal
            )}`}
          >
            {signal.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">Latest</div>
          <div className="text-xl font-bold" suppressHydrationWarning>{currentActual}</div>
          <div className="text-slate-500 text-xs">mentions</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">Baseline</div>
          <div className="text-xl font-bold" suppressHydrationWarning>{currentBaseline}</div>
          <div className="text-slate-500 text-xs">expected</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">vs Baseline</div>
          <div
            className={`text-xl font-bold ${
              baselineRatio > 1 ? 'text-green-400' : 'text-red-400'
            }`}
            suppressHydrationWarning
          >
            {baselineRatio > 1 ? '+' : ''}
            {((baselineRatio - 1) * 100).toFixed(0)}%
          </div>
          <div className="text-slate-500 text-xs" suppressHydrationWarning>
            {baselineRatio > 1 ? 'above' : 'below'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">Trend</div>
          <div className={`flex items-center gap-1 ${trendColor}`} suppressHydrationWarning>
            <TrendIcon className="w-5 h-5" />
            <span className="text-xl font-bold capitalize">{trend}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('detail')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'detail'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {ticker} Detail
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'compare'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Category Comparison
        </button>
      </div>

      {/* Charts */}
      {activeTab === 'detail' ? (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">
            Hourly Velocity (Today until now)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis
                dataKey="time"
                {...chartConfig.axis}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                {...chartConfig.axis}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
                formatter={(value: number) => [value.toFixed(1), 'Velocity']}
              />
              <Area
                type="monotone"
                dataKey="velocity"
                stroke="#3b82f6"
                fill="url(#velocityGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Velocity Legend */}
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
      ) : (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">
            {ticker} vs Category Peers
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis
                dataKey="time"
                {...chartConfig.axis}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                {...chartConfig.axis}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Legend />
              {categoryPeers.map((peer) => (
                <Line
                  key={peer.ticker}
                  type="monotone"
                  dataKey={peer.ticker}
                  stroke={peer.color}
                  strokeWidth={peer.ticker === ticker ? 3 : 1.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Peer Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {categoryPeers.map((peer) => (
              <div
                key={peer.ticker}
                className="bg-slate-700 rounded p-2 text-center"
              >
                <div
                  className="text-sm font-bold"
                  style={{ color: peer.color }}
                >
                  {peer.ticker}
                </div>
                <div className="text-lg font-bold">
                  {peer.velocity.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">
                  {peer.mentions} mentions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Interpretation</h3>
        <p className="text-slate-400 text-sm" suppressHydrationWarning>
          {ticker} velocity is at {currentVelocity.toFixed(1)} (
          {getVelocityDescription(currentVelocity)}). Current mentions are{' '}
          {baselineRatio > 1
            ? `${((baselineRatio - 1) * 100).toFixed(0)}% above`
            : `${((1 - baselineRatio) * 100).toFixed(0)}% below`}{' '}
          the expected baseline. The trend is {trend}.
        </p>
      </div>
    </div>
  );
}

export function VelocityTracker({ ticker = 'TSLA', autoRefresh }: VelocityTrackerProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="velocity-tracker"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading, isError) => {
        // Extract data from API response structure { success, data, cached }
        const apiResponse = rawData as { success: boolean; data: VelocityTrackerData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <VelocityTrackerContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default VelocityTracker;
