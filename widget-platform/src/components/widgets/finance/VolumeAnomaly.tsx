'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { BarChart2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface VolumeAnomalyProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface AnomalyEvent {
  time: string;
  volume: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'extreme';
}

interface VolumeAnomalyData {
  ticker: string;
  currentVolume: number;
  expectedVolume: number;
  anomalyScore: number;
  isAnomaly: boolean;
  hourlyData: { time: string; actual: number; expected: number; stdDev: number }[];
  recentAnomalies: AnomalyEvent[];
  generatedAt: string;
}

const generateMockData = (ticker: string): VolumeAnomalyData => {
  const now = new Date();
  const currentHour = now.getHours();

  const hourlyData = [];
  const recentAnomalies: AnomalyEvent[] = [];

  for (let i = 0; i <= currentHour; i++) {
    const hourFactor = i >= 9 && i <= 16 ? 1.5 : i >= 6 && i <= 20 ? 1.0 : 0.5;
    const expected = Math.round(100 * hourFactor);
    const hasAnomaly = Math.random() > 0.85;
    const anomalyMultiplier = hasAnomaly ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random() * 0.4;
    const actual = Math.round(expected * anomalyMultiplier);
    const stdDev = Math.round(expected * 0.2);

    hourlyData.push({
      time: `${String(i).padStart(2, '0')}:00`,
      actual,
      expected,
      stdDev,
    });

    if (hasAnomaly) {
      const deviation = ((actual - expected) / expected) * 100;
      let severity: 'low' | 'medium' | 'high' | 'extreme' = 'low';
      if (deviation > 100) severity = 'extreme';
      else if (deviation > 70) severity = 'high';
      else if (deviation > 40) severity = 'medium';

      recentAnomalies.push({
        time: new Date(now.getTime() - (currentHour - i) * 3600000).toISOString(),
        volume: actual,
        expected,
        deviation: Math.round(deviation),
        severity,
      });
    }
  }

  const latestData = hourlyData[hourlyData.length - 1];
  const currentVolume = latestData.actual;
  const expectedVolume = latestData.expected;
  const deviation = (currentVolume - expectedVolume) / expectedVolume;
  const anomalyScore = Math.min(100, Math.abs(deviation) * 100);
  const isAnomaly = anomalyScore > 30;

  return {
    ticker,
    currentVolume,
    expectedVolume,
    anomalyScore: Math.round(anomalyScore),
    isAnomaly,
    hourlyData,
    recentAnomalies: recentAnomalies.slice(-5).reverse(),
    generatedAt: now.toISOString(),
  };
};

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'extreme': return 'text-red-400 bg-red-400/20';
    case 'high': return 'text-orange-400 bg-orange-400/20';
    case 'medium': return 'text-yellow-400 bg-yellow-400/20';
    default: return 'text-blue-400 bg-blue-400/20';
  }
}

function VolumeAnomalyContent({
  data,
  isLoading,
}: {
  data: VolumeAnomalyData | null;
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
    currentVolume = 0,
    expectedVolume = 0,
    anomalyScore = 0,
    isAnomaly = false,
    hourlyData = [],
    recentAnomalies = [],
  } = data;

  const deviation = ((currentVolume - expectedVolume) / expectedVolume) * 100;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Volume Anomaly</h1>
            <p className="text-slate-400 text-sm">
              Detect unusual patterns in mention volume
            </p>
          </div>
        </div>
        <div className="text-right">
          {isAnomaly && (
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Anomaly Detected</span>
            </div>
          )}
          <div className={`text-4xl font-bold ${isAnomaly ? 'text-amber-400' : 'text-green-400'}`} suppressHydrationWarning>
            {anomalyScore}
          </div>
          <div className="text-slate-400 text-sm">Anomaly Score</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400" suppressHydrationWarning>{currentVolume}</div>
          <div className="text-slate-400 text-xs">Current Volume</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-400" suppressHydrationWarning>{expectedVolume}</div>
          <div className="text-slate-400 text-xs">Expected</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${deviation >= 0 ? 'text-green-400' : 'text-red-400'}`} suppressHydrationWarning>
            {deviation >= 0 ? '+' : ''}{deviation.toFixed(0)}%
          </div>
          <div className="text-slate-400 text-xs">Deviation</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400" suppressHydrationWarning>{recentAnomalies.length}</div>
          <div className="text-slate-400 text-xs">Anomalies Today</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">Volume vs Expected</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke="#64748b"
              fill="none"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#f59e0b"
              fill="url(#actualGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500" />
            <span className="text-xs text-slate-400">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-slate-500 border-dashed" />
            <span className="text-xs text-slate-400">Expected</span>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      {recentAnomalies.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Recent Anomalies</h3>
          <div className="space-y-3">
            {recentAnomalies.map((anomaly, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
                <AlertTriangle className={`w-5 h-5 ${getSeverityColor(anomaly.severity).split(' ')[0]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-sm" suppressHydrationWarning>+{anomaly.deviation}% deviation</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" suppressHydrationWarning>{anomaly.volume} mentions</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 justify-end" suppressHydrationWarning>
                    <Clock className="w-3 h-3" />
                    {new Date(anomaly.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VolumeAnomaly({ ticker = 'COIN', autoRefresh }: VolumeAnomalyProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="volume-anomaly"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: VolumeAnomalyData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <VolumeAnomalyContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default VolumeAnomaly;
