---
name: narrative-tracker
description: Track and visualize competing narratives around a financial asset. Shows narrative strength, evolution, and conflicts. Use when understanding market stories, tracking thesis changes, or identifying narrative catalysts.
---

# Narrative Tracker Skill

## Overview

This skill identifies and tracks the dominant narratives being discussed around an asset, showing their relative strength and evolution. Uses baseline-normalized metrics to identify when narratives are gaining or losing momentum.

## When to Use

Activate this skill when the user asks about:
- "What narratives are driving [TICKER]?"
- "Track the story around [ASSET]"
- "What are people saying about [STOCK]?"
- "Narrative analysis for [CRYPTO]"
- "What's the bull/bear thesis for [TICKER]?"

## XPOZ MCP Data Flow

### Step 1: Gather Narrative Data
Use `getTwitterPostsByKeywords` to fetch recent posts:
```
Query: "$NVDA" or "NVIDIA stock"
Fields: ["id", "text", "authorUsername", "createdAtDate", "retweetCount"]
```

### Step 2: Extract Narratives
- Cluster posts by topic/theme using NLP
- Identify dominant narrative themes
- Calculate mention volume per narrative

### Step 3: Analyze Strength & Trend
- Measure narrative strength as share of total mentions
- Compare current strength to baseline (7-day average)
- Track trend direction (growing/stable/declining)

## Asset Categories for Peer Comparison

| Category | Peer Tickers |
|----------|--------------|
| EV/Auto | TSLA, RIVN, LCID, NIO, GM |
| Big Tech | AAPL, MSFT, GOOGL, AMZN, META |
| AI/Semiconductors | NVDA, AMD, INTC, TSM, AVGO |
| Crypto | BTC, ETH, SOL, DOGE, XRP |
| Meme Stocks | GME, AMC, BBBY, BB, PLTR |

## Output Requirements

Always render a **React artifact** with:
1. **Ticker input field** - Allow any stock/crypto selection
2. **Tabbed interface** with 3 tabs:
   - Narrative Overview: Strength rankings and sentiment
   - Narrative Detail: Key talking points per narrative
   - Category Comparison: Narrative themes vs peers

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, TrendingUp, TrendingDown, MessageCircle, Hash, Search, Layers, Target } from 'lucide-react';

