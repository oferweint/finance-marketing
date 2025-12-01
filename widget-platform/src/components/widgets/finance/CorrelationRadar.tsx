'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Radar, Link2, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig, CHART_COLORS } from '@/lib/theme';

interface CorrelationRadarProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface CorrelatedAsset {
  ticker: string;
  name: string;
  correlation: number;
  sentimentDiff: number;
  velocity: number;
  category: string;
}

interface CorrelationData {
  baseTicker: string;
  baseVelocity: number;
  baseSentiment: number;
  correlatedAssets: CorrelatedAsset[];
  generatedAt: string;
}

const MOCK_CORRELATIONS: Record<string, { ticker: string; name: string; category: string }[]> = {
  BTC: [
    { ticker: 'ETH', name: 'Ethereum', category: 'Crypto' },
    { ticker: 'SOL', name: 'Solana', category: 'Crypto' },
    { ticker: 'MSTR', name: 'MicroStrategy', category: 'Stocks' },
    { ticker: 'COIN', name: 'Coinbase', category: 'Stocks' },
    { ticker: 'RIOT', name: 'Riot Platforms', category: 'Mining' },
  ],
  TSLA: [
    { ticker: 'RIVN', name: 'Rivian', category: 'EV' },
    { ticker: 'LCID', name: 'Lucid', category: 'EV' },
    { ticker: 'NIO', name: 'NIO Inc', category: 'EV' },
    { ticker: 'F', name: 'Ford', category: 'Auto' },
    { ticker: 'GM', name: 'General Motors', category: 'Auto' },
  ],
  default: [
    { ticker: 'SPY', name: 'S&P 500 ETF', category: 'Index' },
    { ticker: 'QQQ', name: 'Nasdaq ETF', category: 'Index' },
    { ticker: 'VTI', name: 'Total Market', category: 'Index' },
    { ticker: 'IWM', name: 'Russell 2000', category: 'Index' },
    { ticker: 'DIA', name: 'Dow Jones ETF', category: 'Index' },
  ],
};

const generateMockData = (ticker: string): CorrelationData => {
  const now = new Date();
  const correlations = MOCK_CORRELATIONS[ticker] || MOCK_CORRELATIONS.default;

  const correlatedAssets: CorrelatedAsset[] = correlations.map((asset) => ({
    ...asset,
    correlation: 0.3 + Math.random() * 0.6,
    sentimentDiff: -20 + Math.random() * 40,
    velocity: 3 + Math.random() * 5,
  })).sort((a, b) => b.correlation - a.correlation);

  return {
    baseTicker: ticker,
    baseVelocity: 4 + Math.random() * 4,
    baseSentiment: 40 + Math.random() * 30,
    correlatedAssets,
    generatedAt: now.toISOString(),
  };
};

function getCorrelationColor(correlation: number): string {
  if (correlation >= 0.8) return '#22c55e';
  if (correlation >= 0.6) return '#84cc16';
  if (correlation >= 0.4) return '#eab308';
  return '#f97316';
}

function CorrelationRadarContent({
  data,
  isLoading,
}: {
  data: CorrelationData | null;
  isLoading: boolean;
}) {
  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { baseTicker, baseVelocity = 0, baseSentiment = 50, correlatedAssets = [] } = data;

  const scatterData = (correlatedAssets || []).map((asset, i) => ({
    x: asset.correlation * 100,
    y: asset.velocity,
    name: asset.ticker,
    correlation: asset.correlation,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radar className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold">{baseTicker} Correlation Radar</h1>
            <p className="text-slate-400 text-sm">
              Assets with correlated social sentiment
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-cyan-400">{correlatedAssets.length}</div>
          <div className="text-slate-400 text-sm">Correlated Assets</div>
        </div>
      </div>

      {/* Base Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">{baseTicker} Velocity</div>
          <div className="text-2xl font-bold text-blue-400" suppressHydrationWarning>{baseVelocity.toFixed(1)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs mb-1">{baseTicker} Sentiment</div>
          <div className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>{baseSentiment.toFixed(0)}</div>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">Correlation vs Velocity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 100]}
              name="Correlation"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Correlation %', position: 'bottom', fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 10]}
              name="Velocity"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Velocity', angle: -90, position: 'left', fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
              formatter={(value: number, name: string) => {
                if (name === 'x') return [`${value.toFixed(0)}%`, 'Correlation'];
                if (name === 'y') return [value.toFixed(1), 'Velocity'];
                return [value, name];
              }}
            />
            <Scatter data={scatterData} name="Assets">
              {scatterData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Correlated Assets List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Correlated Assets</h3>
        <div className="space-y-3">
          {correlatedAssets.map((asset, i) => (
            <div
              key={asset.ticker}
              className="flex items-center gap-4 py-3 border-b border-slate-700 last:border-0"
            >
              <div className="w-8 text-slate-400 text-sm">#{i + 1}</div>
              <Link2 className="w-4 h-4" style={{ color: getCorrelationColor(asset.correlation) }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{asset.ticker}</span>
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{asset.category}</span>
                </div>
                <div className="text-sm text-slate-400">{asset.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: getCorrelationColor(asset.correlation) }}>
                  {(asset.correlation * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400">correlation</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {asset.sentimentDiff > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={asset.sentimentDiff > 0 ? 'text-green-400' : 'text-red-400'}>
                    {asset.sentimentDiff > 0 ? '+' : ''}{asset.sentimentDiff.toFixed(0)}
                  </span>
                </div>
                <div className="text-xs text-slate-400">vs {baseTicker}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{asset.velocity.toFixed(1)}</div>
                <div className="text-xs text-slate-400">velocity</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CorrelationRadar({ ticker = 'BTC', autoRefresh }: CorrelationRadarProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="correlation-radar"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: CorrelationData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <CorrelationRadarContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default CorrelationRadar;
