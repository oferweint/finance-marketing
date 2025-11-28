---
name: basket-builder
version: 2025-11-28
description: Build thematic investment baskets using social sentiment and narrative analysis. Creates optimized portfolios around themes like AI, EVs, or crypto. Use when creating thematic exposure, finding related assets, or building sentiment-weighted portfolios.
---

# Basket Builder Skill

## Overview

This skill creates thematic investment baskets by analyzing social sentiment across related assets, providing sentiment-weighted allocation suggestions. Uses baseline-normalized metrics to identify assets with unusual sentiment momentum.

## When to Use

Activate this skill when the user asks about:
- "Build me an [THEME] basket"
- "Create a portfolio around [TOPIC]"
- "What stocks fit the [NARRATIVE] theme?"
- "Sentiment-weighted [SECTOR] portfolio"
- "Find assets related to [CONCEPT]"

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

### Step 1: Identify Theme Assets
Use `getTwitterPostsByKeywords` to find relevant tickers:
```
Query: "AI stocks" or "artificial intelligence investing"
Fields: ["id", "text", "authorUsername", "createdAtDate", "retweetCount"]
```

### Step 2: Analyze Each Asset
For each identified ticker, gather sentiment using expanded queries:
```
Query for NVDA: "$NVDA OR #NVDA OR NVDA OR NVIDIA"
Query for AMD: "$AMD OR #AMD OR AMD OR 'Advanced Micro Devices'"
Query for MSFT: "$MSFT OR #MSFT OR MSFT OR Microsoft"
```
- Sentiment score via expanded keyword search
- Mention velocity vs baseline
- Influencer coverage via `getTwitterUserByUsername`

### Step 3: Calculate Weights
- Combine sentiment, relevance, and correlation factors
- Apply baseline normalization
- Generate optimized allocation

## Popular Themes

| Theme | Key Tickers |
|-------|-------------|
| AI Infrastructure | NVDA, AMD, MSFT, GOOGL, AMZN, META, TSM |
| Electric Vehicles | TSLA, RIVN, LCID, NIO, GM, F |
| Clean Energy | ENPH, SEDG, FSLR, NEE, PLUG |
| Cybersecurity | CRWD, PANW, ZS, FTNT, OKTA |
| Cloud Computing | AMZN, MSFT, GOOGL, CRM, SNOW |
| GLP-1 / Weight Loss | LLY, NVO, AMGN, VKTX |
| Space Economy | RKLB, BA, LMT, ASTS |
| Digital Payments | V, MA, PYPL, SQ, AFRM |

## Output Requirements

Always render a **React artifact** with:
1. **Theme input field** - Allow any theme selection
2. **Tabbed interface** with 3 tabs:
   - Basket Overview: Holdings with weights and sentiment
   - Holdings Analysis: Detailed metrics per asset
   - Theme Comparison: Alternative themes and diversification

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/basket-builder.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **NO SEARCH BOX** - Use hardcoded theme constant with comment for Claude to replace
5. **LOCAL TIME** - Add `generatedAtHour` constant with user's local hour (0-23)
6. **EXPANDED QUERIES** - Always use expanded queries with company names for each ticker (e.g., `$NVDA OR #NVDA OR NVDA OR NVIDIA`)

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Check, BarChart3, Layers, Target } from 'lucide-react';

