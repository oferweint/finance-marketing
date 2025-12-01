'use client';

import React, { useState } from 'react';
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
} from 'recharts';
import { BarChart3, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { SentimentDeepDiveData, SentimentPost } from '@/types/widgets';
import { chartConfig } from '@/lib/theme';

interface SentimentDeepDiveProps {
  ticker?: string;
  autoRefresh?: boolean;
}

const SAMPLE_TEXTS = [
  "Amazing earnings beat! This stock is going to the moon 🚀",
  "Technical analysis shows strong support at current levels",
  "News about the new product launch is very promising",
  "Pure speculation but I think it could 10x from here",
  "Fundamentals are solid, PE ratio is attractive",
  "Chart patterns suggest a breakout is imminent",
  "Bear case: competition is heating up significantly",
  "Management guidance was disappointing this quarter",
];

const generateMockData = (ticker: string): SentimentDeepDiveData => {
  const now = new Date();

  const sentimentByCategory = {
    fundamental: Math.round(30 + Math.random() * 40),
    technical: Math.round(30 + Math.random() * 40),
    news: Math.round(30 + Math.random() * 40),
    speculative: Math.round(30 + Math.random() * 40),
  };

  const overallSentiment = Math.round(
    (sentimentByCategory.fundamental +
      sentimentByCategory.technical +
      sentimentByCategory.news +
      sentimentByCategory.speculative) / 4
  );

  const categories = ['fundamental', 'technical', 'news', 'speculative'];
  const samplePosts: SentimentPost[] = SAMPLE_TEXTS.map((text, i) => ({
    id: `post-${i}`,
    text,
    author: `@user${Math.floor(Math.random() * 1000)}`,
    sentiment: Math.round(20 + Math.random() * 60),
    category: categories[i % 4],
    engagement: Math.round(10 + Math.random() * 500),
  }));

  return {
    ticker,
    overallSentiment,
    sentimentByCategory,
    samplePosts,
    generatedAt: now.toISOString(),
  };
};

function getSentimentColor(sentiment: number): string {
  if (sentiment >= 70) return 'text-green-400';
  if (sentiment >= 55) return 'text-emerald-400';
  if (sentiment >= 45) return 'text-yellow-400';
  if (sentiment >= 30) return 'text-orange-400';
  return 'text-red-400';
}

function getSentimentLabel(sentiment: number): string {
  if (sentiment >= 70) return 'Very Bullish';
  if (sentiment >= 55) return 'Bullish';
  if (sentiment >= 45) return 'Neutral';
  if (sentiment >= 30) return 'Bearish';
  return 'Very Bearish';
}

function SentimentDeepDiveContent({
  data,
  isLoading,
}: {
  data: SentimentDeepDiveData | null;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts'>('overview');

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const {
    ticker,
    overallSentiment = 50,
    sentimentByCategory = { fundamental: 50, technical: 50, news: 50, speculative: 50 },
    samplePosts = []
  } = data;

  const radarData = [
    { category: 'Fundamental', value: sentimentByCategory.fundamental, fullMark: 100 },
    { category: 'Technical', value: sentimentByCategory.technical, fullMark: 100 },
    { category: 'News', value: sentimentByCategory.news, fullMark: 100 },
    { category: 'Speculative', value: sentimentByCategory.speculative, fullMark: 100 },
  ];

  const barData = Object.entries(sentimentByCategory).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    sentiment: value,
    bullish: value,
    bearish: 100 - value,
  }));

  const SentimentIcon = overallSentiment >= 50 ? ThumbsUp : overallSentiment < 45 ? ThumbsDown : Minus;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Sentiment Deep Dive</h1>
            <p className="text-slate-400 text-sm">
              Multi-dimensional sentiment analysis
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getSentimentColor(overallSentiment)}`} suppressHydrationWarning>
            {overallSentiment}
          </div>
          <div className="flex items-center gap-1 justify-end text-slate-400">
            <SentimentIcon className="w-4 h-4" />
            <span className="text-sm">{getSentimentLabel(overallSentiment)}</span>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(sentimentByCategory).map(([key, value]) => (
          <div key={key} className="bg-slate-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${getSentimentColor(value)}`} suppressHydrationWarning>{value}</div>
            <div className="text-slate-400 text-xs capitalize">{key}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Sample Posts
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Radar Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4">Sentiment Radar</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Sentiment"
                  dataKey="value"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid {...chartConfig.grid} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={chartConfig.tooltip.contentStyle}
                  labelStyle={chartConfig.tooltip.labelStyle}
                />
                <Bar dataKey="sentiment" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Sample Posts</h3>
          <div className="space-y-3">
            {samplePosts.map((post) => (
              <div key={post.id} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{post.text}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400" suppressHydrationWarning>
                      <span>{post.author}</span>
                      <span className="capitalize">{post.category}</span>
                      <span>{post.engagement} engagements</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(post.sentiment)} bg-slate-800`} suppressHydrationWarning>
                    {post.sentiment}
                  </div>
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
          Overall sentiment for {ticker} is {getSentimentLabel(overallSentiment).toLowerCase()} at {overallSentiment}/100.
          {' '}The strongest category is{' '}
          {Object.entries(sentimentByCategory).sort((a, b) => b[1] - a[1])[0][0]} analysis,
          while {Object.entries(sentimentByCategory).sort((a, b) => a[1] - b[1])[0][0]} analysis
          shows the most skepticism.
        </p>
      </div>
    </div>
  );
}

export function SentimentDeepDive({ ticker = 'GOOGL', autoRefresh }: SentimentDeepDiveProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="sentiment-deep-dive"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        const apiResponse = rawData as { success: boolean; data: SentimentDeepDiveData } | null;
        const data = apiResponse?.data || generateMockData(ticker);
        return <SentimentDeepDiveContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default SentimentDeepDive;
