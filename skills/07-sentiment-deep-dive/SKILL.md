---
name: sentiment-deep-dive
description: Multi-dimensional sentiment analysis for financial assets. Creates interactive visualizations with pie charts, dimension bars, and sentiment breakdowns. Use when analyzing market mood, understanding sentiment drivers, or comparing fundamental vs technical vs news sentiment.
---

# Sentiment Deep Dive Skill

## Overview

This skill provides comprehensive sentiment analysis across 4 dimensions (fundamental, technical, news, speculative) and renders beautiful interactive visualizations with peer comparison.

## When to Use

Activate this skill when the user asks about:
- "What's the sentiment on [TICKER]?"
- "Is [ASSET] bullish or bearish?"
- "Sentiment breakdown for [STOCK]"
- "What's driving [CRYPTO] sentiment?"
- "Market mood for [TICKER]"

## XPOZ MCP Data Flow

### Step 1: Get Real-Time Twitter Data
```
Use getTwitterPostsByKeywords with:
- query: "$TSLA" or "Tesla stock"
- Include cashtags and common variations
- fields: ["text", "authorUsername", "createdAt", "retweetCount"]
```

### Step 2: Sentiment Classification
Analyze each tweet for:
- **Bullish indicators**: "buy", "long", "moon", "breakout", "bullish", rocket emojis
- **Bearish indicators**: "sell", "short", "crash", "bearish", "dump"
- **Neutral indicators**: questions, news without opinion, factual statements

### Step 3: Dimension Extraction
Classify sentiment sources:
- **Fundamental**: earnings, revenue, margins, guidance mentions
- **Technical**: RSI, support, resistance, chart patterns, indicators
- **News**: announcements, analyst ratings, media coverage
- **Speculative**: options, short interest, retail hype, YOLO, diamond hands

### Step 4: Category Peer Comparison
Map ticker to category and fetch peer sentiment for comparison.

## Output Requirements

Always render a **React artifact** with:
1. **Ticker input field** at the top
2. **3 tabs**: Sentiment Overview | Dimension Analysis | Category Comparison
3. Overall sentiment gauge with confidence score
4. Pie chart showing bullish/bearish/neutral split
5. Dimension bars with key drivers
6. Peer comparison with category averages

## Category Mapping

| Category | Tickers |
|----------|---------|
| EV | TSLA, RIVN, LCID, NIO, XPEV |
| Big Tech | AAPL, MSFT, GOOGL, META, AMZN |
| AI/Semiconductors | NVDA, AMD, INTC, AVGO, QCOM |
| Crypto | BTC, ETH, SOL, DOGE, XRP |
| Meme Stocks | GME, AMC, BBBY, BB, NOK |

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Search, Activity, GitCompare, Target } from 'lucide-react';

