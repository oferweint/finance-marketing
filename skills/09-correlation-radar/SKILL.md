---
name: correlation-radar
description: Analyze social sentiment correlations between assets. Shows correlation matrix, cluster analysis, and divergence opportunities. Use when finding pair trades, analyzing sector correlations, or detecting unusual decouplings.
---

# Correlation Radar Skill

## Overview

This skill analyzes the correlation of social sentiment between multiple assets, identifying clusters and divergence opportunities with peer comparison.

## When to Use

Activate this skill when the user asks about:
- "What's correlated with [TICKER]?"
- "Sentiment correlation matrix"
- "Find pair trade opportunities"
- "Are [ASSET1] and [ASSET2] correlated?"
- "Sector correlation analysis"

## XPOZ MCP Data Flow

### Step 1: Get Asset List
Accept user's tickers or use default category peers.

### Step 2: Fetch Sentiment Time Series
```
For each ticker, use getTwitterPostsByKeywords:
- query: "$TICKER"
- fields: ["text", "createdAt", "authorUsername"]
- Get 7 days of hourly data for correlation analysis
```

### Step 3: Calculate Sentiment per Hour
For each hourly bucket:
- Count bullish/bearish/neutral tweets
- Calculate hourly sentiment score (0-1)

### Step 4: Compute Correlations
Calculate Pearson correlation between sentiment time series pairs.

### Step 5: Cluster Detection
Group assets with correlation > 0.7 into clusters.

## Output Requirements

Always render a **React artifact** with:
1. **Ticker input field** for selecting assets
2. **3 tabs**: Correlation Matrix | Divergences | Category Analysis
3. Correlation matrix heatmap
4. Top correlations and divergences
5. Cluster visualization
6. Category peer comparison

## Category Mapping

| Category | Tickers |
|----------|---------|
| AI/Semiconductors | NVDA, AMD, INTC, AVGO, QCOM |
| Big Tech | AAPL, MSFT, GOOGL, META, AMZN |
| EV | TSLA, RIVN, LCID, NIO, XPEV |
| Crypto | BTC, ETH, SOL, DOGE, XRP |
| Meme Stocks | GME, AMC, BBBY, BB, NOK |

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GitBranch, Link, Unlink, ArrowRight, Search, Grid, AlertTriangle, Layers } from 'lucide-react';