export default function BasketBuilder() {
  const theme = 'AI Infrastructure'; // CLAUDE: Replace with actual theme
  const generatedAtHour = 12; // CLAUDE: Replace with user's local hour (0-23)
  const [activeTab, setActiveTab] = useState('overview');

  // SAMPLE DATA - Replace with XPOZ MCP data for the selected theme
  // When user changes theme, fetch new data and recalculate all metrics
  const basket = [
    { ticker: 'NVDA', name: 'NVIDIA', weight: 25, sentiment: 0.85, baseline: 0.70, vsBaseline: 1.21, relevance: 98, rationale: 'GPU leader for AI training' },
    { ticker: 'AMD', name: 'AMD', weight: 18, sentiment: 0.72, baseline: 0.65, vsBaseline: 1.11, relevance: 92, rationale: 'AI chip competitor, MI300X' },
    { ticker: 'MSFT', name: 'Microsoft', weight: 16, sentiment: 0.78, baseline: 0.72, vsBaseline: 1.08, relevance: 88, rationale: 'Azure AI, OpenAI partnership' },
    { ticker: 'GOOGL', name: 'Alphabet', weight: 14, sentiment: 0.68, baseline: 0.70, vsBaseline: 0.97, relevance: 85, rationale: 'TPUs, Gemini AI' },
    { ticker: 'AMZN', name: 'Amazon', weight: 12, sentiment: 0.65, baseline: 0.68, vsBaseline: 0.96, relevance: 82, rationale: 'AWS AI services, Trainium' },
    { ticker: 'META', name: 'Meta', weight: 10, sentiment: 0.62, baseline: 0.55, vsBaseline: 1.13, relevance: 78, rationale: 'LLaMA, AI infrastructure spend' },
    { ticker: 'TSM', name: 'TSMC', weight: 5, sentiment: 0.71, baseline: 0.68, vsBaseline: 1.04, relevance: 75, rationale: 'AI chip manufacturing' },
  ];

  const basketMetrics = {
    avgSentiment: 0.72,
    avgBaseline: 0.67,
    avgVsBaseline: 1.07,
    avgRelevance: 85,
    internalCorrelation: 0.68,
    diversityScore: 7.2,
    riskLevel: 'medium-high'
  };

  const alternativeThemes = [
    { theme: 'AI Infrastructure', holdings: 7, avgSentiment: 0.72, riskLevel: 'Medium-High' },
    { theme: 'Electric Vehicles', holdings: 6, avgSentiment: 0.58, riskLevel: 'High' },
    { theme: 'Cloud Computing', holdings: 5, avgSentiment: 0.68, riskLevel: 'Medium' },
    { theme: 'Cybersecurity', holdings: 5, avgSentiment: 0.65, riskLevel: 'Medium' },
    { theme: 'Clean Energy', holdings: 5, avgSentiment: 0.52, riskLevel: 'High' }
  ];

  const risks = [
    'High correlation between mega-cap holdings',
    'Concentration in semiconductor supply chain',
    'Valuation sensitivity to rate environment'
  ];

  const pieData = basket.map(b => ({
    name: b.ticker,
    value: b.weight
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'text-red-400';
    if (risk === 'Medium-High' || risk === 'medium-high') return 'text-orange-400';
    if (risk === 'Medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  const tabs = [
    { id: 'overview', label: 'Basket Overview', icon: Package },
    { id: 'holdings', label: 'Holdings Analysis', icon: Target },
    { id: 'themes', label: 'Theme Comparison', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold">{theme} Basket</h1>
            <p className="text-slate-400 text-sm">Sentiment-weighted portfolio</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm ${getRiskColor(basketMetrics.riskLevel)}`}>
            Risk: {basketMetrics.riskLevel}
          </div>
          <div className="text-xs text-slate-500">
            Generated at {generatedAtHour}:00 local time
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Holdings</div>
          <div className="text-2xl font-bold text-teal-400">{basket.length}</div>
          <div className="text-xs text-slate-500">assets</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Avg Sentiment</div>
          <div className="text-2xl font-bold text-green-400">{(basketMetrics.avgSentiment * 100).toFixed(0)}%</div>
          <div className="text-xs text-slate-500">{basketMetrics.avgVsBaseline.toFixed(2)}x baseline</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Theme Relevance</div>
          <div className="text-2xl font-bold text-teal-400">{basketMetrics.avgRelevance}%</div>
          <div className="text-xs text-slate-500">avg score</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Correlation</div>
          <div className="text-2xl font-bold text-orange-400">{basketMetrics.internalCorrelation.toFixed(2)}</div>
          <div className="text-xs text-slate-500">internal</div>
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
                ? 'bg-teal-500/20 text-teal-400'
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
            {/* Pie Chart */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Allocation</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Basket Metrics */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Basket Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Avg Sentiment</span>
                    <span className="text-green-400">{(basketMetrics.avgSentiment * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${basketMetrics.avgSentiment * 100}%` }} />
                    <div className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${basketMetrics.avgBaseline * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Baseline: {(basketMetrics.avgBaseline * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Theme Relevance</span>
                    <span className="text-teal-400">{basketMetrics.avgRelevance}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${basketMetrics.avgRelevance}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Internal Correlation</span>
                    <span className="text-orange-400">{basketMetrics.internalCorrelation.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${basketMetrics.internalCorrelation * 100}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Above 0.6 = concentrated exposure</div>
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
                  <th className="p-3">vs Baseline</th>
                  <th className="p-3">Relevance</th>
                </tr>
              </thead>
              <tbody>
                {basket.slice(0, 5).map((h, i) => (
                  <tr key={h.ticker} className="border-t border-slate-700">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-bold">{h.ticker}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{h.weight}%</td>
                    <td className="p-3">
                      <span className={h.sentiment >= 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                        {(h.sentiment * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={h.vsBaseline >= 1 ? 'text-green-400' : 'text-red-400'}>
                        {h.vsBaseline.toFixed(2)}x
                      </span>
                    </td>
                    <td className="p-3">{h.relevance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {basket.map((h, i) => (
            <div key={h.ticker} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div>
                    <div className="font-bold text-lg">{h.ticker}</div>
                    <div className="text-sm text-slate-400">{h.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">{h.weight}%</div>
                  <div className="text-xs text-slate-500">weight</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-slate-500">Sentiment</div>
                  <div className={`font-bold ${h.sentiment >= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {(h.sentiment * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Baseline</div>
                  <div className="font-bold">{(h.baseline * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">vs Baseline</div>
                  <div className={`font-bold ${h.vsBaseline >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {h.vsBaseline.toFixed(2)}x
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Relevance</div>
                  <div className="font-bold text-teal-400">{h.relevance}%</div>
                </div>
              </div>

              <div className="text-sm text-slate-400 p-2 bg-slate-700 rounded">
                {h.rationale}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Alternative Theme Baskets</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-3">Theme</th>
                  <th className="pb-3">Holdings</th>
                  <th className="pb-3">Avg Sentiment</th>
                  <th className="pb-3">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {alternativeThemes.map((t) => (
                  <tr key={t.theme} className={`border-t border-slate-700 ${t.theme === theme ? 'bg-teal-500/10' : ''}`}>
                    <td className="py-3">
                      <span className={`font-bold ${t.theme === theme ? 'text-teal-400' : ''}`}>
                        {t.theme}
                        {t.theme === theme && <span className="ml-2 text-xs text-teal-400">(Current)</span>}
                      </span>
                    </td>
                    <td className="py-3">{t.holdings}</td>
                    <td className="py-3">
                      <span className={t.avgSentiment >= 0.65 ? 'text-green-400' : 'text-yellow-400'}>
                        {(t.avgSentiment * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={getRiskColor(t.riskLevel)}>{t.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Risks and Diversification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {risks.map((risk, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-red-400">*</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Diversification Suggestions
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <p>Consider adding exposure to:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Cybersecurity', 'Healthcare AI', 'Robotics'].map((alt) => (
                    <span key={alt} className="px-2 py-1 bg-slate-700 rounded text-slate-300">
                      {alt}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-slate-500">
                  These themes have lower correlation to {theme}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
        <p className="text-sm text-teal-200">
          <strong>Basket Summary:</strong> {theme} basket contains {basket.length} holdings with
          {(basketMetrics.avgSentiment * 100).toFixed(0)}% average sentiment ({basketMetrics.avgVsBaseline.toFixed(2)}x baseline) and {basketMetrics.avgRelevance}% theme relevance.
          Top weight: {basket[0].ticker} at {basket[0].weight}% ({basket[0].vsBaseline.toFixed(2)}x sentiment baseline).
          Internal correlation of {basketMetrics.internalCorrelation.toFixed(2)} suggests
          {basketMetrics.internalCorrelation > 0.6 ? ' concentrated exposure - consider diversification.' : ' reasonable diversification.'}
        </p>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding These Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-300">Weight:</strong> Allocation percentage based on sentiment (40%), theme relevance (30%), correlation penalty (20%), and liquidity (10%).
          </div>
          <div>
            <strong className="text-slate-300">vs Baseline:</strong> Current sentiment compared to 7-day average. Values above 1.0x indicate improving sentiment momentum.
          </div>
          <div>
            <strong className="text-slate-300">Theme Relevance:</strong> How closely the asset relates to the selected theme based on narrative analysis. Higher = more direct exposure.
          </div>
          <div>
            <strong className="text-slate-300">Internal Correlation:</strong> How similarly basket holdings move together. Above 0.6 indicates concentrated risk.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface BasketData {
  theme: string;
  basket: Array<{
    ticker: string;
    name: string;
    weight: number;
    sentiment: number;
    baseline: number;           // 7-day average sentiment
    vsBaseline: number;         // sentiment / baseline ratio
    relevance: number;          // 0-100 theme relevance
    rationale: string;
  }>;
  basketMetrics: {
    avgSentiment: number;
    avgBaseline: number;
    avgVsBaseline: number;
    avgRelevance: number;
    internalCorrelation: number;
    diversityScore: number;
    riskLevel: 'low' | 'medium' | 'medium-high' | 'high';
  };
  alternativeThemes: Array<{
    theme: string;
    holdings: number;
    avgSentiment: number;
    riskLevel: string;
  }>;
  risks: string[];
}
```

## Weighting Methodology

| Factor | Weight |
|--------|--------|
| Sentiment Score | 40% |
| Theme Relevance | 30% |
| Correlation Penalty | 20% |
| Liquidity Factor | 10% |

## Instructions for Claude

1. Accept theme input from user
2. Identify relevant tickers via XPOZ MCP `getTwitterPostsByKeywords`
3. **CRITICAL**: For each ticker, expand query to include company name (e.g., `$NVDA OR #NVDA OR NVDA OR NVIDIA`)
4. Fetch data using expanded queries for each ticker in the basket
5. For each ticker, calculate:
   - Sentiment score vs 7-day baseline
   - Theme relevance via narrative matching
   - Correlation with other basket holdings
6. Apply weighting methodology to calculate allocations
7. Identify risks and alternative themes
8. Render React artifact with 3 tabs
9. **NO SEARCH INPUT** - Use hardcoded theme constant with comment
10. **LOCAL TIME** - Include user's local hour in generatedAtHour constant
11. Save artifact as `.jsx` file in `/mnt/user-data/outputs/` for Claude.ai
