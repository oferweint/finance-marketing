---
name: divergence-detector
description: Detect divergences between retail and smart money sentiment on financial assets. Shows sentiment gaps, historical accuracy, and contrarian signals. Use when finding contrarian opportunities, validating trades, or understanding sentiment disagreements.
---

# Divergence Detector Skill

## Overview

This skill compares retail social sentiment against institutional/smart money proxies to identify divergences and potential contrarian opportunities. Uses baseline-normalized metrics to identify when divergences are significant.

## When to Use

Activate this skill when the user asks about:
- "Is smart money disagreeing on [TICKER]?"
- "Retail vs institutional sentiment for [ASSET]"
- "Find contrarian opportunities"
- "Divergence analysis for [STOCK]"
- "Are retail and pros aligned on [CRYPTO]?"

## XPOZ MCP Data Flow

### Step 1: Gather Retail Sentiment
Use `getTwitterPostsByKeywords` to fetch retail social posts:
```
Query: "$SPY" or "SPY stock"
Fields: ["id", "text", "authorUsername", "createdAtDate", "retweetCount"]
```

### Step 2: Identify Smart Money Proxies
Use `getTwitterUserByUsername` for institutional accounts:
- Verified analysts
- Fund manager accounts
- Institutional research accounts
- Finance journalists with institutional sources

### Step 3: Calculate Divergence
- Compute sentiment for retail cohort
- Compute sentiment for smart money cohort
- Divergence score = |retail_sentiment - smart_money_sentiment|

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
   - Divergence Overview: Retail vs smart money comparison
   - Historical Analysis: Past divergence outcomes
   - Category Comparison: Divergence levels vs peers

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { GitCompare, Users, Building2, AlertTriangle, TrendingUp, TrendingDown, History, Search, Layers, Target } from 'lucide-react';