export default function NarrativeTracker() {
  const [ticker, setTicker] = useState('NVDA');
  const [activeTab, setActiveTab] = useState('overview');

  // SAMPLE DATA - Replace with XPOZ MCP data
  const narratives = [
    {
      id: 1,
      title: 'AI Infrastructure Leader',
      strength: 92,
      baseline: 75,
      vsBaseline: 1.23,
      sentiment: 0.85,
      mentions: 12400,
      trend: 'growing',
      keyPoints: [
        'Dominant GPU market share for AI training',
        'Data center revenue growth 200%+ YoY',
        'CUDA ecosystem moat',
        'Blackwell architecture ahead of competition'
      ],
      stance: 'bullish'
    },
    {
      id: 2,
      title: 'Valuation Concerns',
      strength: 45,
      baseline: 38,
      vsBaseline: 1.18,
      sentiment: 0.32,
      mentions: 5600,
      trend: 'growing',
      keyPoints: [
        'P/E ratio elevated vs historicals',
        'Priced for perfection',
        'Competition from AMD/Intel emerging',
        'China revenue headwinds'
      ],
      stance: 'bearish'
    },
    {
      id: 3,
      title: 'Gaming Renaissance',
      strength: 38,
      baseline: 52,
      vsBaseline: 0.73,
      sentiment: 0.68,
      mentions: 3200,
      trend: 'declining',
      keyPoints: [
        'RTX 50 series launch upcoming',
        'DLSS technology leadership',
        'Gaming revenue stabilizing'
      ],
      stance: 'bullish'
    },
    {
      id: 4,
      title: 'Automotive/Robotics',
      strength: 28,
      baseline: 20,
      vsBaseline: 1.40,
      sentiment: 0.72,
      mentions: 2100,
      trend: 'growing',
      keyPoints: [
        'Drive platform adoption',
        'Robotics AI opportunity',
        'Underappreciated growth vector'
      ],
      stance: 'bullish'
    }
  ];

  const peerNarratives = [
    { ticker: 'NVDA', dominant: 'AI Infrastructure', bullBear: '3:1', strengthIndex: 92 },
    { ticker: 'AMD', dominant: 'AI Chip Competitor', bullBear: '2:1', strengthIndex: 78 },
    { ticker: 'INTC', dominant: 'Turnaround Story', bullBear: '1:2', strengthIndex: 65 },
    { ticker: 'TSM', dominant: 'AI Supplier', bullBear: '2:1', strengthIndex: 72 },
    { ticker: 'AVGO', dominant: 'AI Networking', bullBear: '2:1', strengthIndex: 68 }
  ];

  const chartData = narratives.map(n => ({
    name: n.title.split(' ').slice(0, 2).join(' '),
    strength: n.strength,
    baseline: n.baseline,
    fill: n.stance === 'bullish' ? '#22c55e' : '#ef4444'
  }));

  const getTrendIcon = (trend) => {
    if (trend === 'growing') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <span className="w-4 h-4 text-gray-400">→</span>;
  };

  const formatMentions = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const tabs = [
    { id: 'overview', label: 'Narrative Overview', icon: BookOpen },
    { id: 'detail', label: 'Narrative Detail', icon: Target },
    { id: 'comparison', label: 'Category Comparison', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Ticker Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., NVDA, TSLA, BTC)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Narratives</h1>
            <p className="text-slate-400 text-sm">Competing story analysis</p>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {narratives.length} active narratives
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Dominant</div>
          <div className="font-bold text-green-400 truncate">{narratives[0].title.split(' ').slice(0, 2).join(' ')}</div>
          <div className="text-xs text-slate-500">{narratives[0].strength}% share</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Bull/Bear Ratio</div>
          <div className="font-bold">
            {narratives.filter(n => n.stance === 'bullish').length}:{narratives.filter(n => n.stance === 'bearish').length}
          </div>
          <div className="text-xs text-slate-500">narratives</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Total Mentions</div>
          <div className="font-bold text-indigo-400">
            {formatMentions(narratives.reduce((sum, n) => sum + n.mentions, 0))}
          </div>
          <div className="text-xs text-slate-500">24h</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Trending</div>
          <div className="font-bold text-amber-400">
            {narratives.filter(n => n.trend === 'growing').length}
          </div>
          <div className="text-xs text-slate-500">growing narratives</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Narrative Strength Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-400">Narrative Strength vs Baseline</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Bullish</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Bearish</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-slate-500 rounded"></span> Baseline</span>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value, name) => [`${value}%`, name === 'strength' ? 'Current' : 'Baseline']}
                  />
                  <Bar dataKey="baseline" fill="#64748b" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="strength" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <rect key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Narrative List */}
          <div className="space-y-3">
            {narratives.map((narrative) => (
              <div key={narrative.id} className={`bg-slate-800 rounded-lg p-4 border-l-4 ${
                narrative.stance === 'bullish' ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{narrative.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        narrative.stance === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {narrative.stance}
                      </span>
                      {narrative.vsBaseline > 1.1 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                          {narrative.vsBaseline.toFixed(1)}x baseline
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {formatMentions(narrative.mentions)} mentions
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(narrative.trend)}
                        {narrative.trend}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-400">{narrative.strength}%</div>
                    <div className="text-xs text-slate-400">share of voice</div>
                  </div>
                </div>

                {/* Strength Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${narrative.stance === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${narrative.strength}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white"
                      style={{ left: `${narrative.baseline}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Current: {narrative.strength}%</span>
                    <span>Baseline: {narrative.baseline}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="space-y-4">
          {narratives.map((narrative) => (
            <div key={narrative.id} className={`bg-slate-800 rounded-lg p-4 border-l-4 ${
              narrative.stance === 'bullish' ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{narrative.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    narrative.stance === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {narrative.stance}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(narrative.trend)}
                  <span className="text-sm text-slate-400">{narrative.trend}</span>
                </div>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {narrative.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Hash className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {point}
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-700">
                <div>
                  <div className="text-xs text-slate-500">Strength</div>
                  <div className="font-bold text-indigo-400">{narrative.strength}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">vs Baseline</div>
                  <div className={`font-bold ${narrative.vsBaseline >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {narrative.vsBaseline.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Sentiment</div>
                  <div className={`font-bold ${narrative.sentiment >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {(narrative.sentiment * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Mentions</div>
                  <div className="font-bold">{formatMentions(narrative.mentions)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">AI/Semiconductor Narrative Comparison</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-3">Ticker</th>
                  <th className="pb-3">Dominant Narrative</th>
                  <th className="pb-3">Bull/Bear</th>
                  <th className="pb-3">Strength Index</th>
                </tr>
              </thead>
              <tbody>
                {peerNarratives.map((peer) => (
                  <tr key={peer.ticker} className={`border-t border-slate-700 ${peer.ticker === ticker ? 'bg-indigo-500/10' : ''}`}>
                    <td className="py-3">
                      <span className={`font-bold ${peer.ticker === ticker ? 'text-indigo-400' : ''}`}>
                        {peer.ticker}
                        {peer.ticker === ticker && <span className="ml-2 text-xs text-indigo-400">(Selected)</span>}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{peer.dominant}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        peer.bullBear.split(':')[0] > peer.bullBear.split(':')[1]
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {peer.bullBear}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${peer.strengthIndex}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{peer.strengthIndex}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Category Narrative Themes</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI/ML Focus</span>
                  <span className="text-indigo-400 font-bold">4 of 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Valuation Debates</span>
                  <span className="text-slate-400">3 of 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Competitive Threats</span>
                  <span className="text-slate-400">2 of 5</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">{ticker} vs Category</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Narrative Strength</span>
                  <span className="font-bold text-green-400">#1 of 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bull/Bear Skew</span>
                  <span className="font-bold">Highest in category</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Narrative Diversity</span>
                  <span className="font-bold">{narratives.length} active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <p className="text-sm text-indigo-200">
          <strong>Narrative Analysis:</strong> "{narratives[0].title}" dominates {ticker} discussion with {narratives[0].strength}% share of voice ({narratives[0].vsBaseline.toFixed(1)}x baseline).
          Bull narratives outnumber bear {narratives.filter(n => n.stance === 'bullish').length}:{narratives.filter(n => n.stance === 'bearish').length}.
          {narratives.find(n => n.trend === 'growing' && n.stance === 'bearish') ? ' Warning: bearish narrative gaining traction.' : ''}
          {narratives[0].trend === 'growing' ? ' Primary narrative strengthening.' : ''}
        </p>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding These Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-300">Narrative Strength:</strong> Share of total mentions attributed to this narrative theme. Higher = more dominant in conversation.
          </div>
          <div>
            <strong className="text-slate-300">vs Baseline:</strong> Current strength compared to 7-day rolling average. Values above 1.0x indicate growing narratives.
          </div>
          <div>
            <strong className="text-slate-300">Bull/Bear Ratio:</strong> Count of bullish vs bearish narrative themes. Higher first number = more optimistic overall tone.
          </div>
          <div>
            <strong className="text-slate-300">Trend:</strong> Whether narrative strength is increasing (growing), stable, or decreasing (declining) over past 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface NarrativeData {
  ticker: string;
  narratives: Array<{
    id: number;
    title: string;
    strength: number;         // 0-100 share of voice
    baseline: number;         // 7-day average strength
    vsBaseline: number;       // strength / baseline ratio
    sentiment: number;        // 0-1
    mentions: number;
    trend: 'growing' | 'stable' | 'declining';
    keyPoints: string[];
    stance: 'bullish' | 'bearish' | 'neutral';
  }>;
  peerNarratives: Array<{
    ticker: string;
    dominant: string;
    bullBear: string;
    strengthIndex: number;
  }>;
}
```

## Narrative Classification

| Strength | Classification |
|----------|----------------|
| 80-100 | Dominant |
| 50-79 | Strong |
| 25-49 | Emerging |
| <25 | Niche |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/narrative-tracker.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. Accept ticker input from user
2. Fetch narrative data via XPOZ MCP `getTwitterPostsByKeywords`
3. Extract narrative themes using NLP clustering
4. Calculate strength as share of total mentions
5. Compare to baseline (7-day average)
6. Compare to category peers
7. Render React artifact with 3 tabs
8. Suggest Sentiment Shift if narrative changes detected