export default function CorrelationRadar() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [tickerInput, setTickerInput] = useState('');

  const assets = ['NVDA', 'AMD', 'INTC', 'TSLA', 'AAPL', 'MSFT'];
  const category = 'Mixed Tech';

  // Correlation matrix (symmetric)
  const correlationMatrix = [
    [1.00, 0.85, 0.72, 0.45, 0.52, 0.68],  // NVDA
    [0.85, 1.00, 0.78, 0.38, 0.48, 0.62],  // AMD
    [0.72, 0.78, 1.00, 0.25, 0.42, 0.55],  // INTC
    [0.45, 0.38, 0.25, 1.00, 0.35, 0.42],  // TSLA
    [0.52, 0.48, 0.42, 0.35, 1.00, 0.72],  // AAPL
    [0.68, 0.62, 0.55, 0.42, 0.72, 1.00],  // MSFT
  ];

  const topCorrelations = [
    { pair: ['NVDA', 'AMD'], correlation: 0.85, type: 'positive', category: 'AI/Semiconductors' },
    { pair: ['AMD', 'INTC'], correlation: 0.78, type: 'positive', category: 'AI/Semiconductors' },
    { pair: ['AAPL', 'MSFT'], correlation: 0.72, type: 'positive', category: 'Big Tech' },
    { pair: ['NVDA', 'INTC'], correlation: 0.72, type: 'positive', category: 'AI/Semiconductors' },
  ];

  const divergences = [
    {
      pair: ['NVDA', 'TSLA'],
      expectedCorr: 0.65,
      currentCorr: 0.45,
      divergence: -0.20,
      signal: 'NVDA bullish, TSLA sentiment weakening',
      opportunity: 'Long NVDA / Short TSLA'
    },
    {
      pair: ['INTC', 'TSLA'],
      expectedCorr: 0.45,
      currentCorr: 0.25,
      divergence: -0.20,
      signal: 'Unusual decoupling detected',
      opportunity: 'Convergence play possible'
    }
  ];

  const clusters = [
    { name: 'Semis', assets: ['NVDA', 'AMD', 'INTC'], avgCorrelation: 0.78, color: '#8b5cf6' },
    { name: 'Big Tech', assets: ['AAPL', 'MSFT'], avgCorrelation: 0.72, color: '#3b82f6' },
    { name: 'Outlier', assets: ['TSLA'], avgCorrelation: 0.35, color: '#ef4444' }
  ];

  // Category comparison data
  const categoryCorrelations = [
    { category: 'AI/Semiconductors', avgIntraCorr: 0.78, avgCrossCorr: 0.52, stability: 'High' },
    { category: 'Big Tech', avgIntraCorr: 0.72, avgCrossCorr: 0.55, stability: 'High' },
    { category: 'EV', avgIntraCorr: 0.65, avgCrossCorr: 0.35, stability: 'Medium' },
    { category: 'Crypto', avgIntraCorr: 0.82, avgCrossCorr: 0.28, stability: 'Low' },
    { category: 'Meme Stocks', avgIntraCorr: 0.75, avgCrossCorr: 0.22, stability: 'Low' }
  ];

  const getCorrelationColor = (corr) => {
    if (corr >= 0.8) return 'bg-green-500';
    if (corr >= 0.6) return 'bg-green-400';
    if (corr >= 0.4) return 'bg-yellow-500';
    if (corr >= 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCorrelationOpacity = (corr) => {
    return { opacity: 0.3 + (Math.abs(corr) * 0.7) };
  };

  const tabs = [
    { id: 'matrix', label: 'Correlation Matrix', icon: Grid },
    { id: 'divergences', label: 'Divergences', icon: Unlink },
    { id: 'categories', label: 'Category Analysis', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Ticker Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            placeholder="Enter tickers: NVDA, AMD, TSLA (comma-separated)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {assets.map(a => (
            <span key={a} className="px-2 py-1 bg-slate-800 rounded text-sm">{a}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold">Correlation Radar</h1>
            <p className="text-slate-400 text-sm">Cross-asset sentiment analysis • 7-day window</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-400">{assets.length}</div>
          <div className="text-sm text-slate-400">assets analyzed</div>
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
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Correlation Matrix */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment Correlation Matrix (7-day)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-xs text-slate-500"></th>
                    {assets.map(a => (
                      <th key={a} className="p-2 text-xs text-slate-400 font-medium">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((rowAsset, rowIdx) => (
                    <tr key={rowAsset}>
                      <td className="p-2 text-xs text-slate-400 font-medium">{rowAsset}</td>
                      {assets.map((colAsset, colIdx) => {
                        const corr = correlationMatrix[rowIdx][colIdx];
                        return (
                          <td key={colAsset} className="p-1">
                            <div
                              className={`w-12 h-10 ${getCorrelationColor(corr)} rounded flex items-center justify-center text-xs font-medium text-white`}
                              style={getCorrelationOpacity(corr)}
                            >
                              {corr.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-4 h-3 bg-green-500 rounded" /> Strong (0.8+)</div>
              <div className="flex items-center gap-1"><div className="w-4 h-3 bg-yellow-500 rounded" /> Moderate (0.4-0.6)</div>
              <div className="flex items-center gap-1"><div className="w-4 h-3 bg-red-500 rounded" /> Weak (&lt;0.2)</div>
            </div>
          </div>

          {/* Top Correlations */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Top Correlations
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {topCorrelations.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.pair[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-medium">{item.pair[1]}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{item.category}</div>
                  </div>
                  <span className={`text-xl font-bold ${item.correlation >= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {item.correlation.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clusters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Identified Clusters</h3>
            <div className="grid grid-cols-3 gap-4">
              {clusters.map((cluster) => (
                <div key={cluster.name} className="p-3 bg-slate-700 rounded-lg border-l-4" style={{ borderColor: cluster.color }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: cluster.color }}>{cluster.name}</span>
                    <span className="text-xs text-slate-400">r={cluster.avgCorrelation.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cluster.assets.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-slate-600 rounded text-xs">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'divergences' && (
        <div className="space-y-6">
          {/* Divergence Alerts */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {divergences.length} Divergence(s) Detected
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Divergences occur when historical correlation breaks down, potentially signaling pair trade opportunities.
            </p>
          </div>

          {/* Divergence Cards */}
          {divergences.map((item, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{item.pair[0]}</span>
                  <Unlink className="w-5 h-5 text-orange-400" />
                  <span className="text-xl font-bold">{item.pair[1]}</span>
                </div>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-bold">
                  {item.divergence > 0 ? '+' : ''}{item.divergence.toFixed(2)} divergence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700 rounded p-3">
                  <div className="text-xs text-slate-400 mb-1">Expected Correlation</div>
                  <div className="text-lg font-bold text-slate-300">{item.expectedCorr.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Based on 30-day average</div>
                </div>
                <div className="bg-slate-700 rounded p-3">
                  <div className="text-xs text-slate-400 mb-1">Current Correlation</div>
                  <div className="text-lg font-bold text-orange-400">{item.currentCorr.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">7-day rolling</div>
                </div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-xs text-slate-400 mb-1">Signal</div>
                <div className="text-sm text-slate-300">{item.signal}</div>
              </div>
              <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded">
                <div className="text-xs text-violet-400 mb-1">Potential Opportunity</div>
                <div className="text-sm font-medium text-violet-300">{item.opportunity}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Correlation Comparison */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Category Correlation Patterns</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCorrelations} layout="vertical">
                  <XAxis type="number" domain={[0, 1]} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="avgIntraCorr" name="Intra-Category" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 gap-4">
            {categoryCorrelations.map((cat) => (
              <div key={cat.category} className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-bold mb-3">{cat.category}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Intra-Category Correlation</span>
                      <span className="text-violet-400">{cat.avgIntraCorr.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${cat.avgIntraCorr * 100}%` }} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Assets within category move together</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Cross-Category Correlation</span>
                      <span className="text-blue-400">{cat.avgCrossCorr.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.avgCrossCorr * 100}%` }} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Correlation with other categories</div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-400">Stability</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      cat.stability === 'High' ? 'bg-green-500/20 text-green-400' :
                      cat.stability === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {cat.stability}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Avg Correlation</div>
          <div className="text-2xl font-bold text-violet-400">0.54</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Clusters</div>
          <div className="text-2xl font-bold">{clusters.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Divergences</div>
          <div className="text-2xl font-bold text-orange-400">{divergences.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Data Window</div>
          <div className="text-2xl font-bold text-blue-400">7d</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
        <p className="text-sm text-violet-200">
          <strong>Analysis:</strong> Strongest correlation cluster is Semis (NVDA/AMD/INTC) at r=0.78.
          {divergences.length} divergence(s) detected - {divergences[0].pair.join('/')} showing unusual decoupling
          with {Math.abs(divergences[0].divergence).toFixed(2)} deviation from expected.
          TSLA sentiment operating independently from tech basket (avg cross-correlation 0.35).
          Consider pair trade opportunities in divergent pairs where correlation is expected to converge.
        </p>
      </div>
    </div>
  );
}
```

## Metric Explanations

### Correlation Coefficient (r)
Pearson correlation of sentiment time series:
- **0.8-1.0**: Very strong - Assets move together
- **0.6-0.8**: Strong - High co-movement
- **0.4-0.6**: Moderate - Some relationship
- **0.2-0.4**: Weak - Limited relationship
- **0.0-0.2**: Very weak - Nearly independent

### Divergence Score
Difference between expected and current correlation:
- Expected: 30-day rolling average correlation
- Current: 7-day rolling correlation
- Divergence = Current - Expected
- Negative = correlation weakening
- Positive = correlation strengthening

### Cluster Detection
Assets grouped by correlation strength:
- Threshold: r > 0.7 to be in same cluster
- Single assets with no strong correlations marked as outliers

### Intra vs Cross-Category Correlation
- **Intra-Category**: Average correlation within sector (e.g., NVDA-AMD)
- **Cross-Category**: Average correlation with other sectors
- High intra + low cross = Good diversification potential

## Data Format

```typescript
interface CorrelationData {
  assets: string[];
  correlationMatrix: number[][];
  topCorrelations: Array<{
    pair: [string, string];
    correlation: number;
    type: 'positive' | 'negative';
    category: string;
  }>;
  divergences: Array<{
    pair: [string, string];
    expectedCorr: number;
    currentCorr: number;
    divergence: number;
    signal: string;
    opportunity: string;
  }>;
  clusters: Array<{
    name: string;
    assets: string[];
    avgCorrelation: number;
    color: string;
  }>;
  categoryCorrelations: Array<{
    category: string;
    avgIntraCorr: number;
    avgCrossCorr: number;
    stability: 'High' | 'Medium' | 'Low';
  }>;
}
```

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/correlation-radar.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker list changes, recalculate ALL correlations for new assets

## Instructions for Claude

1. Accept ticker list from user or use category defaults
2. Use XPOZ MCP to fetch 7 days of sentiment data per ticker
3. Calculate hourly sentiment scores for each asset
4. Compute Pearson correlation between all pairs
5. Identify clusters (assets with r > 0.7)
6. Detect divergences (current vs 30-day expected correlation)
7. Map assets to categories for cross-category analysis
8. Render React artifact with all 3 tabs populated
9. Suggest pair trades on divergences
10. Recommend Sentiment Deep Dive for outlier assets