export default function DivergenceDetector() {
  const [ticker, setTicker] = useState('SPY');
  const [activeTab, setActiveTab] = useState('overview');

  // SAMPLE DATA - Replace with XPOZ MCP data
  const analysis = {
    retail: {
      sentiment: 0.75,
      label: 'Bullish',
      confidence: 0.82,
      sampleSize: 15200,
      baseline: 0.60,
      vsBaseline: 1.25,
      drivers: ['FOMO buying', 'Meme momentum', 'RSI technical', 'Options activity']
    },
    smartMoney: {
      sentiment: 0.38,
      label: 'Bearish',
      confidence: 0.71,
      baseline: 0.55,
      vsBaseline: 0.69,
      sources: ['Institutional accounts', 'Verified analysts', 'Fund managers'],
      drivers: ['Valuation concerns', 'Rate environment', 'Earnings risk', 'Breadth weakness']
    },
    divergenceScore: 0.37,
    baselineDivergence: 0.15,
    vsBaseline: 2.47,
    signal: 'STRONG_DIVERGENCE',
    historicalAccuracy: 0.72
  };

  const historicalDivergences = [
    { date: '6 months ago', divergence: 0.35, outcome: 'Smart money correct', result: '-8% in 30 days', retailSent: 0.72, smartSent: 0.37 },
    { date: '3 months ago', divergence: 0.28, outcome: 'Retail correct', result: '+5% in 30 days', retailSent: 0.68, smartSent: 0.40 },
    { date: '5 weeks ago', divergence: 0.22, outcome: 'Smart money correct', result: '-4% in 30 days', retailSent: 0.65, smartSent: 0.43 },
  ];

  const peerComparison = [
    { ticker: 'SPY', divergence: 0.37, signal: 'Strong', smartLean: 'Bearish', vsCategory: 2.5 },
    { ticker: 'QQQ', divergence: 0.28, signal: 'Moderate', smartLean: 'Bearish', vsCategory: 1.9 },
    { ticker: 'IWM', divergence: 0.15, signal: 'Minor', smartLean: 'Neutral', vsCategory: 1.0 },
    { ticker: 'DIA', divergence: 0.12, signal: 'Aligned', smartLean: 'Neutral', vsCategory: 0.8 },
    { ticker: 'VTI', divergence: 0.22, signal: 'Moderate', smartLean: 'Bearish', vsCategory: 1.5 }
  ];

  const getDivergenceLevel = (score) => {
    if (score >= 0.35) return { label: 'Strong', color: 'text-red-400 bg-red-500/20' };
    if (score >= 0.25) return { label: 'Moderate', color: 'text-orange-400 bg-orange-500/20' };
    if (score >= 0.15) return { label: 'Minor', color: 'text-yellow-400 bg-yellow-500/20' };
    return { label: 'Aligned', color: 'text-green-400 bg-green-500/20' };
  };

  const divergenceLevel = getDivergenceLevel(analysis.divergenceScore);

  const tabs = [
    { id: 'overview', label: 'Divergence Overview', icon: GitCompare },
    { id: 'history', label: 'Historical Analysis', icon: History },
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
            placeholder="Enter ticker (e.g., SPY, QQQ, TSLA)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-pink-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Divergence</h1>
            <p className="text-slate-400 text-sm">Retail vs Smart Money</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${divergenceLevel.color}`}>
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{divergenceLevel.label} Divergence</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Divergence Score</div>
          <div className="text-2xl font-bold text-pink-400">{(analysis.divergenceScore * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">{analysis.vsBaseline.toFixed(1)}x baseline</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Retail Sentiment</div>
          <div className="text-2xl font-bold text-blue-400">{(analysis.retail.sentiment * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">{analysis.retail.label}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Smart Money</div>
          <div className="text-2xl font-bold text-purple-400">{(analysis.smartMoney.sentiment * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">{analysis.smartMoney.label}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Historical Accuracy</div>
          <div className="text-2xl font-bold">{(analysis.historicalAccuracy * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">Smart money wins</div>
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
                ? 'bg-pink-500/20 text-pink-400'
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
          {/* Main Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {/* Retail */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-blue-400">Retail Sentiment</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-blue-400">
                    {(analysis.retail.sentiment * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-400">{analysis.retail.label}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3 relative">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analysis.retail.sentiment * 100}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${analysis.retail.baseline * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span>Current: {(analysis.retail.sentiment * 100).toFixed(0)}%</span>
                <span>Baseline: {(analysis.retail.baseline * 100).toFixed(0)}%</span>
                <span className="text-blue-400">{analysis.retail.vsBaseline.toFixed(1)}x</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                {analysis.retail.sampleSize.toLocaleString()} mentions | {(analysis.retail.confidence * 100).toFixed(0)}% confidence
              </div>
              <div className="space-y-1">
                {analysis.retail.drivers.map((d, i) => (
                  <div key={i} className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-blue-400">*</span> {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Money */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-purple-400">Smart Money</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-purple-400">
                    {(analysis.smartMoney.sentiment * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-400">{analysis.smartMoney.label}</div>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3 relative">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysis.smartMoney.sentiment * 100}%` }} />
                <div className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${analysis.smartMoney.baseline * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span>Current: {(analysis.smartMoney.sentiment * 100).toFixed(0)}%</span>
                <span>Baseline: {(analysis.smartMoney.baseline * 100).toFixed(0)}%</span>
                <span className="text-purple-400">{analysis.smartMoney.vsBaseline.toFixed(1)}x</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                Sources: {analysis.smartMoney.sources.join(', ')}
              </div>
              <div className="space-y-1">
                {analysis.smartMoney.drivers.map((d, i) => (
                  <div key={i} className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-purple-400">*</span> {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divergence Gauge */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Divergence Scale (vs Baseline)</h3>
            <div className="relative h-8 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-white"
                style={{ left: `${Math.min(analysis.divergenceScore * 200, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Aligned (0%)</span>
              <span>Minor (15%)</span>
              <span>Moderate (25%)</span>
              <span>Strong (35%+)</span>
            </div>
            <div className="text-center mt-4">
              <span className="text-2xl font-bold text-pink-400">{(analysis.divergenceScore * 100).toFixed(0)}%</span>
              <span className="text-slate-400 ml-2">divergence</span>
              <span className="text-pink-400 ml-2">({analysis.vsBaseline.toFixed(1)}x baseline)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Historical Track Record */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4" />
                Historical Divergence Outcomes
              </h3>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                Smart money accuracy: {(analysis.historicalAccuracy * 100).toFixed(0)}%
              </span>
            </div>
            <div className="space-y-3">
              {historicalDivergences.map((h, i) => (
                <div key={i} className="p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">{h.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        h.outcome.includes('Smart') ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {h.outcome}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      h.result.startsWith('-') ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {h.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Divergence: {(h.divergence * 100).toFixed(0)}%</span>
                    <span>Retail: {(h.retailSent * 100).toFixed(0)}%</span>
                    <span>Smart: {(h.smartSent * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Divergences</div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-slate-500">Past 12 months</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Smart Money Wins</div>
              <div className="text-2xl font-bold text-purple-400">9</div>
              <div className="text-xs text-slate-500">75% accuracy</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Avg Move After</div>
              <div className="text-2xl font-bold text-red-400">-5.2%</div>
              <div className="text-xs text-slate-500">30-day window</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Index ETF Divergence Comparison</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-3">Ticker</th>
                  <th className="pb-3">Divergence</th>
                  <th className="pb-3">Signal</th>
                  <th className="pb-3">Smart Lean</th>
                  <th className="pb-3">vs Category Avg</th>
                </tr>
              </thead>
              <tbody>
                {peerComparison.map((peer) => (
                  <tr key={peer.ticker} className={`border-t border-slate-700 ${peer.ticker === ticker ? 'bg-pink-500/10' : ''}`}>
                    <td className="py-3">
                      <span className={`font-bold ${peer.ticker === ticker ? 'text-pink-400' : ''}`}>
                        {peer.ticker}
                        {peer.ticker === ticker && <span className="ml-2 text-xs text-pink-400">(Selected)</span>}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-pink-400">{(peer.divergence * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        peer.signal === 'Strong' ? 'bg-red-500/20 text-red-400' :
                        peer.signal === 'Moderate' ? 'bg-orange-500/20 text-orange-400' :
                        peer.signal === 'Minor' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {peer.signal}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        peer.smartLean === 'Bearish' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {peer.smartLean}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={peer.vsCategory >= 1.5 ? 'text-red-400' : 'text-slate-400'}>
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
                  <span className="text-slate-400">Category Avg Divergence</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{ticker} vs Category</span>
                  <span className="font-bold text-pink-400">2.5x higher</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank in Category</span>
                  <span className="font-bold">#1 of 5</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Category Smart Money Lean</h3>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-xs text-slate-500">Bearish</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">2</div>
                  <div className="text-xs text-slate-500">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-xs text-slate-500">Bullish</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
        <p className="text-sm text-pink-200">
          <strong>Divergence Analysis:</strong> {divergenceLevel.label} divergence detected on {ticker} ({analysis.vsBaseline.toFixed(1)}x baseline).
          Retail: {analysis.retail.label} ({(analysis.retail.sentiment * 100).toFixed(0)}%) vs
          Smart Money: {analysis.smartMoney.label} ({(analysis.smartMoney.sentiment * 100).toFixed(0)}%).
          Historical accuracy favors smart money at {(analysis.historicalAccuracy * 100).toFixed(0)}%.
          This is 2.5x higher divergence than category average. Consider contrarian positioning or wait for convergence.
        </p>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding These Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-300">Divergence Score:</strong> Absolute difference between retail and smart money sentiment. 35%+ = Strong (high contrarian potential), 25-35% = Moderate, 15-25% = Minor, less than 15% = Aligned.
          </div>
          <div>
            <strong className="text-slate-300">vs Baseline:</strong> Current divergence compared to 30-day average. Values above 1.5x indicate unusually high disagreement.
          </div>
          <div>
            <strong className="text-slate-300">Smart Money:</strong> Sentiment from institutional accounts, verified analysts, and fund managers - typically more accurate than retail over time.
          </div>
          <div>
            <strong className="text-slate-300">Historical Accuracy:</strong> How often smart money sentiment correctly predicted market direction during past divergences.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface DivergenceData {
  ticker: string;
  analysis: {
    retail: {
      sentiment: number;
      label: string;
      confidence: number;
      sampleSize: number;
      baseline: number;
      vsBaseline: number;
      drivers: string[];
    };
    smartMoney: {
      sentiment: number;
      label: string;
      confidence: number;
      baseline: number;
      vsBaseline: number;
      sources: string[];
      drivers: string[];
    };
    divergenceScore: number;    // |retail - smartMoney|
    baselineDivergence: number; // 30-day average divergence
    vsBaseline: number;         // divergenceScore / baselineDivergence
    signal: 'ALIGNED' | 'MINOR_DIVERGENCE' | 'MODERATE_DIVERGENCE' | 'STRONG_DIVERGENCE';
    historicalAccuracy: number;
  };
  historicalDivergences: Array<{
    date: string;
    divergence: number;
    outcome: string;
    result: string;
    retailSent: number;
    smartSent: number;
  }>;
  peerComparison: Array<{
    ticker: string;
    divergence: number;
    signal: string;
    smartLean: string;
    vsCategory: number;
  }>;
}
```

## Divergence Signals

| Score | Signal | Recommendation |
|-------|--------|----------------|
| 35%+ | Strong | High contrarian potential |
| 25-35% | Moderate | Notable disagreement |
| 15-25% | Minor | Watch for escalation |
| <15% | Aligned | No contrarian signal |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/divergence-detector.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. Accept ticker input from user
2. Fetch retail sentiment via XPOZ MCP `getTwitterPostsByKeywords`
3. Identify smart money accounts via `getTwitterUserByUsername`
4. Calculate sentiment for both cohorts
5. Compute divergence score and compare to baseline
6. Analyze historical outcomes
7. Compare to category peers
8. Render React artifact with 3 tabs
9. Provide contrarian recommendation based on historical accuracy
