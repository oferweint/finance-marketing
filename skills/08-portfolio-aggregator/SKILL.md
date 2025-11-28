---
name: portfolio-aggregator
version: 2025-11-28
description: Aggregate social sentiment and velocity across an entire portfolio. Shows portfolio health score, flagged holdings, and cross-asset correlations. Use when monitoring watchlists, checking portfolio sentiment exposure, or identifying problem holdings.
---

# Portfolio Aggregator Skill

## Overview

This skill analyzes social metrics across multiple holdings simultaneously, providing a portfolio-level view of sentiment and velocity with category-based peer analysis.

## When to Use

Activate this skill when the user asks about:
- "Analyze sentiment across my portfolio"
- "Portfolio health check"
- "Which holdings should I worry about?"
- "Social metrics for my watchlist"
- "Aggregate sentiment for [LIST]"

## XPOZ MCP Data Flow

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

### Step 1: Get Portfolio Holdings
Accept user's portfolio as comma-separated tickers or named list.

### Step 2: Fetch Data for Each Holding
```
For each ticker, use getTwitterPostsByKeywords:
- query: "$NVDA OR #NVDA OR NVDA OR NVIDIA" (EXPANDED query with company name!)
- fields: ["text", "authorUsername", "createdAt", "retweetCount"]
- Get 24h of data
```

### Step 3: Calculate Per-Holding Metrics
For each ticker:
- **Sentiment**: Classify tweets as bullish/bearish/neutral
- **Velocity**: Count mentions per hour vs 3-day baseline
- **Change**: Compare to previous day sentiment
- **Status**: Flag based on velocity + sentiment combination

### Step 4: Aggregate Portfolio Metrics
- Weighted sentiment by position size
- Average velocity across holdings
- Overall health score

## Output Requirements

Always render a **React artifact** with:
1. **Portfolio input field** for adding holdings
2. **3 tabs**: Portfolio Overview | Holdings Detail | Category Analysis
3. Portfolio health score gauge
4. Holdings table with all metrics
5. Flagged holdings alerts
6. Category breakdown with peer comparison

## Category Mapping

| Category | Tickers |
|----------|---------|
| EV | TSLA, RIVN, LCID, NIO, XPEV |
| Big Tech | AAPL, MSFT, GOOGL, META, AMZN |
| AI/Semiconductors | NVDA, AMD, INTC, AVGO, QCOM |
| Crypto | BTC, ETH, SOL, DOGE, XRP |
| Meme Stocks | GME, AMC, BBBY, BB, NOK |
| Financials | JPM, BAC, GS, MS, WFC |
| Healthcare | JNJ, UNH, PFE, ABBV, MRK |

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, AlertTriangle, TrendingUp, TrendingDown, Shield, Activity, Layers, Target } from 'lucide-react';

