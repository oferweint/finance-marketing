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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MessageSquare, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface NarrativeTrackerProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface Narrative {
  id: string;
  theme: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  mentions: number;
  influencers: number;
  samplePosts: string[];
  trend: 'growing' | 'declining' | 'stable';
}

interface NarrativeData {
  ticker: string;
  bullishNarratives: Narrative[];
  bearishNarratives: Narrative[];
  dominantSentiment: 'bullish' | 'bearish' | 'neutral';
  narrativeBalance: number;
  totalNarratives: number;
  generatedAt: string;
}

const BULLISH_THEMES = [
  'Strong earnings growth potential',
  'AI integration expanding',
  'Market share gains',
  'New product launch success',
  'Institutional buying pressure',
];

const BEARISH_THEMES = [
  'Valuation concerns',
  'Competition heating up',
  'Regulatory headwinds',
  'Margin pressure increasing',
  'Insider selling activity',
];

const generateMockData = (ticker: string): NarrativeData => {
  const now = new Date();

  const bullishNarratives: Narrative[] = BULLISH_THEMES.slice(0, 3 + Math.floor(Math.random() * 2)).map((theme, i) => ({
    id: `bull-${i}`,
    theme,
    sentiment: 'bullish' as const,
    strength: Math.round(40 + Math.random() * 60),
    mentions: Math.round(20 + Math.random() * 200),
    influencers: Math.round(2 + Math.random() * 15),
    samplePosts: [`"${theme} - ${ticker} looking strong!"`, `"Bullish on ${ticker} because of ${theme.toLowerCase()}"`],
    trend: (Math.random() > 0.3 ? 'growing' : 'stable') as 'growing' | 'declining' | 'stable',
  })).sort((a, b) => b.strength - a.strength);

  const bearishNarratives: Narrative[] = BEARISH_THEMES.slice(0, 2 + Math.floor(Math.random() * 2)).map((theme, i) => ({
    id: `bear-${i}`,
    theme,
    sentiment: 'bearish' as const,
    strength: Math.round(30 + Math.random() * 50),
    mentions: Math.round(10 + Math.random() * 100),
    influencers: Math.round(1 + Math.random() * 10),
    samplePosts: [`"Concerned about ${ticker} - ${theme.toLowerCase()}"`, `"${theme} is a red flag for ${ticker}"`],
    trend: (Math.random() > 0.5 ? 'growing' : 'declining') as 'growing' | 'declining' | 'stable',
  })).sort((a, b) => b.strength - a.strength);

  const bullTotal = bullishNarratives.reduce((sum, n) => sum + n.strength, 0);
  const bearTotal = bearishNarratives.reduce((sum, n) => sum + n.strength, 0);
  const narrativeBalance = Math.round((bullTotal / (bullTotal + bearTotal)) * 100);

  return {
    ticker,
    bullishNarratives,
    bearishNarratives,
    dominantSentiment: narrativeBalance > 55 ? 'bullish' : narrativeBalance < 45 ? 'bearish' : 'neutral',
    narrativeBalance,
    totalNarratives: bullishNarratives.length + bearishNarratives.length,
    generatedAt: now.toISOString(),
  };
};

function NarrativeTrackerContent({
  data,
  isLoading,
}: {
  data: NarrativeData | null;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'bullish' | 'bearish'>('bullish');

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const {
    ticker,
    bullishNarratives = [],
    bearishNarratives = [],
    dominantSentiment = 'neutral',
    narrativeBalance = 50,
    totalNarratives = 0,
  } = data;

  const pieData = [
    { name: 'Bullish', value: narrativeBalance, color: '#22c55e' },
    { name: 'Bearish', value: 100 - narrativeBalance, color: '#ef4444' },
  ];

  const barData = [
    ...bullishNarratives.map(n => ({ name: n.theme.slice(0, 20) + '...', strength: n.strength, type: 'bull' })),
    ...bearishNarratives.map(n => ({ name: n.theme.slice(0, 20) + '...', strength: -n.strength, type: 'bear' })),
  ];

  const activeNarratives = activeTab === 'bullish' ? bullishNarratives : bearishNarratives;

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'growing') return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend === 'declining') return <TrendingDown className="w-3 h-3 text-red-400" />;
    return null;
  };

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Narrative Tracker</h1>
            <p className="text-slate-400 text-sm">
              Track competing bull/bear narratives
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${
            dominantSentiment === 'bullish' ? 'text-green-400' :
            dominantSentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'
          }`} suppressHydrationWarning>
            {narrativeBalance}%
          </div>
          <div className="text-slate-400 text-sm capitalize">{dominantSentiment}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400" suppressHydrationWarning>{bullishNarratives.length}</div>
          <div className="text-slate-400 text-xs">Bull Narratives</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400" suppressHydrationWarning>{bearishNarratives.length}</div>
          <div className="text-slate-400 text-xs">Bear Narratives</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400" suppressHydrationWarning>{totalNarratives}</div>
          <div className="text-slate-400 text-xs">Total Tracked</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Narrative Balance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
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
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Narrative Strength</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid {...chartConfig.grid} />
              <XAxis type="number" domain={[-100, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Bar dataKey="strength">
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.type === 'bull' ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('bullish')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'bullish'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Bull Narratives
        </button>
        <button
          onClick={() => setActiveTab('bearish')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'bearish'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Bear Narratives
        </button>
      </div>

      {/* Narrative List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="space-y-4">
          {activeNarratives.map((narrative) => (
            <div key={narrative.id} className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{narrative.theme}</span>
                    <TrendIcon trend={narrative.trend} />
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  narrative.sentiment === 'bullish' ? 'text-green-400' : 'text-red-400'
                }`} suppressHydrationWarning>
                  {narrative.strength}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400" suppressHydrationWarning>
                <span>{narrative.mentions} mentions</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {narrative.influencers} influencers
                </span>
                <span className="capitalize">{narrative.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NarrativeTracker({ ticker = 'NVDA', autoRefresh }: NarrativeTrackerProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="narrative-tracker"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        // Don't use generateMockData() - causes hydration errors due to Math.random()
        const apiResponse = rawData as { success: boolean; data: NarrativeData } | null;
        const data = apiResponse?.data || null;
        return <NarrativeTrackerContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default NarrativeTracker;
