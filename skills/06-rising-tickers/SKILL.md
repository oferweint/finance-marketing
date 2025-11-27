---
name: rising-tickers
description: Discover emerging assets gaining social traction before mainstream attention. Input any category to find rising tickers with velocity acceleration, normalized against hourly baselines. Compare across peer categories for cross-sector opportunities.
---

# Rising Tickers Skill

## Overview

This skill identifies assets gaining significant social traction, ranking them by discovery potential and acceleration metrics - all powered by XPOZ MCP real-time Twitter data with baseline normalization.

## When to Use

Activate this skill when the user asks about:
- "What tickers are gaining attention?"
- "Find rising stocks"
- "Emerging crypto opportunities"
- "What's trending before it's mainstream?"
- "Discovery signals in the market"
- "Show me breakout candidates"

## Data Source: XPOZ MCP

**All data comes from XPOZ MCP with real-time Twitter data.**

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

**Without query expansion:**
- GOOGL: ~20 mentions/day ❌
- With expansion: ~150+ mentions/day ✅

### Data Flow for Claude:

1. **Scan categories for accelerating tickers:**
```
For each category (AI, EVs, Crypto, etc.):
  Use getTwitterPostsByKeywords for representative tickers
  MUST include company names: "$TICKER OR #TICKER OR TICKER OR CompanyName"
  Compare current hour mentions vs 3-day hourly baseline
  Flag tickers where velocity > 2x baseline
```

2. **Calculate discovery score per ticker:**
```
Discovery = (0.35 × acceleration) + (0.25 × recency) + (0.20 × sentiment) + (0.20 × influencer_coverage)

Where:
- acceleration: velocity change % (higher = better)
- recency: time since breakout (newer = better)
- sentiment: bullish % of mentions
- influencer_coverage: high-follower accounts discussing
```

3. **Identify catalysts from tweet content:**
```
Scan recent tweets for common themes:
- Earnings mentions
- Partnership news
- Product launches
- Technical breakout keywords
```

4. **Assess risk level:**
```
Risk = f(market_cap, volatility, sentiment_quality)
- Small cap + high velocity = high risk
- Large cap + moderate velocity = medium risk
```

## Output Requirements

Always render a **React artifact** with:
1. **Category filter** - select which sector to scan
2. Ranked ticker cards with discovery scores
3. Three tabs: **Rising Now**, **Recent Breakouts**, **Category Comparison**
4. Velocity vs baseline visualization
5. Catalyst identification

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { Rocket, TrendingUp, Flame, Clock, Star, Zap, Filter, BarChart2 } from 'lucide-react';