export default function PortfolioAggregator() {
  const [activeTab, setActiveTab] = useState('overview');

  // CLAUDE: Set these to the values you're analyzing
  const portfolioName = 'Tech Growth Portfolio'; // CLAUDE: Replace with actual portfolio name
  const generatedAtHour = 12; // CLAUDE: Replace with user's local hour (0-23)

  const holdings = [
    { ticker: 'NVDA', weight: 25, sentiment: 0.82, velocity: 8.5, velocityBaseline: 1.8, change: 1.2, status: 'healthy', category: 'AI/Semiconductors' },
    { ticker: 'TSLA', weight: 20, sentiment: 0.58, velocity: 7.2, velocityBaseline: 1.5, change: -0.8, status: 'watch', category: 'EV' },
    { ticker: 'AAPL', weight: 18, sentiment: 0.71, velocity: 4.5, velocityBaseline: 1.1, change: 0.2, status: 'healthy', category: 'Big Tech' },
    { ticker: 'MSFT', weight: 15, sentiment: 0.75, velocity: 5.1, velocityBaseline: 1.2, change: 0.5, status: 'healthy', category: 'Big Tech' },
    { ticker: 'AMD', weight: 12, sentiment: 0.68, velocity: 6.8, velocityBaseline: 1.4, change: 0.9, status: 'healthy', category: 'AI/Semiconductors' },
    { ticker: 'PLTR', weight: 10, sentiment: 0.45, velocity: 8.9, velocityBaseline: 2.1, change: 2.1, status: 'flag', category: 'AI/Semiconductors' }
  ];

  const portfolioMetrics = {
    healthScore: 7.4,
    weightedSentiment: 0.69,
    avgVelocity: 6.8,
    avgVelocityBaseline: 1.5,
    flaggedCount: holdings.filter(h => h.status === 'flag').length,
    watchCount: holdings.filter(h => h.status === 'watch').length
  };

  const sentimentDistribution = [
    { name: 'Bullish', value: 65, color: '#22c55e' },
    { name: 'Neutral', value: 25, color: '#6b7280' },
    { name: 'Bearish', value: 10, color: '#ef4444' }
  ];

  // Category analysis
  const categoryBreakdown = [
    { category: 'AI/Semiconductors', weight: 47, avgSentiment: 0.65, avgVelocity: 8.1, holdings: 3, categoryAvgSentiment: 0.62 },
    { category: 'Big Tech', weight: 33, avgSentiment: 0.73, avgVelocity: 4.8, holdings: 2, categoryAvgSentiment: 0.70 },
    { category: 'EV', weight: 20, avgSentiment: 0.58, avgVelocity: 7.2, holdings: 1, categoryAvgSentiment: 0.55 }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      healthy: 'bg-green-500/20 text-green-400 border-green-500/30',
      watch: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      flag: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const icons = {
      healthy: <Shield className="w-3 h-3" />,
      watch: <AlertTriangle className="w-3 h-3" />,
      flag: <AlertTriangle className="w-3 h-3" />
    };
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const getHealthColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 0.6) return 'text-green-400';
    if (sentiment >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: Briefcase },
    { id: 'holdings', label: 'Holdings Detail', icon: Activity },
    { id: 'categories', label: 'Category Analysis', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">{portfolioName}</h1>
            <p className="text-slate-400 text-sm">{holdings.length} holdings • Social metrics aggregation • Generated at {generatedAtHour}:00</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getHealthColor(portfolioMetrics.healthScore)}`}>
            {portfolioMetrics.healthScore}
          </div>
          <div className="text-sm text-slate-400">Health Score /10</div>
        </div>
      </div>

      {/* Alert Banner */}
      {(portfolioMetrics.flaggedCount > 0 || portfolioMetrics.watchCount > 0) && (
        <div className="flex items-center gap-4 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-yellow-200">
            {portfolioMetrics.flaggedCount} holding(s) flagged, {portfolioMetrics.watchCount} on watch list
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
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
          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sentiment Distribution */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Portfolio Sentiment</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {sentimentDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name} {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Weighted Sentiment</span>
                    <span className={portfolioMetrics.weightedSentiment >= 0.6 ? 'text-green-400' : 'text-yellow-400'}>
                      {(portfolioMetrics.weightedSentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${portfolioMetrics.weightedSentiment * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Avg Velocity</span>
                    <span className="text-blue-400">{portfolioMetrics.avgVelocityBaseline.toFixed(1)}x baseline</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(portfolioMetrics.avgVelocityBaseline / 3 * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-lg font-bold">{holdings.length}</div>
                    <div className="text-xs text-slate-400">Holdings</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-lg font-bold text-yellow-400">{portfolioMetrics.watchCount}</div>
                    <div className="text-xs text-slate-400">Watch</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700 rounded">
                    <div className="text-lg font-bold text-red-400">{portfolioMetrics.flaggedCount}</div>
                    <div className="text-xs text-slate-400">Flagged</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Holdings Table */}
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr className="text-left text-xs text-slate-400">
                  <th className="p-3">Ticker</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Velocity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 5).map((h) => (
                  <tr key={h.ticker} className="border-t border-slate-700">
                    <td className="p-3 font-bold">{h.ticker}</td>
                    <td className="p-3 text-slate-400">{h.weight}%</td>
                    <td className="p-3">
                      <span className={getSentimentColor(h.sentiment)}>
                        {(h.sentiment * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-blue-400">{h.velocityBaseline.toFixed(1)}x</td>
                    <td className="p-3">{getStatusBadge(h.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="space-y-6">
          {/* Full Holdings Table */}
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr className="text-left text-xs text-slate-400">
                  <th className="p-3">Ticker</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Velocity</th>
                  <th className="p-3">24h Change</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.ticker} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="p-3 font-bold">{h.ticker}</td>
                    <td className="p-3 text-slate-400">{h.weight}%</td>
                    <td className="p-3 text-xs text-slate-500">{h.category}</td>
                    <td className="p-3">
                      <span className={getSentimentColor(h.sentiment)}>
                        {(h.sentiment * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">{h.velocityBaseline.toFixed(1)}x</span>
                        <span className="text-xs text-slate-500">baseline</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 ${h.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {h.change >= 0 ? '+' : ''}{h.change}
                      </span>
                    </td>
                    <td className="p-3">{getStatusBadge(h.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Flagged Holdings Detail */}
          {holdings.filter(h => h.status === 'flag').length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Flagged Holdings - Requires Attention
              </h3>
              {holdings.filter(h => h.status === 'flag').map(h => (
                <div key={h.ticker} className="p-3 bg-slate-800 rounded mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">{h.ticker}</span>
                      <span className="text-slate-400 ml-2 text-sm">{h.weight}% of portfolio</span>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400">{(h.sentiment * 100).toFixed(0)}% sentiment</div>
                      <div className="text-blue-400 text-sm">{h.velocityBaseline.toFixed(1)}x velocity</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    High velocity ({h.velocityBaseline.toFixed(1)}x baseline) combined with declining sentiment indicates elevated risk.
                    Consider deeper analysis or position adjustment.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Allocation Bar */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Category Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`${value}%`, 'Weight']}
                  />
                  <Bar dataKey="weight" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-3 gap-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2">{cat.category}</h4>
                <div className="text-2xl font-bold text-emerald-400 mb-1">{cat.weight}%</div>
                <div className="text-xs text-slate-400 mb-3">{cat.holdings} holdings</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg Sentiment</span>
                    <span className={getSentimentColor(cat.avgSentiment)}>
                      {(cat.avgSentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">vs Category Avg</span>
                    <span className={cat.avgSentiment >= cat.categoryAvgSentiment ? 'text-green-400' : 'text-red-400'}>
                      {cat.avgSentiment >= cat.categoryAvgSentiment ? '+' : ''}
                      {((cat.avgSentiment - cat.categoryAvgSentiment) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg Velocity</span>
                    <span className="text-blue-400">{(cat.avgVelocity / 5).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category Concentration Warning */}
          {categoryBreakdown.some(c => c.weight > 40) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Concentration Warning
              </h3>
              <p className="text-xs text-slate-400">
                {categoryBreakdown.find(c => c.weight > 40)?.category} represents {categoryBreakdown.find(c => c.weight > 40)?.weight}% of portfolio.
                Consider diversification to reduce sector-specific sentiment risk.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <p className="text-sm text-emerald-200">
          <strong>Portfolio Analysis:</strong> Overall health score is {portfolioMetrics.healthScore}/10 with
          {portfolioMetrics.weightedSentiment >= 0.6 ? ' positive' : ' mixed'} weighted sentiment ({(portfolioMetrics.weightedSentiment * 100).toFixed(0)}%).
          Average velocity is {portfolioMetrics.avgVelocityBaseline.toFixed(1)}x baseline.
          {portfolioMetrics.flaggedCount > 0 && ` ${holdings.filter(h => h.status === 'flag').map(h => h.ticker).join(', ')} flagged for elevated velocity with declining sentiment.`}
          {portfolioMetrics.watchCount > 0 && ` ${holdings.filter(h => h.status === 'watch').map(h => h.ticker).join(', ')} on watch list.`}
        </p>
      </div>
    </div>
  );
}
```

## Metric Explanations

### Portfolio Health Score (0-10)
Composite score based on:
- **Weighted Sentiment (40%)**: Position-weighted average sentiment
- **Velocity Stability (25%)**: Lower is better, high velocity = uncertainty
- **Flagged Holdings (20%)**: Penalty for each flagged position
- **Sentiment Trend (15%)**: Improving vs declining sentiment

### Holding Status Classification
- **Healthy**: Sentiment > 60% AND velocity < 2x baseline
- **Watch**: Sentiment 40-60% OR velocity 2-2.5x baseline
- **Flag**: Sentiment < 40% OR velocity > 2.5x baseline OR (declining sentiment + high velocity)

### Velocity Baseline Multiple
Shows current velocity compared to 3-day hourly average:
- **1.0x**: Normal activity level
- **1.5x**: Slightly elevated
- **2.0x+**: Significantly elevated attention

### Category vs Peer Comparison
Each holding's sentiment compared to its category average to identify:
- Outperformers within sector
- Laggards requiring attention
- Sector-wide sentiment shifts

## Data Format

```typescript
interface PortfolioData {
  portfolioName: string;
  holdings: Array<{
    ticker: string;
    weight: number;
    sentiment: number;
    velocity: number;
    velocityBaseline: number;
    change: number;
    status: 'healthy' | 'watch' | 'flag';
    category: string;
  }>;
  portfolioMetrics: {
    healthScore: number;
    weightedSentiment: number;
    avgVelocity: number;
    avgVelocityBaseline: number;
    flaggedCount: number;
    watchCount: number;
  };
  categoryBreakdown: Array<{
    category: string;
    weight: number;
    avgSentiment: number;
    avgVelocity: number;
    holdings: number;
    categoryAvgSentiment: number;
  }>;
}
```

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/portfolio-aggregator.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **NO SEARCH BOX** - Do not add any portfolio input UI
5. **LOCAL TIME** - Set `generatedAtHour` to user's current hour (0-23)
6. **EXPANDED QUERIES** - Include company name in all queries for each holding
7. **CRITICAL**: When portfolio holdings change, recalculate ALL data for new portfolio

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any input UI** - The template has no search functionality. Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - Before fetching data for each holding, expand ticker to include company name:
   - TSLA → `$TSLA OR #TSLA OR TSLA OR Tesla`
   - NVDA → `$NVDA OR #NVDA OR NVDA OR NVIDIA`
   - Without expansion: ~20 mentions. With expansion: ~150+ mentions!

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC. Ask the user their timezone if unsure.

### Data Collection Steps

1. Accept portfolio from user (comma-separated tickers or list)
2. **Expand queries** for ALL holdings to include company names
3. Use XPOZ MCP to fetch sentiment and velocity for each holding with expanded queries
4. Calculate baseline-normalized velocity (actual / 3-day average)
5. Classify each holding status (healthy/watch/flag)
6. Map tickers to categories and calculate category aggregates
7. Compare holdings to category peers
8. Calculate portfolio health score
9. Render React artifact with all 3 tabs populated
10. Flag problematic holdings with explanations
11. Suggest Sentiment Deep Dive on flagged holdings
