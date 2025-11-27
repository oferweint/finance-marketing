---
name: category-heatmap
description: Interactive heatmap showing normalized social velocity across market sectors. Compare real-time activity levels vs historical baselines across tech, crypto, EVs, and other categories. Drill down into any category to see individual tickers.
---

# Category Heatmap Skill

## Overview

This skill creates an interactive heatmap visualization showing **normalized social velocity** across different market sectors and categories. Velocity is compared against 3-day hourly baselines to eliminate time-of-day bias.

## When to Use

Activate this skill when the user asks about:
- "Show me sector velocity heatmap"
- "Which sectors are hot right now?"
- "Category comparison for social activity"
- "Where is the attention in the market?"
- "Sector rotation signals"
- "Compare all sectors"

## Data Source: XPOZ MCP

**All data comes from XPOZ MCP with real-time Twitter data.**

### ⚠️ CRITICAL: Query Expansion (MUST DO!)

Before fetching Twitter data for ANY ticker, you MUST expand the query to include the company name. **Searching only for ticker symbols ($GOOG, #GOOG) will miss 80%+ of mentions!**

**Step 0: For each ticker, use an expanded query:**

| Ticker | Expanded Query |
|--------|----------------|
| NVDA | `$NVDA OR #NVDA OR NVDA OR NVIDIA` |
| GOOGL | `$GOOG OR #GOOG OR GOOG OR $GOOGL OR #GOOGL OR GOOGL OR Google OR Alphabet` |
| TSLA | `$TSLA OR #TSLA OR TSLA OR Tesla` |
| AAPL | `$AAPL OR #AAPL OR AAPL OR Apple` |
| MSFT | `$MSFT OR #MSFT OR MSFT OR Microsoft` |
| META | `$META OR #META OR META OR Facebook OR "Meta Platforms"` |
| AMZN | `$AMZN OR #AMZN OR AMZN OR Amazon` |
| BTC | `$BTC OR #BTC OR BTC OR Bitcoin` |
| ETH | `$ETH OR #ETH OR ETH OR Ethereum` |
| SOL | `$SOL OR #SOL OR SOL OR Solana` |
| GME | `$GME OR #GME OR GME OR GameStop` |
| AMD | `$AMD OR #AMD OR AMD` |

**For other tickers**, look up the company name via web search: `"{TICKER} stock company name"`

**Without query expansion:**
- GOOGL: ~20 mentions/day ❌
- With expansion: ~150+ mentions/day ✅

### Data Flow for Claude:

1. **For each category, fetch mentions for representative tickers using EXPANDED QUERIES:**
```
Use getTwitterPostsByKeywords for each ticker with EXPANDED query:
- AI/ML: NVDA (NVIDIA), MSFT (Microsoft), GOOGL (Google), AMZN (Amazon), META (Facebook)
- EVs: TSLA (Tesla), RIVN (Rivian), LCID (Lucid), NIO (NIO), XPEV (XPeng)
- Crypto: BTC (Bitcoin), ETH (Ethereum), SOL (Solana), XRP (Ripple), DOGE (Dogecoin)
- Big Tech: AAPL (Apple), GOOGL (Google), MSFT (Microsoft), META (Facebook), AMZN (Amazon)
- Semiconductors: AMD, INTC (Intel), AVGO (Broadcom), QCOM (Qualcomm), MU (Micron)
- Fintech: SQ (Square/Block), PYPL (PayPal), AFRM (Affirm), COIN (Coinbase), HOOD (Robinhood)
- Biotech: MRNA (Moderna), PFE (Pfizer), LLY (Eli Lilly), ABBV (AbbVie), JNJ (Johnson & Johnson)
- Cloud/SaaS: CRM (Salesforce), SNOW (Snowflake), NET (Cloudflare), DDOG (Datadog), ZS (Zscaler)
- Gaming: EA, TTWO (Take-Two), RBLX (Roblox), ATVI (Activision), NTDOY (Nintendo)
- Energy: XOM (Exxon), CVX (Chevron), COP (ConocoPhillips), SLB (Schlumberger), OXY (Occidental)
- Retail: WMT (Walmart), TGT (Target), COST (Costco), HD (Home Depot), LOW (Lowe's)
- Meme Stocks: GME (GameStop), AMC, BBBY, BB (BlackBerry), NOK (Nokia)
```

2. **Calculate baseline for each category (3-day average per hour):**
   - Query last 3 days of data per category
   - Group by hour of day (0-23)
   - Average mentions per hour = baseline

3. **Calculate normalized velocity:**
   - Current hour mentions / baseline for that hour
   - 1.0 = normal, 2.0 = 2x baseline, etc.

4. **Convert to velocity score (0-10 scale):**
   - 5.0 = 1x baseline (normal)
   - 7.5 = 2x baseline
   - 10.0 = 3x+ baseline
   - 2.5 = 0.5x baseline
   - 0 = no activity

## Output Requirements

Always render a **React artifact** with:
1. Category selection/filter controls
2. Color-coded heatmap grid with normalized velocity
3. Change indicators showing baseline multiples (1x, 2x, 3x+)
4. Three tabs: Heatmap View, Category Drill-down, Movers Timeline
5. Clear legend explaining colors and metrics

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Grid3X3, TrendingUp, Clock, Filter, ChevronRight } from 'lucide-react';

