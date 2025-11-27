---
name: sentiment-shift
description: Detect and visualize sentiment changes over time for financial assets. Shows shift magnitude, timing, and potential catalysts. Use when monitoring for sentiment reversals, tracking narrative changes, or identifying inflection points.
---

# Sentiment Shift Skill

## Overview

This skill detects significant changes in sentiment over time, alerting to potential reversals or momentum shifts. Uses baseline-normalized metrics to identify when sentiment is shifting abnormally.

## When to Use

Activate this skill when the user asks about:
- "Has sentiment changed on [TICKER]?"
- "Detect sentiment shifts for [ASSET]"
- "Is [STOCK] sentiment reversing?"
- "Any mood changes on [CRYPTO]?"
- "Track sentiment inflection for [TICKER]"

## Data Source: XPOZ MCP

### ⚠️ CRITICAL: Query Expansion (MUST DO!)

Before fetching Twitter data for ANY ticker, you MUST expand the query to include the company name. **Searching only for ticker symbols ($GOOG, #GOOG) will miss 80%+ of mentions!**

**For each ticker, use an expanded query:**

| Ticker | Expanded Query |
|--------|----------------|
| TSLA | `$TSLA OR #TSLA OR TSLA OR Tesla` |
| NVDA | `$NVDA OR #NVDA OR NVDA OR NVIDIA` |
| GOOGL | `$GOOG OR #GOOG OR GOOG OR $GOOGL OR #GOOGL OR GOOGL OR Google OR Alphabet` |
| AAPL | `$AAPL OR #AAPL OR AAPL OR Apple` |
| MSFT | `$MSFT OR #MSFT OR MSFT OR Microsoft` |

**For other tickers**, look up the company name via web search: `"{TICKER} stock company name"`

### Step 1: Gather Sentiment Data
Use `getTwitterPostsByKeywords` to fetch recent posts with EXPANDED query:
```
Query: "$TSLA OR #TSLA OR TSLA OR Tesla" (see expansion table above)
Fields: ["id", "text", "authorUsername", "createdAtDate", "retweetCount"]
```

### Step 2: Build Sentiment Timeline
- Group posts by time period (hourly for 24h, daily for weekly view)
- Calculate sentiment score per period using NLP classification
- Compare current sentiment to baseline (3-day rolling average)

### Step 3: Detect Shifts
- Flag periods where sentiment change exceeds threshold (>15% change)
- Identify catalysts from high-engagement posts during shift windows
- Track shift duration and sustainability

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
   - Shift Timeline: Sentiment over time with shift markers
   - Catalyst Analysis: What drove the shift
   - Category Comparison: How shift compares to peers

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, Calendar, Layers, Zap, MessageCircle } from 'lucide-react';