export default function RisingTickers() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('rising');

  // CLAUDE: Replace with user's local hour
  const generatedAtHour = 12; // CLAUDE: Replace with user's local hour

  const categories = ['all', 'AI/ML', 'EVs', 'Crypto', 'Semiconductors', 'Biotech', 'Meme Stocks', 'Fintech'];

  // SAMPLE DATA - Claude will replace with XPOZ MCP data
  // Velocity normalized: 5.0 = baseline, 7.5 = 2x baseline, 10 = 3x+ baseline
  const risingAssets = [
    {
      ticker: 'SMCI',
      name: 'Super Micro Computer',
      category: 'AI/Semis',
      discoveryScore: 9.4,
      velocity: 8.8,
      baselineMultiple: 2.8,
      hourlyMentions: 425,
      hourlyBaseline: 152,
      velocityChange: '+340%',
      sentiment: 0.78,
      timeSinceBreakout: '3 days',
      catalysts: ['AI server demand', 'Earnings beat', 'NVDA partnership'],
      risk: 'medium',
      influencerCoverage: 85
    },
    {
      ticker: 'MSTR',
      name: 'MicroStrategy',
      category: 'Crypto proxy',
      discoveryScore: 8.7,
      velocity: 8.2,
      baselineMultiple: 2.3,
      hourlyMentions: 312,
      hourlyBaseline: 136,
      velocityChange: '+280%',
      sentiment: 0.72,
      timeSinceBreakout: '5 days',
      catalysts: ['BTC rally', 'Saylor conviction', 'ETF flows'],
      risk: 'high',
      influencerCoverage: 78
    },
    {
      ticker: 'IONQ',
      name: 'IonQ',
      category: 'Quantum',
      discoveryScore: 8.2,
      velocity: 7.5,
      baselineMultiple: 1.9,
      hourlyMentions: 89,
      hourlyBaseline: 47,
      velocityChange: '+195%',
      sentiment: 0.65,
      timeSinceBreakout: '1 week',
      catalysts: ['Quantum breakthrough news', 'Partnership rumors'],
      risk: 'high',
      influencerCoverage: 62
    },
    {
      ticker: 'ARM',
      name: 'ARM Holdings',
      category: 'AI/Semis',
      discoveryScore: 7.9,
      velocity: 7.2,
      baselineMultiple: 1.7,
      hourlyMentions: 198,
      hourlyBaseline: 116,
      velocityChange: '+156%',
      sentiment: 0.71,
      timeSinceBreakout: '2 weeks',
      catalysts: ['AI chip design dominance', 'Royalty growth'],
      risk: 'medium',
      influencerCoverage: 72
    },
    {
      ticker: 'RKLB',
      name: 'Rocket Lab',
      category: 'Space',
      discoveryScore: 7.5,
      velocity: 6.8,
      baselineMultiple: 1.5,
      hourlyMentions: 78,
      hourlyBaseline: 52,
      velocityChange: '+120%',
      sentiment: 0.68,
      timeSinceBreakout: '10 days',
      catalysts: ['Launch success', 'NASA contracts', 'Neutron progress'],
      risk: 'high',
      influencerCoverage: 58
    }
  ];

  // Category comparison data
  const categoryBreakouts = [
    { category: 'AI/Semis', risingCount: 8, avgDiscovery: 8.2, hottest: 'SMCI' },
    { category: 'Crypto', risingCount: 5, avgDiscovery: 7.5, hottest: 'MSTR' },
    { category: 'Quantum', risingCount: 3, avgDiscovery: 7.2, hottest: 'IONQ' },
    { category: 'Space', risingCount: 4, avgDiscovery: 6.8, hottest: 'RKLB' },
    { category: 'Biotech', risingCount: 2, avgDiscovery: 6.2, hottest: 'MRNA' },
  ];

  const filteredAssets = selectedCategory === 'all'
    ? risingAssets
    : risingAssets.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getRiskColor = (risk) => {
    if (risk === 'high') return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (risk === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  const getDiscoveryBadge = (score) => {
    if (score >= 9) return { label: 'HOT', color: 'bg-red-500' };
    if (score >= 8) return { label: 'RISING', color: 'bg-orange-500' };
    if (score >= 7) return { label: 'EMERGING', color: 'bg-yellow-500' };
    return { label: 'WATCH', color: 'bg-blue-500' };
  };

  const formatMultiple = (multiple) => {
    if (multiple >= 3) return '3x+';
    return `${multiple.toFixed(1)}x`;
  };

  const tabs = [
    { id: 'rising', label: 'Rising Now', icon: Rocket },
    { id: 'recent', label: 'Recent Breakouts', icon: Clock },
    { id: 'categories', label: 'By Category', icon: BarChart2 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Rising Tickers</h1>
            <p className="text-slate-400 text-sm">Early momentum discovery</p>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            {risingAssets.length} signals detected
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Generated at: {String(generatedAtHour).padStart(2, '0')}:00 local</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
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
                  ? 'bg-orange-600 text-white'
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
      {(activeTab === 'rising' || activeTab === 'recent') && (
        <div className="space-y-4">
          {filteredAssets.map((asset, idx) => {
            const badge = getDiscoveryBadge(asset.discoveryScore);
            return (
              <div key={asset.ticker} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-sm font-bold">
                        {asset.ticker}
                      </div>
                      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-xs font-bold text-white ${badge.color}`}>
                        {badge.label}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{asset.ticker}</span>
                        <span className="text-slate-400 text-sm">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-slate-500">{asset.category}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${getRiskColor(asset.risk)}`}>
                          {asset.risk} risk
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {asset.catalysts.map((cat, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-2xl font-bold text-yellow-400">{asset.discoveryScore}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Discovery Score</div>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-xs text-slate-500">vs Baseline</div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="font-bold text-orange-400">{formatMultiple(asset.baselineMultiple)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Mentions/hr</div>
                    <div className="font-medium">{asset.hourlyMentions}</div>
                    <div className="text-xs text-slate-600">base: {asset.hourlyBaseline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Sentiment</div>
                    <div className={`font-medium ${asset.sentiment >= 0.6 ? 'text-green-400' : 'text-slate-400'}`}>
                      {(asset.sentiment * 100).toFixed(0)}% bullish
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Breakout</div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{asset.timeSinceBreakout}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Influencers</div>
                    <div className="font-medium">{asset.influencerCoverage}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Breakout activity by sector (tickers with 2x+ baseline velocity)</p>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Rising Count</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Avg Discovery</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Hottest Ticker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {categoryBreakouts.map(cat => (
                  <tr key={cat.category} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-medium">{cat.category}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-bold">
                        {cat.risingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-yellow-400 font-bold">{cat.avgDiscovery}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-orange-400">{cat.hottest}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Top Category</div>
          <div className="font-bold text-orange-400">AI/Semis</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Avg Discovery</div>
          <div className="font-bold text-yellow-400">
            {(risingAssets.reduce((sum, a) => sum + a.discoveryScore, 0) / risingAssets.length).toFixed(1)}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">High Risk</div>
          <div className="font-bold text-red-400">
            {risingAssets.filter(a => a.risk === 'high').length}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-sm mb-1">Avg vs Baseline</div>
          <div className="font-bold text-orange-400">
            {formatMultiple(risingAssets.reduce((sum, a) => sum + a.baselineMultiple, 0) / risingAssets.length)}
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <h4 className="font-medium text-orange-200 mb-2">Discovery Summary</h4>
        <p className="text-sm text-orange-200/80">
          <strong>Hottest:</strong> {risingAssets[0].ticker} leads with {risingAssets[0].discoveryScore}/10 discovery score,
          running at {formatMultiple(risingAssets[0].baselineMultiple)} baseline ({risingAssets[0].hourlyMentions} vs {risingAssets[0].hourlyBaseline} avg/hr).
          {risingAssets.filter(a => a.risk === 'high').length} of {risingAssets.length} signals are high risk.
          <strong> Top theme:</strong> AI/Semis with {categoryBreakouts[0].risingCount} rising tickers.
        </p>
      </div>

      {/* Metric Explanation */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
        <strong>Discovery Score (1-10):</strong> Combines velocity acceleration (35%), time since breakout (25%),
        sentiment strength (20%), and influencer coverage (20%). Higher = earlier discovery potential.
        <strong> Baseline Multiple:</strong> Current mentions vs 3-day hourly average. "2.5x" = 2.5 times normal activity.
      </div>
    </div>
  );
}
```

## Discovery Score Calculation

| Factor | Weight | Description |
|--------|--------|-------------|
| Velocity acceleration | 35% | How fast mentions are growing vs baseline |
| Time since breakout | 25% | Newer breakouts score higher |
| Sentiment strength | 20% | Bullish % of mentions |
| Influencer coverage | 20% | High-follower accounts discussing |

### Score Scale

| Score | Badge | Meaning |
|-------|-------|---------|
| 9-10 | HOT | Explosive growth, act fast |
| 8-8.9 | RISING | Strong momentum building |
| 7-7.9 | EMERGING | Early stage breakout |
| <7 | WATCH | On radar, not confirmed |

## Risk Assessment

| Risk Level | Criteria |
|------------|----------|
| High | Small cap, >3x baseline, high volatility |
| Medium | Mid cap, 2-3x baseline, moderate volatility |
| Low | Large cap, <2x baseline, established company |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Create a **React artifact** (not text/markdown)
2. Replace ALL sample data with real data from XPOZ MCP
3. **NO SEARCH BOX** - Do not add any search input UI
4. **LOCAL TIME** - Set `generatedAtHour` to user's current local hour (0-23)
5. **EXPANDED QUERIES** - Use company names in all queries

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any search UI** - Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - For EVERY ticker, include the company name:
   - `$TSLA OR #TSLA OR TSLA OR Tesla` (not just `$TSLA`)
   - Without expansion you'll get ~20 mentions instead of ~150+!

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC.

4. **DOWNLOAD FULL CSV** - Use `dataDumpExportOperationId` to get ALL tweets, not just first 100.

### Data Processing Steps

1. **Scan categories** via XPOZ MCP for accelerating tickers
2. **Compare to baselines** (3-day hourly average per ticker)
3. **Calculate discovery scores** using weighted formula
4. **Identify catalysts** from tweet content analysis
5. **Assess risk levels** based on market cap and velocity
6. **Render React artifact** with all three tabs
7. **Highlight hottest opportunities** with category context