export default function CategoryHeatmap() {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('velocity'); // 'velocity' or 'change'

  // CLAUDE: Set this to user's current local hour (0-23) - NOT UTC!
  // Ask the user their timezone if unsure
  const generatedAtHour = 12; // Replace with user's current local hour

  // SAMPLE DATA - Claude MUST replace with XPOZ MCP data using EXPANDED QUERIES
  // Velocity is normalized: 5.0 = 1x baseline, 7.5 = 2x baseline, 10 = 3x+ baseline
  // IMPORTANT: Use company names in queries (e.g., "NVDA OR NVIDIA", not just "NVDA")
  const categories = [
    {
      name: 'AI/ML',
      velocity: 8.7,  // ~2.5x baseline
      baselineMultiple: 2.5,
      hourlyMentions: 425,
      hourlyBaseline: 170,
      change: 1.8,  // vs 1 hour ago
      tickers: [
        { symbol: 'NVDA', velocity: 9.2, mentions: 180 },
        { symbol: 'MSFT', velocity: 7.8, mentions: 95 },
        { symbol: 'GOOGL', velocity: 8.1, mentions: 85 },
        { symbol: 'AMZN', velocity: 6.5, mentions: 40 },
        { symbol: 'META', velocity: 7.2, mentions: 25 },
      ]
    },
    {
      name: 'EVs',
      velocity: 7.8,
      baselineMultiple: 1.9,
      hourlyMentions: 312,
      hourlyBaseline: 165,
      change: 0.8,
      tickers: [
        { symbol: 'TSLA', velocity: 8.5, mentions: 220 },
        { symbol: 'RIVN', velocity: 6.2, mentions: 45 },
        { symbol: 'LCID', velocity: 5.8, mentions: 25 },
        { symbol: 'NIO', velocity: 5.5, mentions: 15 },
        { symbol: 'XPEV', velocity: 4.2, mentions: 7 },
      ]
    },
    {
      name: 'Crypto',
      velocity: 6.5,
      baselineMultiple: 1.4,
      hourlyMentions: 890,
      hourlyBaseline: 635,
      change: -0.8,
      tickers: [
        { symbol: 'BTC', velocity: 7.2, mentions: 450 },
        { symbol: 'ETH', velocity: 6.8, mentions: 280 },
        { symbol: 'SOL', velocity: 5.5, mentions: 95 },
        { symbol: 'XRP', velocity: 4.8, mentions: 40 },
        { symbol: 'DOGE', velocity: 5.2, mentions: 25 },
      ]
    },
    {
      name: 'Big Tech',
      velocity: 6.2,
      baselineMultiple: 1.3,
      hourlyMentions: 520,
      hourlyBaseline: 400,
      change: 0.3,
      tickers: [
        { symbol: 'AAPL', velocity: 6.5, mentions: 180 },
        { symbol: 'GOOGL', velocity: 6.8, mentions: 120 },
        { symbol: 'MSFT', velocity: 6.2, mentions: 110 },
        { symbol: 'META', velocity: 5.8, mentions: 70 },
        { symbol: 'AMZN', velocity: 5.5, mentions: 40 },
      ]
    },
    {
      name: 'Semiconductors',
      velocity: 8.4,
      baselineMultiple: 2.3,
      hourlyMentions: 285,
      hourlyBaseline: 124,
      change: 1.5,
      tickers: [
        { symbol: 'NVDA', velocity: 9.2, mentions: 180 },
        { symbol: 'AMD', velocity: 7.5, mentions: 55 },
        { symbol: 'INTC', velocity: 5.8, mentions: 25 },
        { symbol: 'AVGO', velocity: 5.2, mentions: 15 },
        { symbol: 'QCOM', velocity: 4.8, mentions: 10 },
      ]
    },
    {
      name: 'Fintech',
      velocity: 5.2,
      baselineMultiple: 1.1,
      hourlyMentions: 145,
      hourlyBaseline: 132,
      change: -0.3,
      tickers: [
        { symbol: 'SQ', velocity: 5.8, mentions: 45 },
        { symbol: 'PYPL', velocity: 5.2, mentions: 40 },
        { symbol: 'COIN', velocity: 6.5, mentions: 35 },
        { symbol: 'AFRM', velocity: 4.2, mentions: 15 },
        { symbol: 'HOOD', velocity: 4.5, mentions: 10 },
      ]
    },
    {
      name: 'Biotech',
      velocity: 4.8,
      baselineMultiple: 0.95,
      hourlyMentions: 92,
      hourlyBaseline: 97,
      change: 0.2,
      tickers: [
        { symbol: 'LLY', velocity: 5.5, mentions: 35 },
        { symbol: 'MRNA', velocity: 4.8, mentions: 25 },
        { symbol: 'PFE', velocity: 4.2, mentions: 18 },
        { symbol: 'ABBV', velocity: 4.0, mentions: 8 },
        { symbol: 'JNJ', velocity: 3.8, mentions: 6 },
      ]
    },
    {
      name: 'Gaming',
      velocity: 5.8,
      baselineMultiple: 1.2,
      hourlyMentions: 78,
      hourlyBaseline: 65,
      change: 0.5,
      tickers: [
        { symbol: 'EA', velocity: 5.5, mentions: 25 },
        { symbol: 'RBLX', velocity: 6.2, mentions: 22 },
        { symbol: 'TTWO', velocity: 5.2, mentions: 18 },
        { symbol: 'ATVI', velocity: 4.8, mentions: 8 },
        { symbol: 'NTDOY', velocity: 4.5, mentions: 5 },
      ]
    },
    {
      name: 'Energy',
      velocity: 4.2,
      baselineMultiple: 0.8,
      hourlyMentions: 65,
      hourlyBaseline: 81,
      change: -1.2,
      tickers: [
        { symbol: 'XOM', velocity: 4.5, mentions: 25 },
        { symbol: 'CVX', velocity: 4.2, mentions: 20 },
        { symbol: 'COP', velocity: 3.8, mentions: 12 },
        { symbol: 'SLB', velocity: 3.5, mentions: 5 },
        { symbol: 'OXY', velocity: 3.2, mentions: 3 },
      ]
    },
    {
      name: 'Meme Stocks',
      velocity: 7.5,
      baselineMultiple: 1.8,
      hourlyMentions: 215,
      hourlyBaseline: 120,
      change: 2.2,
      tickers: [
        { symbol: 'GME', velocity: 8.2, mentions: 120 },
        { symbol: 'AMC', velocity: 7.0, mentions: 55 },
        { symbol: 'BBBY', velocity: 5.5, mentions: 25 },
        { symbol: 'BB', velocity: 4.2, mentions: 10 },
        { symbol: 'NOK', velocity: 3.8, mentions: 5 },
      ]
    },
    {
      name: 'Cloud/SaaS',
      velocity: 5.5,
      baselineMultiple: 1.15,
      hourlyMentions: 110,
      hourlyBaseline: 96,
      change: 0.4,
      tickers: [
        { symbol: 'CRM', velocity: 5.8, mentions: 35 },
        { symbol: 'SNOW', velocity: 5.5, mentions: 30 },
        { symbol: 'NET', velocity: 6.2, mentions: 25 },
        { symbol: 'DDOG', velocity: 4.8, mentions: 12 },
        { symbol: 'ZS', velocity: 4.2, mentions: 8 },
      ]
    },
    {
      name: 'Retail',
      velocity: 4.0,
      baselineMultiple: 0.75,
      hourlyMentions: 58,
      hourlyBaseline: 77,
      change: -0.5,
      tickers: [
        { symbol: 'WMT', velocity: 4.2, mentions: 20 },
        { symbol: 'TGT', velocity: 3.8, mentions: 15 },
        { symbol: 'COST', velocity: 4.5, mentions: 12 },
        { symbol: 'HD', velocity: 3.5, mentions: 7 },
        { symbol: 'LOW', velocity: 3.2, mentions: 4 },
      ]
    },
  ];

  // Timeline data showing category velocity changes over 6 hours
  const timelineData = [
    { hour: '-6h', 'AI/ML': 6.2, 'EVs': 6.5, 'Crypto': 7.2, 'Semis': 6.8, 'Meme': 5.2 },
    { hour: '-5h', 'AI/ML': 6.8, 'EVs': 6.8, 'Crypto': 7.0, 'Semis': 7.2, 'Meme': 5.5 },
    { hour: '-4h', 'AI/ML': 7.2, 'EVs': 7.0, 'Crypto': 6.8, 'Semis': 7.5, 'Meme': 5.8 },
    { hour: '-3h', 'AI/ML': 7.8, 'EVs': 7.2, 'Crypto': 6.5, 'Semis': 7.8, 'Meme': 6.2 },
    { hour: '-2h', 'AI/ML': 8.2, 'EVs': 7.5, 'Crypto': 6.8, 'Semis': 8.0, 'Meme': 6.8 },
    { hour: '-1h', 'AI/ML': 8.5, 'EVs': 7.6, 'Crypto': 6.6, 'Semis': 8.2, 'Meme': 7.2 },
    { hour: 'Now', 'AI/ML': 8.7, 'EVs': 7.8, 'Crypto': 6.5, 'Semis': 8.4, 'Meme': 7.5 },
  ];

  // Improved color palette - more visually distinct
  const getHeatColor = (velocity) => {
    if (velocity >= 8.5) return 'bg-rose-600';     // Very hot (2.5x+)
    if (velocity >= 7.5) return 'bg-red-500';      // Hot (2x+)
    if (velocity >= 6.5) return 'bg-orange-500';   // Elevated (1.5x+)
    if (velocity >= 5.5) return 'bg-amber-500';    // Above normal (1.2x)
    if (velocity >= 4.5) return 'bg-emerald-500';  // Normal (~1x)
    if (velocity >= 3.5) return 'bg-cyan-500';     // Below normal
    return 'bg-blue-600';                          // Cold (<0.6x)
  };

  const getHeatColorClass = (velocity) => {
    if (velocity >= 8.5) return 'text-rose-400';
    if (velocity >= 7.5) return 'text-red-400';
    if (velocity >= 6.5) return 'text-orange-400';
    if (velocity >= 5.5) return 'text-amber-400';
    if (velocity >= 4.5) return 'text-emerald-400';
    if (velocity >= 3.5) return 'text-cyan-400';
    return 'text-blue-400';
  };

  const formatMultiple = (multiple) => {
    if (multiple >= 3) return '3x+';
    return `${multiple.toFixed(1)}x`;
  };

  const ChangeIndicator = ({ change }) => {
    if (change > 0.5) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (change < -0.5) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'change') return Math.abs(b.change) - Math.abs(a.change);
    return b.velocity - a.velocity;
  });

  const topMovers = [...categories]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  const tabs = [
    { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
    { id: 'drilldown', label: 'Category Detail', icon: ChevronRight },
    { id: 'timeline', label: 'Movers Timeline', icon: Clock },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">Category Heatmap</h1>
            <p className="text-slate-400 text-sm">Normalized velocity across market sectors</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Generated at: {String(generatedAtHour).padStart(2, '0')}:00 local</div>
          <div className="text-xs text-slate-500">Baseline: 3-day hourly avg</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'heatmap' && (
        <div>
          {/* Sort Controls */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortBy('velocity')}
              className={`px-3 py-1 rounded text-sm ${sortBy === 'velocity' ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              Velocity
            </button>
            <button
              onClick={() => setSortBy('change')}
              className={`px-3 py-1 rounded text-sm ${sortBy === 'change' ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              Biggest Movers
            </button>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {sortedCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => { setSelectedCategory(cat); setActiveTab('drilldown'); }}
                className={`${getHeatColor(cat.velocity)} rounded-lg p-4 transition-all hover:scale-[1.02] cursor-pointer text-left`}
                style={{ opacity: 0.7 + (cat.velocity / 10) * 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{cat.name}</span>
                  <ChangeIndicator change={cat.change} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatMultiple(cat.baselineMultiple)}
                </div>
                <div className="text-xs text-white/80">
                  {cat.hourlyMentions} mentions/hr
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Baseline: {cat.hourlyBaseline}/hr
                </div>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Heat Scale (vs Baseline)</h3>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded" />
                <span className="text-slate-400">&lt;0.6x (Cold)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-500 rounded" />
                <span className="text-slate-400">0.6-0.9x</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded" />
                <span className="text-slate-400">0.9-1.2x (Normal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded" />
                <span className="text-slate-400">1.2-1.5x</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-slate-400">1.5-2x</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-slate-400">2-2.5x (Hot)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-600 rounded" />
                <span className="text-slate-400">2.5x+ (Very Hot)</span>
              </div>
            </div>
          </div>

          {/* Top Movers Summary */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Biggest Movers (Last Hour)</h3>
            <div className="grid grid-cols-5 gap-4">
              {topMovers.map((cat, idx) => (
                <div key={cat.name} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : 'bg-orange-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="font-medium text-sm">{cat.name}</div>
                  <div className={`text-sm ${cat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {cat.change >= 0 ? '+' : ''}{cat.change.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drilldown' && (
        <div>
          {/* Category Selection */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory?.name === cat.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {selectedCategory ? (
            <div>
              {/* Category Header */}
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                    <p className="text-slate-400 text-sm">Category breakdown</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getHeatColorClass(selectedCategory.velocity)}`}>
                      {formatMultiple(selectedCategory.baselineMultiple)}
                    </div>
                    <div className="text-sm text-slate-400">vs baseline</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-slate-400 text-xs">Current Mentions/hr</div>
                    <div className="text-xl font-bold">{selectedCategory.hourlyMentions}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Baseline/hr</div>
                    <div className="text-xl font-bold">{selectedCategory.hourlyBaseline}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">1hr Change</div>
                    <div className={`text-xl font-bold ${selectedCategory.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedCategory.change >= 0 ? '+' : ''}{selectedCategory.change.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickers Table */}
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticker</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Mentions/hr</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Velocity Score</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Heat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {selectedCategory.tickers.map(ticker => (
                      <tr key={ticker.symbol} className="hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold">{ticker.symbol}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{ticker.mentions}</td>
                        <td className="px-4 py-3 text-right font-bold">{ticker.velocity.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className={`inline-block w-16 h-3 rounded ${getHeatColor(ticker.velocity)}`}
                               style={{ opacity: 0.7 + (ticker.velocity / 10) * 0.3 }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
              Select a category above to see ticker breakdown
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Velocity trends for top categories over last 6 hours (score: 5.0 = baseline)
          </p>

          {/* Simple Timeline Table */}
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Time</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">AI/ML</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">EVs</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Crypto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Semis</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Meme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {timelineData.map((row, idx) => (
                  <tr key={row.hour} className={idx === timelineData.length - 1 ? 'bg-purple-900/20' : ''}>
                    <td className="px-4 py-3 font-medium">{row.hour}</td>
                    <td className={`px-4 py-3 text-center font-bold ${getHeatColorClass(row['AI/ML'])}`}>
                      {row['AI/ML'].toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${getHeatColorClass(row['EVs'])}`}>
                      {row['EVs'].toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${getHeatColorClass(row['Crypto'])}`}>
                      {row['Crypto'].toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${getHeatColorClass(row['Semis'])}`}>
                      {row['Semis'].toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${getHeatColorClass(row['Meme'])}`}>
                      {row['Meme'].toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trend Summary */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {['AI/ML', 'EVs', 'Crypto', 'Semis', 'Meme'].map(cat => {
              const start = timelineData[0][cat];
              const end = timelineData[timelineData.length - 1][cat];
              const change = end - start;
              return (
                <div key={cat} className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-sm text-slate-400">{cat}</div>
                  <div className={`text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">6hr change</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Box */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <h4 className="font-medium text-purple-200 mb-2">Analysis</h4>
        <p className="text-sm text-purple-200/80">
          <strong>Hottest sector:</strong> {sortedCategories[0].name} at {formatMultiple(sortedCategories[0].baselineMultiple)} baseline
          ({sortedCategories[0].hourlyMentions} mentions vs {sortedCategories[0].hourlyBaseline} avg).
          {topMovers[0].change > 0 && (
            <span> <strong>Accelerating:</strong> {topMovers[0].name} (+{topMovers[0].change.toFixed(1)} velocity in last hour).</span>
          )}
          {categories.filter(c => c.change < -0.5).length > 0 && (
            <span> <strong>Cooling down:</strong> {categories.filter(c => c.change < -0.5).map(c => c.name).join(', ')}.</span>
          )}
          <span> Click any category tile to see individual ticker breakdown.</span>
        </p>
      </div>

      {/* Metric Explanation */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
        <strong>How to read:</strong> Velocity shows current Twitter mentions vs 3-day hourly baseline.
        "2.0x" means twice the normal activity for this hour. Colors indicate heat level from blue (below average)
        to red (2x+ baseline). Click categories to drill down into individual tickers.
      </div>
    </div>
  );
}
```

## How Velocity is Calculated

1. **Baseline**: Average mentions per hour of day, calculated from last 3 days
2. **Current**: Actual mentions in the current hour
3. **Normalized Velocity**: Current / Baseline
4. **Display**: Shown as "1.5x", "2.0x", "3x+" multiples

### Velocity Score Scale (0-10)

| Score | Baseline Multiple | Meaning |
|-------|-------------------|---------|
| 10.0 | 3x+ | Extremely hot - unusual activity |
| 7.5 | 2x | Very elevated - significant spike |
| 6.25 | 1.5x | Elevated - above normal |
| 5.0 | 1x | Normal - at baseline |
| 3.75 | 0.75x | Below average |
| 2.5 | 0.5x | Low activity |

## Category Definitions

| Category | Representative Tickers | Description |
|----------|----------------------|-------------|
| AI/ML | NVDA, MSFT, GOOGL, AMZN, META | Artificial intelligence & machine learning |
| EVs | TSLA, RIVN, LCID, NIO, XPEV | Electric vehicles |
| Crypto | BTC, ETH, SOL, XRP, DOGE | Cryptocurrency |
| Big Tech | AAPL, GOOGL, MSFT, META, AMZN | Large cap technology |
| Semiconductors | NVDA, AMD, INTC, AVGO, QCOM | Chip makers |
| Fintech | SQ, PYPL, COIN, AFRM, HOOD | Financial technology |
| Biotech | LLY, MRNA, PFE, ABBV, JNJ | Biotechnology & pharma |
| Gaming | EA, RBLX, TTWO, ATVI, NTDOY | Video games |
| Energy | XOM, CVX, COP, SLB, OXY | Oil & gas |
| Meme Stocks | GME, AMC, BBBY, BB, NOK | Retail-driven stocks |
| Cloud/SaaS | CRM, SNOW, NET, DDOG, ZS | Cloud software |
| Retail | WMT, TGT, COST, HD, LOW | Consumer retail |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Create a **React artifact** (not text/markdown)
2. Replace ALL sample data with real data from XPOZ MCP
3. **NO SEARCH BOX** - Do not add any ticker/category search input UI
4. **LOCAL TIME** - Set `generatedAtHour` to user's current local hour (0-23)
5. **EXPANDED QUERIES** - Use company names in all queries (NVDA OR NVIDIA, not just NVDA)

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any search UI** - Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - For EVERY ticker, include the company name:
   - `$NVDA OR #NVDA OR NVDA OR NVIDIA` (not just `$NVDA`)
   - Without expansion you'll get ~20 mentions instead of ~150+!

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC. Ask the user their timezone if unsure.

4. **DOWNLOAD FULL CSV** - For each ticker query, use `dataDumpExportOperationId` to get ALL tweets, not just first 100.

### Data Collection Steps

1. **For each category**, fetch data for all 5 tickers using EXPANDED queries

2. **Fetch TODAY's data** for each ticker:
   ```
   getTwitterPostsByKeywords({ query: "EXPANDED_QUERY", startDate: TODAY, endDate: TODAY })
   ```

3. **Fetch BASELINE data** (last 3 days) using SAME expanded query:
   ```
   getTwitterPostsByKeywords({ query: "EXPANDED_QUERY", startDate: 3_DAYS_AGO, endDate: TODAY })
   ```

4. **Calculate hourly baselines** - For each hour (0-23): `baseline[hour] = totalPostsInThatHour / 3`

5. **Calculate velocity** - For the current hour: `velocity = 2.5 + (actual/baseline * 2.5)`, clamped 0-10

6. **Aggregate per category** - Sum all ticker mentions for category-level metrics

### Replace These Values in Template

| Variable | Value |
|----------|-------|
| `generatedAtHour` | User's current local hour (0-23) |
| `categories` | Real data from XPOZ MCP for all 12 categories |
| `timelineData` | Real 6-hour velocity history per category |

### Data Sources per Category

- AI/ML: NVDA, MSFT, GOOGL, AMZN, META
- EVs: TSLA, RIVN, LCID, NIO, XPEV
- Crypto: BTC, ETH, SOL, XRP, DOGE
- Big Tech: AAPL, GOOGL, MSFT, META, AMZN
- Semiconductors: NVDA, AMD, INTC, AVGO, QCOM
- Fintech: SQ, PYPL, AFRM, COIN, HOOD
- Biotech: MRNA, PFE, LLY, ABBV, JNJ
- Cloud/SaaS: CRM, SNOW, NET, DDOG, ZS
- Gaming: EA, TTWO, RBLX, ATVI, NTDOY
- Energy: XOM, CVX, COP, SLB, OXY
- Retail: WMT, TGT, COST, HD, LOW
- Meme Stocks: GME, AMC, BBBY, BB, NOK