export default function SentimentDeepDive() {
  const [ticker, setTicker] = useState('TSLA');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - populated from XPOZ MCP analysis
  const overall = {
    score: 0.65,
    label: 'Bullish',
    confidence: 0.82,
    sampleSize: 8420,
    timeRange: '24h'
  };

  const breakdown = [
    { name: 'Bullish', value: 65, color: '#22c55e' },
    { name: 'Bearish', value: 20, color: '#ef4444' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
  ];

  const dimensions = [
    {
      name: 'Fundamental',
      score: 0.72,
      baseline: 0.55,
      drivers: ['Earnings beat expectations', 'Delivery numbers strong', 'Margin expansion'],
      tweetCount: 1840
    },
    {
      name: 'Technical',
      score: 0.45,
      baseline: 0.50,
      drivers: ['RSI approaching overbought', 'Support level holding', 'Volume increasing'],
      tweetCount: 2100
    },
    {
      name: 'News',
      score: 0.78,
      baseline: 0.52,
      drivers: ['Positive analyst coverage', 'Product announcements', 'Partnership news'],
      tweetCount: 2850
    },
    {
      name: 'Speculative',
      score: 0.55,
      baseline: 0.48,
      drivers: ['Options activity elevated', 'Short interest declining', 'Retail interest high'],
      tweetCount: 1630
    }
  ];

  // Category comparison data
  const category = 'EV';
  const peers = [
    { ticker: 'TSLA', sentiment: 0.65, bullish: 65, bearish: 20, isTarget: true },
    { ticker: 'RIVN', sentiment: 0.52, bullish: 52, bearish: 30, isTarget: false },
    { ticker: 'LCID', sentiment: 0.48, bullish: 48, bearish: 35, isTarget: false },
    { ticker: 'NIO', sentiment: 0.55, bullish: 55, bearish: 28, isTarget: false },
    { ticker: 'XPEV', sentiment: 0.51, bullish: 51, bearish: 32, isTarget: false }
  ];

  const categoryAvg = {
    sentiment: 0.54,
    bullish: 54,
    bearish: 29
  };

  const radarData = dimensions.map(d => ({
    dimension: d.name,
    score: d.score * 100,
    baseline: d.baseline * 100
  }));

  const getScoreColor = (score) => {
    if (score >= 0.6) return 'text-green-400';
    if (score <= 0.4) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getLabelColor = (label) => {
    if (label === 'Bullish') return 'text-green-400';
    if (label === 'Bearish') return 'text-red-400';
    return 'text-gray-400';
  };

  const tabs = [
    { id: 'overview', label: 'Sentiment Overview', icon: BarChart3 },
    { id: 'dimensions', label: 'Dimension Analysis', icon: Activity },
    { id: 'comparison', label: 'Category Comparison', icon: GitCompare }
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
            placeholder="Enter ticker (e.g., TSLA, NVDA, BTC)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Sentiment</h1>
            <p className="text-slate-400 text-sm">Multi-dimensional analysis • {overall.sampleSize.toLocaleString()} tweets • {overall.timeRange}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getLabelColor(overall.label)}`}>
            {overall.label}
          </div>
          <div className="text-slate-400 text-sm">
            {(overall.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
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
          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment Breakdown</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {breakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name} {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Score Gauge */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment Score</h3>
              <div className="flex flex-col items-center justify-center h-48">
                <div className={`text-6xl font-bold ${getScoreColor(overall.score)}`}>
                  {(overall.score * 100).toFixed(0)}
                </div>
                <div className="text-slate-400 text-sm mt-2">out of 100</div>
                <div className="w-full h-3 bg-slate-700 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overall.score >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${overall.score * 100}%` }}
                  />
                </div>
                <div className="flex justify-between w-full text-xs text-slate-500 mt-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dimension Summary */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Dimension Summary</h3>
            <div className="space-y-3">
              {dimensions.map((dim) => (
                <div key={dim.name} className="flex items-center gap-4">
                  <span className="text-sm text-slate-300 w-24">{dim.name}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dim.score >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${dim.score * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${getScoreColor(dim.score)}`}>
                    {(dim.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dimensions' && (
        <div className="space-y-6">
          {/* Radar Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Dimension Radar vs Baseline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar
                    name="Current"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Baseline"
                    dataKey="baseline"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-slate-400">Current</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-slate-500" />
                <span className="text-slate-400">3-Day Baseline</span>
              </div>
            </div>
          </div>

          {/* Dimension Details */}
          <div className="grid grid-cols-2 gap-4">
            {dimensions.map((dim) => (
              <div key={dim.name} className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dim.score >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{dim.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getScoreColor(dim.score)}`}>
                      {(dim.score * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      vs {(dim.baseline * 100).toFixed(0)}% baseline
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${dim.score >= 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${dim.score * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mb-2">{dim.tweetCount.toLocaleString()} tweets analyzed</div>
                <ul className="space-y-1">
                  {dim.drivers.map((driver, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-slate-600">•</span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Category Header */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{category} Category</h3>
                <p className="text-slate-400 text-sm">Comparing {ticker} sentiment to peers</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Category Average</div>
                <div className={`text-xl font-bold ${getScoreColor(categoryAvg.sentiment)}`}>
                  {(categoryAvg.sentiment * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Peer Comparison Bar Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment by Ticker</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peers} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="ticker" stroke="#64748b" fontSize={12} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="sentiment" name="Sentiment" radius={[0, 4, 4, 0]}>
                    {peers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isTarget ? '#3b82f6' : entry.sentiment >= 0.5 ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peer Cards */}
          <div className="grid grid-cols-5 gap-3">
            {peers.map((peer) => (
              <div
                key={peer.ticker}
                className={`bg-slate-800 rounded-lg p-3 text-center ${
                  peer.isTarget ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className={`text-lg font-bold ${peer.isTarget ? 'text-blue-400' : 'text-slate-300'}`}>
                  {peer.ticker}
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(peer.sentiment)}`}>
                  {(peer.sentiment * 100).toFixed(0)}%
                </div>
                <div className="flex justify-center gap-2 mt-2 text-xs">
                  <span className="text-green-400">{peer.bullish}% bull</span>
                  <span className="text-red-400">{peer.bearish}% bear</span>
                </div>
                {peer.isTarget && (
                  <div className="mt-2 text-xs text-blue-400 flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" />
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* vs Category Average */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">{ticker} vs Category Average</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Sentiment</div>
                <div className={`text-xl font-bold ${overall.score > categoryAvg.sentiment ? 'text-green-400' : 'text-red-400'}`}>
                  {overall.score > categoryAvg.sentiment ? '+' : ''}{((overall.score - categoryAvg.sentiment) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Bullish %</div>
                <div className={`text-xl font-bold ${breakdown[0].value > categoryAvg.bullish ? 'text-green-400' : 'text-red-400'}`}>
                  {breakdown[0].value > categoryAvg.bullish ? '+' : ''}{(breakdown[0].value - categoryAvg.bullish).toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">Rank in Category</div>
                <div className="text-xl font-bold text-blue-400">
                  #1 of {peers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>Analysis:</strong> {ticker} shows overall {overall.label.toLowerCase()} sentiment
          ({(overall.score * 100).toFixed(0)}% score) based on {overall.sampleSize.toLocaleString()} tweets.
          Strongest dimension: {dimensions.reduce((a, b) => a.score > b.score ? a : b).name} at {(dimensions.reduce((a, b) => a.score > b.score ? a : b).score * 100).toFixed(0)}%.
          {ticker} ranks above category average by {((overall.score - categoryAvg.sentiment) * 100).toFixed(0)} points.
          {overall.score > 0.6 ? ' Social sentiment is supportive of bullish positioning.' : ''}
        </p>
      </div>
    </div>
  );
}
```

## Metric Explanations

### Overall Sentiment Score (0-100)
- **0-40**: Bearish - Majority negative discussion
- **40-60**: Neutral - Mixed or balanced sentiment
- **60-100**: Bullish - Majority positive discussion

### Confidence Score
Calculated from:
- Sample size (more tweets = higher confidence)
- Agreement level (less variance = higher confidence)
- Account quality (verified, follower count)

### Dimension Scores
Each dimension analyzed separately:
- **Fundamental (0-100)**: Sentiment about business metrics
- **Technical (0-100)**: Sentiment about chart/price action
- **News (0-100)**: Sentiment about media coverage
- **Speculative (0-100)**: Sentiment about trading activity

### Baseline Comparison
- 3-day average sentiment for each dimension
- Shows if current sentiment is elevated or depressed
- Helps identify sentiment shifts

## Data Format

```typescript
interface SentimentData {
  ticker: string;
  overall: {
    score: number;           // 0-1 scale
    label: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
    sampleSize: number;
    timeRange: string;
  };
  breakdown: {
    bullish: number;         // percentage
    bearish: number;
    neutral: number;
  };
  dimensions: Array<{
    name: string;
    score: number;
    baseline: number;
    drivers: string[];
    tweetCount: number;
  }>;
  peers: Array<{
    ticker: string;
    sentiment: number;
    bullish: number;
    bearish: number;
    isTarget: boolean;
  }>;
  categoryAvg: {
    sentiment: number;
    bullish: number;
    bearish: number;
  };
}
```

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/sentiment-deep-dive.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. Accept any ticker input from user
2. Use XPOZ MCP to fetch real-time Twitter data
3. Classify sentiment for each tweet (bullish/bearish/neutral)
4. Categorize tweets by dimension (fundamental/technical/news/speculative)
5. Calculate scores and compare to 3-day baseline
6. Map ticker to category and fetch peer sentiment
7. Render the React artifact with all 3 tabs populated
8. Provide actionable interpretation
9. Suggest related analyses (Velocity Tracker, Narrative Tracker, Sentiment Shift)
