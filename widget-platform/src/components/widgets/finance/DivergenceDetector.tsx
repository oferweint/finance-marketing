'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { GitBranch, Users, Briefcase, AlertCircle } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface DivergenceDetectorProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface DivergenceData {
  ticker: string;
  retailSentiment: number;
  smartMoneySentiment: number;
  divergenceScore: number;
  divergenceDirection: 'retail_bullish' | 'smart_bullish' | 'aligned';
  hourlyHistory: { time: string; retail: number; smart: number }[];
  significantDivergences: { time: string; retail: number; smart: number; gap: number }[];
  interpretation: string;
  generatedAt: string;
}

const generateMockData = (ticker: string): DivergenceData => {
  const now = new Date();
  const currentHour = now.getHours();

  const hourlyHistory = [];
  let retailBase = 50 + Math.random() * 20;
  let smartBase = 50 + Math.random() * 20;

  for (let i = 0; i <= currentHour; i++) {
    retailBase = Math.max(20, Math.min(80, retailBase + (Math.random() - 0.5) * 8));
    smartBase = Math.max(20, Math.min(80, smartBase + (Math.random() - 0.45) * 6));

    hourlyHistory.push({
      time: `${String(i).padStart(2, '0')}:00`,
      retail: Math.round(retailBase),
      smart: Math.round(smartBase),
    });
  }

  const latestRetail = hourlyHistory[hourlyHistory.length - 1].retail;
  const latestSmart = hourlyHistory[hourlyHistory.length - 1].smart;
  const divergenceScore = Math.abs(latestRetail - latestSmart);

  const significantDivergences = hourlyHistory
    .filter(h => Math.abs(h.retail - h.smart) > 15)
    .map(h => ({ ...h, gap: h.retail - h.smart }))
    .slice(-5);

  let divergenceDirection: 'retail_bullish' | 'smart_bullish' | 'aligned' = 'aligned';
  if (latestRetail - latestSmart > 10) divergenceDirection = 'retail_bullish';
  else if (latestSmart - latestRetail > 10) divergenceDirection = 'smart_bullish';

  let interpretation = '';
  if (divergenceDirection === 'retail_bullish') {
    interpretation = `Retail investors are more bullish than institutional players on ${ticker}. This could indicate retail FOMO or smart money distribution.`;
  } else if (divergenceDirection === 'smart_bullish') {
    interpretation = `Institutional sentiment is more positive than retail on ${ticker}. Smart money may be accumulating while retail remains cautious.`;
  } else {
    interpretation = `Retail and institutional sentiment are aligned on ${ticker}. No significant divergence detected.`;
  }

  return {
    ticker,
    retailSentiment: latestRetail,
    smartMoneySentiment: latestSmart,
    divergenceScore,
    divergenceDirection,
    hourlyHistory,
    significantDivergences,
    interpretation,
    generatedAt: now.toISOString(),
  };
};

function getDivergenceColor(score: number): string {
  if (score >= 25) return 'text-red-400';
  if (score >= 15) return 'text-orange-400';
  if (score >= 10) return 'text-yellow-400';
  return 'text-green-400';
}

function DivergenceDetectorContent({
  data,
  isLoading,
}: {
  data: DivergenceData | null;
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
    retailSentiment = 50,
    smartMoneySentiment = 50,
    divergenceScore = 0,
    divergenceDirection = 'aligned',
    hourlyHistory = [],
    significantDivergences = [],
    interpretation = '',
  } = data;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-pink-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Divergence Detector</h1>
            <p className="text-slate-400 text-sm">
              Retail vs smart money sentiment gaps
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getDivergenceColor(divergenceScore)}`} suppressHydrationWarning>
            {divergenceScore}
          </div>
          <div className="text-slate-400 text-sm">Divergence Score</div>
        </div>
      </div>

      {/* Sentiment Comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-sm">Retail</span>
          </div>
          <div className="text-3xl font-bold text-blue-400" suppressHydrationWarning>{retailSentiment}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400 text-sm">Smart Money</span>
          </div>
          <div className="text-3xl font-bold text-purple-400" suppressHydrationWarning>{smartMoneySentiment}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 text-pink-400" />
            <span className="text-slate-400 text-sm">Status</span>
          </div>
          <div className={`text-lg font-bold ${
            divergenceDirection === 'aligned' ? 'text-green-400' : 'text-orange-400'
          }`}>
            {divergenceDirection === 'retail_bullish' ? 'Retail More Bullish' :
             divergenceDirection === 'smart_bullish' ? 'Smart More Bullish' : 'Aligned'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium mb-4">Sentiment Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={hourlyHistory}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="retail"
              name="Retail"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="smart"
              name="Smart Money"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-pink-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium mb-2">Analysis</h3>
            <p className="text-slate-400 text-sm">{interpretation}</p>
          </div>
        </div>
      </div>

      {/* Significant Divergences */}
      {significantDivergences.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Significant Divergences Today</h3>
          <div className="space-y-2">
            {significantDivergences.map((div, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div className="text-sm text-slate-400">{div.time}</div>
                <div className="flex items-center gap-4" suppressHydrationWarning>
                  <div className="text-sm">
                    <span className="text-blue-400">Retail: {div.retail}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-purple-400">Smart: {div.smart}</span>
                  </div>
                  <div className={`text-sm font-bold ${div.gap > 0 ? 'text-blue-400' : 'text-purple-400'}`}>
                    Gap: {div.gap > 0 ? '+' : ''}{div.gap}
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

export function DivergenceDetector({ ticker = 'TSLA', autoRefresh }: DivergenceDetectorProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="divergence-detector"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        // Don't use generateMockData() - causes hydration errors due to Math.random()
        const apiResponse = rawData as { success: boolean; data: DivergenceData } | null;
        const data = apiResponse?.data || null;
        return <DivergenceDetectorContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default DivergenceDetector;
