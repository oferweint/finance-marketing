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
import { Shield, Bot, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { chartConfig } from '@/lib/theme';

interface QualityIndexProps {
  ticker?: string;
  autoRefresh?: boolean;
}

interface QualityData {
  ticker: string;
  qualityScore: number;
  authenticPct: number;
  suspectedBotPct: number;
  spamPct: number;
  lowQualityPct: number;
  totalMentions: number;
  authenticMentions: number;
  hourlyBreakdown: { hour: string; authentic: number; bot: number; spam: number }[];
  topBotAccounts: { username: string; confidence: number; posts: number }[];
  generatedAt: string;
}

const generateMockData = (ticker: string): QualityData => {
  const now = new Date();
  const currentHour = now.getHours();

  const authenticPct = 60 + Math.random() * 25;
  const suspectedBotPct = 5 + Math.random() * 15;
  const spamPct = 3 + Math.random() * 10;
  const lowQualityPct = 100 - authenticPct - suspectedBotPct - spamPct;

  const totalMentions = Math.round(200 + Math.random() * 800);
  const authenticMentions = Math.round(totalMentions * (authenticPct / 100));

  const hourlyBreakdown = [];
  for (let i = 0; i <= currentHour; i++) {
    const authentic = Math.round(20 + Math.random() * 50);
    const bot = Math.round(2 + Math.random() * 10);
    const spam = Math.round(1 + Math.random() * 5);
    hourlyBreakdown.push({
      hour: `${String(i).padStart(2, '0')}:00`,
      authentic,
      bot,
      spam,
    });
  }

  const topBotAccounts = Array.from({ length: 5 }, (_, i) => ({
    username: `suspicious_user_${i + 1}`,
    confidence: Math.round(70 + Math.random() * 30),
    posts: Math.round(5 + Math.random() * 20),
  })).sort((a, b) => b.confidence - a.confidence);

  const qualityScore = Math.round(authenticPct - (suspectedBotPct * 0.5) - (spamPct * 1.5));

  return {
    ticker,
    qualityScore,
    authenticPct,
    suspectedBotPct,
    spamPct,
    lowQualityPct,
    totalMentions,
    authenticMentions,
    hourlyBreakdown,
    topBotAccounts,
    generatedAt: now.toISOString(),
  };
};

function getQualityColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-emerald-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function QualityIndexContent({
  data,
  isLoading,
}: {
  data: QualityData | null;
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
    qualityScore = 0,
    authenticPct = 0,
    suspectedBotPct = 0,
    spamPct = 0,
    lowQualityPct = 0,
    totalMentions = 0,
    authenticMentions = 0,
    hourlyBreakdown = [],
    topBotAccounts = [],
  } = data;

  const pieData = [
    { name: 'Authentic', value: authenticPct, color: '#22c55e' },
    { name: 'Suspected Bot', value: suspectedBotPct, color: '#f97316' },
    { name: 'Spam', value: spamPct, color: '#ef4444' },
    { name: 'Low Quality', value: lowQualityPct, color: '#6b7280' },
  ];

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Quality Index</h1>
            <p className="text-slate-400 text-sm">
              Detect bot activity and spam in mentions
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getQualityColor(qualityScore)}`}>
            {qualityScore}
          </div>
          <div className="text-slate-400 text-sm">Quality Score</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <User className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-400" suppressHydrationWarning>{authenticPct.toFixed(0)}%</div>
          <div className="text-slate-400 text-xs">Authentic</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <Bot className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-orange-400" suppressHydrationWarning>{suspectedBotPct.toFixed(0)}%</div>
          <div className="text-slate-400 text-xs">Suspected Bot</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-red-400" suppressHydrationWarning>{spamPct.toFixed(0)}%</div>
          <div className="text-slate-400 text-xs">Spam</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <CheckCircle className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-400" suppressHydrationWarning>{authenticMentions}</div>
          <div className="text-slate-400 text-xs">Clean Mentions</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Quality Distribution</h3>
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
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Breakdown */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Hourly Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyBreakdown}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Bar dataKey="authentic" stackId="a" fill="#22c55e" />
              <Bar dataKey="bot" stackId="a" fill="#f97316" />
              <Bar dataKey="spam" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Suspected Bot Accounts */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Suspected Bot Accounts</h3>
        <div className="space-y-2">
          {topBotAccounts.map((account, i) => (
            <div key={account.username} className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
              <Bot className="w-4 h-4 text-orange-400" />
              <div className="flex-1">
                <span className="font-medium">@{account.username}</span>
              </div>
              <div className="text-right">
                <div className="text-orange-400 font-bold">{account.confidence}%</div>
                <div className="text-xs text-slate-400">confidence</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{account.posts}</div>
                <div className="text-xs text-slate-400">posts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QualityIndex({ ticker = 'DOGE', autoRefresh }: QualityIndexProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="quality-index"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: QualityData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <QualityIndexContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default QualityIndex;
