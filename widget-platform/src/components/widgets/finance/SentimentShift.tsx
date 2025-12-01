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
  ReferenceLine,
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface SentimentShiftProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface ShiftEvent {
  time: string;
  fromSentiment: number;
  toSentiment: number;
  magnitude: number;
  direction: 'bullish' | 'bearish';
  trigger?: string;
}

interface SentimentShiftData {
  ticker: string;
  currentSentiment: number;
  sentimentChange24h: number;
  sentimentChange7d: number;
  recentShifts: ShiftEvent[];
  hourlyHistory: { time: string; sentiment: number }[];
  dailyHistory: { date: string; sentiment: number }[];
  generatedAt: string;
}

const TRIGGERS = [
  'Earnings report released',
  'CEO statement on X',
  'Major analyst upgrade',
  'Breaking news coverage',
  'Influencer discussion spike',
  'Regulatory announcement',
];

const generateMockData = (ticker: string): SentimentShiftData => {
  const now = new Date();
  const currentHour = now.getHours();

  // Generate hourly history
  const hourlyHistory = [];
  let sentiment = 50 + Math.random() * 20;
  for (let i = 0; i <= currentHour; i++) {
    sentiment = Math.max(20, Math.min(80, sentiment + (Math.random() - 0.5) * 10));
    hourlyHistory.push({
      time: `${String(i).padStart(2, '0')}:00`,
      sentiment: Math.round(sentiment),
    });
  }

  // Generate daily history
  const dailyHistory = [];
  sentiment = 45 + Math.random() * 20;
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    sentiment = Math.max(25, Math.min(75, sentiment + (Math.random() - 0.5) * 15));
    dailyHistory.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sentiment: Math.round(sentiment),
    });
  }

  // Generate shift events
  const recentShifts: ShiftEvent[] = Array.from({ length: 4 }, (_, i) => {
    const from = 40 + Math.random() * 30;
    const magnitude = 10 + Math.random() * 20;
    const direction = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const to = direction === 'bullish' ? from + magnitude : from - magnitude;
    return {
      time: new Date(now.getTime() - i * 3600000 * 3).toISOString(),
      fromSentiment: Math.round(from),
      toSentiment: Math.round(Math.max(10, Math.min(90, to))),
      magnitude: Math.round(magnitude),
      direction,
      trigger: Math.random() > 0.3 ? TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)] : undefined,
    };
  });

  const currentSentiment = hourlyHistory[hourlyHistory.length - 1].sentiment;
  const sentimentChange24h = currentSentiment - hourlyHistory[0].sentiment;
  const sentimentChange7d = currentSentiment - dailyHistory[0].sentiment;

  return {
    ticker,
    currentSentiment,
    sentimentChange24h,
    sentimentChange7d,
    recentShifts,
    hourlyHistory,
    dailyHistory,
    generatedAt: now.toISOString(),
  };
};

function getSentimentColor(sentiment: number): string {
  if (sentiment >= 65) return 'text-green-400';
  if (sentiment >= 50) return 'text-emerald-400';
  if (sentiment >= 35) return 'text-yellow-400';
  return 'text-red-400';
}

function SentimentShiftContent({
  data,
  isLoading,
}: {
  data: SentimentShiftData | null;
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
    currentSentiment = 50,
    sentimentChange24h = 0,
    sentimentChange7d = 0,
    recentShifts = [],
    hourlyHistory = [],
    dailyHistory = [],
  } = data;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Sentiment Shift</h1>
            <p className="text-slate-400 text-sm">
              Detect sentiment reversals and changes
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getSentimentColor(currentSentiment)}`}>
            {currentSentiment}
          </div>
          <div className="text-slate-400 text-sm">Current Sentiment</div>
        </div>
      </div>

      {/* Change Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${sentimentChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {sentimentChange24h >= 0 ? '+' : ''}{sentimentChange24h}
          </div>
          <div className="text-slate-400 text-xs">24h Change</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${sentimentChange7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {sentimentChange7d >= 0 ? '+' : ''}{sentimentChange7d}
          </div>
          <div className="text-slate-400 text-xs">7d Change</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{recentShifts.length}</div>
          <div className="text-slate-400 text-xs">Shift Events</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Hourly */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Today&apos;s Sentiment</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyHistory}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">7-Day Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyHistory}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: '#a855f7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Shift Events */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Recent Shift Events</h3>
        <div className="space-y-3">
          {recentShifts.map((shift, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-700 last:border-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                shift.direction === 'bullish' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {shift.direction === 'bullish' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{shift.direction} Shift</span>
                  <span className={`text-sm font-bold ${
                    shift.direction === 'bullish' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {shift.direction === 'bullish' ? '+' : '-'}{shift.magnitude} pts
                  </span>
                </div>
                {shift.trigger && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {shift.trigger}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm">
                  {shift.fromSentiment} → {shift.toSentiment}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(shift.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SentimentShift({ ticker = 'META', autoRefresh }: SentimentShiftProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="sentiment-shift"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: SentimentShiftData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <SentimentShiftContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default SentimentShift;