export default function SentimentShift() {
  const [activeTab, setActiveTab] = useState('timeline');

  // CLAUDE: Replace with actual ticker
  const ticker = 'META';

  // CLAUDE: Replace with user's local hour (0-23)
  const generatedAtHour = 12;

  // SAMPLE DATA - Replace with XPOZ MCP data
  const sentimentHistory = [
    { time: '24h ago', sentiment: 0.42, baseline: 0.50, vsBaseline: 0.84, label: 'Bearish' },
    { time: '20h ago', sentiment: 0.44, baseline: 0.50, vsBaseline: 0.88, label: 'Bearish' },
    { time: '16h ago', sentiment: 0.48, baseline: 0.50, vsBaseline: 0.96, label: 'Neutral' },
    { time: '12h ago', sentiment: 0.52, baseline: 0.50, vsBaseline: 1.04, shift: true, label: 'Neutral' },
    { time: '8h ago', sentiment: 0.65, baseline: 0.50, vsBaseline: 1.30, shift: true, label: 'Bullish' },
    { time: '4h ago', sentiment: 0.72, baseline: 0.50, vsBaseline: 1.44, label: 'Bullish' },
    { time: 'Now', sentiment: 0.75, baseline: 0.50, vsBaseline: 1.50, label: 'Bullish' },
  ];

  const shifts = [
    {
      id: 1,
      date: '12h ago',
      type: 'reversal',
      from: { score: 0.42, label: 'Bearish' },
      to: { score: 0.75, label: 'Bullish' },
      magnitude: 0.33,
      catalyst: 'Earnings beat + AI revenue growth announced',
      confidence: 0.88,
      sustainedHours: 12
    }
  ];

  const catalysts = [
    { text: 'META crushes Q4 earnings, AI revenue up 300%', engagement: 45000, sentiment: 0.92, time: '12h ago' },
    { text: 'Zuckerberg announces major AI infrastructure investment', engagement: 32000, sentiment: 0.85, time: '11h ago' },
    { text: 'Analysts raise price targets after earnings call', engagement: 18000, sentiment: 0.78, time: '10h ago' },
    { text: 'META stock up 15% in after-hours trading', engagement: 25000, sentiment: 0.88, time: '9h ago' }
  ];

  const peerComparison = [
    { ticker: 'META', shift: 0.33, direction: 'bullish', catalyst: 'Earnings', vsCategory: 3.3 },
    { ticker: 'AAPL', shift: 0.08, direction: 'bullish', catalyst: 'None', vsCategory: 0.8 },
    { ticker: 'GOOGL', shift: -0.05, direction: 'bearish', catalyst: 'Minor', vsCategory: -0.5 },
    { ticker: 'MSFT', shift: 0.12, direction: 'bullish', catalyst: 'AI news', vsCategory: 1.2 },
    { ticker: 'AMZN', shift: 0.10, direction: 'bullish', catalyst: 'None', vsCategory: 1.0 }
  ];

  const currentShift = shifts[0];

  const getMagnitudeLabel = (mag) => {
    if (mag >= 0.3) return { label: 'Major', color: 'text-red-400 bg-red-500/20' };
    if (mag >= 0.2) return { label: 'Significant', color: 'text-orange-400 bg-orange-500/20' };
    if (mag >= 0.1) return { label: 'Moderate', color: 'text-yellow-400 bg-yellow-500/20' };
    return { label: 'Minor', color: 'text-green-400 bg-green-500/20' };
  };

  const shiftMagnitude = getMagnitudeLabel(currentShift?.magnitude || 0);

  const tabs = [
    { id: 'timeline', label: 'Shift Timeline', icon: Calendar },
    { id: 'catalysts', label: 'Catalyst Analysis', icon: Zap },
    { id: 'comparison', label: 'Category Comparison', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Sentiment Shift</h1>
            <p className="text-slate-400 text-sm">Trend reversal detection (24h) • Generated at {generatedAtHour}:00</p>
          </div>
        </div>
        {shifts.length > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${shiftMagnitude.color}`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{shiftMagnitude.label} Shift Detected</span>
          </div>
        )}
      </div>

      {/* Shift Summary Card */}
      {currentShift && (
        <div className="bg-gradient-to-r from-red-500/10 to-green-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* From */}
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Before (Baseline)</div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {(currentShift.from.score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">{currentShift.from.label}</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <div className="text-3xl text-amber-400">→</div>
                <div className="text-xs text-amber-400 font-bold">+{(currentShift.magnitude * 100).toFixed(0)}%</div>
                <div className="text-xs text-slate-500">{currentShift.sustainedHours}h sustained</div>
              </div>

              {/* To */}
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">After (Current)</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {(currentShift.to.score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">{currentShift.to.label}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">
                Confidence: {(currentShift.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-400">Primary Catalyst:</div>
            <div className="text-sm text-amber-200 mt-1">{currentShift.catalyst}</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-400">Sentiment Timeline (24h)</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-amber-400 rounded"></span> Sentiment</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-slate-500 rounded"></span> Baseline (50%)</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentHistory}>
                  <defs>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value, name) => [
                      name === 'sentiment' ? `${(value * 100).toFixed(0)}%` : `${(value * 100).toFixed(0)}%`,
                      name === 'sentiment' ? 'Sentiment' : 'Baseline'
                    ]}
                  />
                  <ReferenceLine y={0.5} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Neutral', fill: '#64748b', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#sentimentGradient)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.shift) {
                        return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
                      }
                      return <circle cx={cx} cy={cy} r={3} fill="#fbbf24" />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center">
              Red dots indicate shift detection points
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Current Sentiment</div>
              <div className="text-2xl font-bold text-green-400">
                {(sentimentHistory[sentimentHistory.length-1].sentiment * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500">vs 50% baseline = 1.5x</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Shift Magnitude</div>
              <div className="text-2xl font-bold text-amber-400">
                +{(currentShift?.magnitude * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500">{shiftMagnitude.label}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Shift Duration</div>
              <div className="text-2xl font-bold">{currentShift?.sustainedHours || 0}h</div>
              <div className="text-xs text-slate-500">Sustained</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">vs Category Avg</div>
              <div className="text-2xl font-bold text-green-400">3.3x</div>
              <div className="text-xs text-slate-500">Stronger shift</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'catalysts' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">High-Impact Posts During Shift Window</h3>
            <div className="space-y-3">
              {catalysts.map((post, i) => (
                <div key={i} className="p-3 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-white">{post.text}</p>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                      post.sentiment >= 0.8 ? 'bg-green-500/20 text-green-400' :
                      post.sentiment >= 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {(post.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {(post.engagement / 1000).toFixed(1)}K engagement
                    </span>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Catalyst Categories</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Earnings/Financial</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-xs text-green-400">65%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Product/AI News</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-xs text-blue-400">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Analyst Coverage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-xs text-purple-400">10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Shift Sustainability</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400 mb-2">88%</div>
                <div className="text-sm text-slate-400">Confidence</div>
                <div className="text-xs text-slate-500 mt-2">
                  High-quality catalyst (earnings) + sustained duration suggests shift is likely to hold
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Big Tech Sentiment Shift Comparison (24h)</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-3">Ticker</th>
                  <th className="pb-3">Shift</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">Catalyst</th>
                  <th className="pb-3">vs Category Avg</th>
                </tr>
              </thead>
              <tbody>
                {peerComparison.map((peer) => (
                  <tr key={peer.ticker} className={`border-t border-slate-700 ${peer.ticker === ticker ? 'bg-amber-500/10' : ''}`}>
                    <td className="py-3">
                      <span className={`font-bold ${peer.ticker === ticker ? 'text-amber-400' : ''}`}>
                        {peer.ticker}
                        {peer.ticker === ticker && <span className="ml-2 text-xs text-amber-400">(Selected)</span>}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={peer.shift >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {peer.shift >= 0 ? '+' : ''}{(peer.shift * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        peer.direction === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {peer.direction}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-400">{peer.catalyst}</td>
                    <td className="py-3">
                      <span className={peer.vsCategory >= 1 ? 'text-green-400' : 'text-slate-400'}>
                        {peer.vsCategory.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Category Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category Avg Shift</span>
                  <span className="font-bold text-green-400">+10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{ticker} vs Category</span>
                  <span className="font-bold text-amber-400">3.3x larger</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank in Category</span>
                  <span className="font-bold">#1 of 5</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Shift Type Analysis</h3>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">4</div>
                  <div className="text-xs text-slate-500">Bullish Shifts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">1</div>
                  <div className="text-xs text-slate-500">Bearish Shifts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-sm text-amber-200">
          <strong>Shift Analysis:</strong> {ticker} underwent a {shiftMagnitude.label.toLowerCase()} sentiment reversal
          from {currentShift?.from.label.toLowerCase()} ({(currentShift?.from.score * 100).toFixed(0)}%) to {currentShift?.to.label.toLowerCase()} ({(currentShift?.to.score * 100).toFixed(0)}%).
          Primary catalyst: {currentShift?.catalyst}. This shift is 3.3x larger than the category average and ranks #1 among Big Tech peers.
          Shift has been sustained for {currentShift?.sustainedHours}h with {(currentShift?.confidence * 100).toFixed(0)}% confidence.
        </p>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding These Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-300">Shift Magnitude:</strong> Absolute change in sentiment score. Major (30%+) = Complete reversal, Significant (20-30%) = Strong shift, Moderate (10-20%) = Notable change.
          </div>
          <div>
            <strong className="text-slate-300">Catalyst Confidence:</strong> Likelihood the identified catalyst truly caused the shift based on timing alignment, engagement volume, and content relevance.
          </div>
          <div>
            <strong className="text-slate-300">vs Category:</strong> How this ticker's shift compares to its peer group's average shift. Values above 1.0x indicate stronger-than-average shifts.
          </div>
          <div>
            <strong className="text-slate-300">Sustainability:</strong> Duration the new sentiment level has held. Shifts sustained 12+ hours are more likely to persist.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface SentimentShiftData {
  ticker: string;
  sentimentHistory: Array<{
    time: string;
    sentiment: number;        // 0-1 score
    baseline: number;         // 3-day average for this hour
    vsBaseline: number;       // sentiment / baseline ratio
    shift?: boolean;          // Flag shift detection points
    label: string;
  }>;
  shifts: Array<{
    id: number;
    date: string;
    type: 'reversal' | 'acceleration' | 'deceleration';
    from: { score: number; label: string };
    to: { score: number; label: string };
    magnitude: number;        // Absolute change
    catalyst: string;
    confidence: number;
    sustainedHours: number;
  }>;
  catalysts: Array<{
    text: string;
    engagement: number;
    sentiment: number;
    time: string;
  }>;
  peerComparison: Array<{
    ticker: string;
    shift: number;
    direction: 'bullish' | 'bearish';
    catalyst: string;
    vsCategory: number;
  }>;
}
```

## Shift Classification

| Magnitude | Label | Interpretation |
|-----------|-------|----------------|
| 30%+ | Major | Complete reversal |
| 20-30% | Significant | Strong shift |
| 10-20% | Moderate | Notable change |
| <10% | Minor | Normal fluctuation |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/sentiment-shift.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **NO SEARCH BOX** - Do not add any search input UI
5. **LOCAL TIME** - Set `generatedAtHour` to user's current hour
6. **EXPANDED QUERIES** - Include company name in all queries

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any search UI** - The template has no search functionality. Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - Before fetching data, expand the ticker to include company name (see query expansion table above).

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC. Ask the user their timezone if unsure.

### Data Collection Steps

1. Expand the query to include company name (see table above)
2. Fetch sentiment data via XPOZ MCP `getTwitterPostsByKeywords` with expanded query
3. Calculate baseline (3-day average sentiment per hour)
4. Detect shifts where sentiment change exceeds 10% threshold
5. Identify catalysts from high-engagement posts during shift window
6. Compare shift to category peers
7. Render React artifact with 3 tabs
8. Explain shift sustainability and confidence
