---
name: position-tracker
description: Track stated bull and bear positions from key influencers over time for any ticker. Visualize position changes, conviction levels, and compare positioning across peer stocks. Powered by real-time XPOZ MCP Twitter data.
---

# Position Tracker Skill

## Overview

This skill tracks and visualizes the stated positions of key influencers over time for any ticker, helping identify shifts in sentiment among opinion leaders - all powered by XPOZ MCP real-time Twitter data.

## When to Use

Activate this skill when the user asks about:
- "What positions are influencers taking on [TICKER]?"
- "Track bull/bear stances on [ASSET]"
- "Has anyone flipped on [STOCK]?"
- "Who changed their position on [CRYPTO]?"
- "Smart money positions on [TICKER]"

## Data Source: XPOZ MCP

**All data comes from XPOZ MCP with real-time Twitter data.**

### Data Flow for Claude:

1. **Fetch recent posts mentioning the ticker:**
```
Use getTwitterPostsByKeywords with:
- query: "$TICKER" or "TICKER"
- Look for position-indicating keywords
```

2. **Identify position from tweet content:**
```
Scan for position indicators:
- BULLISH: "long", "buy", "bullish", "accumulating", "PT $X" (above current)
- BEARISH: "short", "sell", "bearish", "puts", "PT $X" (below current)
- NEUTRAL: "watching", "wait", "sidelines", mixed signals
```

3. **Track position changes over time:**
```
Compare current position to historical positions
Flag "flips" when position reverses (bull→bear or bear→bull)
```

4. **Calculate conviction level:**
```
Conviction = (0.4 × language_strength) + (0.3 × frequency) + (0.3 × specificity)
- Language: "strongly bullish" > "slightly bullish"
- Frequency: Multiple posts = higher conviction
- Specificity: Specific PT = higher than vague
```

5. **Get peer comparison:**
- Use Claude's knowledge to identify 5 category peers
- Aggregate bull/bear ratio for each peer

## Output Requirements

Always render a **React artifact** with:
1. **Ticker input field** - search for any stock/crypto
2. Position distribution (bull/bear/neutral counts)
3. Three tabs: **Current Positions**, **History**, **Peer Comparison**
4. Position flip alerts
5. Conviction bar visualization

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, ArrowRight, AlertCircle, Search, Clock, BarChart2, Users } from 'lucide-react';

export default function PositionTracker() {
  const [tickerInput, setTickerInput] = useState('NVDA');
  const [ticker, setTicker] = useState('NVDA');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  const handleSearch = () => {
    if (tickerInput.trim()) {
      setIsLoading(true);
      setTicker(tickerInput.toUpperCase().trim());
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // SAMPLE DATA - Claude will replace with XPOZ MCP data
  const positions = [
    {
      username: '@NVDAbull',
      name: 'AI Investor',
      currentPosition: 'bullish',
      previousPosition: 'bullish',
      conviction: 9,
      priceTarget: '$150',
      lastUpdated: '2h ago',
      thesis: 'AI demand insatiable. Data center growth accelerating.',
      accuracy: 78,
      postsAboutTicker: 45
    },
    {
      username: '@TechBear',
      name: 'Tech Skeptic',
      currentPosition: 'bearish',
      previousPosition: 'neutral',
      conviction: 7,
      priceTarget: '$95',
      lastUpdated: '6h ago',
      thesis: 'Valuation stretched. Competition heating up from AMD.',
      accuracy: 62,
      flipped: true,
      postsAboutTicker: 23
    },
    {
      username: '@ChipAnalyst',
      name: 'Semi Expert',
      currentPosition: 'bullish',
      previousPosition: 'bearish',
      conviction: 8,
      priceTarget: '$140',
      lastUpdated: '1d ago',
      thesis: 'Changed view after Blackwell announcement.',
      accuracy: 71,
      flipped: true,
      postsAboutTicker: 67
    },
    {
      username: '@ValueHunter',
      name: 'Value Investor',
      currentPosition: 'neutral',
      previousPosition: 'neutral',
      conviction: 5,
      priceTarget: '$115',
      lastUpdated: '3d ago',
      thesis: 'Fair value here. Need pullback to add.',
      accuracy: 68,
      postsAboutTicker: 12
    },
    {
      username: '@MacroTrader',
      name: 'Macro Trader',
      currentPosition: 'bullish',
      previousPosition: 'bullish',
      conviction: 8,
      priceTarget: '$145',
      lastUpdated: '5h ago',
      thesis: 'Semis leading the AI trade. Still room to run.',
      accuracy: 74,
      postsAboutTicker: 34
    }
  ];

  // Historical position distribution (last 4 weeks)
  const historicalData = [
    { period: '4w ago', bullish: 45, bearish: 35, neutral: 20 },
    { period: '3w ago', bullish: 50, bearish: 30, neutral: 20 },
    { period: '2w ago', bullish: 55, bearish: 25, neutral: 20 },
    { period: '1w ago', bullish: 60, bearish: 25, neutral: 15 },
    { period: 'Now', bullish: 65, bearish: 20, neutral: 15 },
  ];

  // Peer comparison data
  const peerComparison = [
    { ticker: 'NVDA', bullish: 65, bearish: 20, neutral: 15, flips: 2 },
    { ticker: 'AMD', bullish: 55, bearish: 30, neutral: 15, flips: 1 },
    { ticker: 'INTC', bullish: 35, bearish: 45, neutral: 20, flips: 3 },
    { ticker: 'AVGO', bullish: 60, bearish: 25, neutral: 15, flips: 0 },
    { ticker: 'QCOM', bullish: 50, bearish: 30, neutral: 20, flips: 1 },
  ];

  const positionCounts = {
    bullish: positions.filter(p => p.currentPosition === 'bullish').length,
    bearish: positions.filter(p => p.currentPosition === 'bearish').length,
    neutral: positions.filter(p => p.currentPosition === 'neutral').length
  };

  const flippedPositions = positions.filter(p => p.flipped);

  const getPositionColor = (pos) => {
    if (pos === 'bullish') return 'text-green-400';
    if (pos === 'bearish') return 'text-red-400';
    return 'text-slate-400';
  };

  const getPositionBg = (pos) => {
    if (pos === 'bullish') return 'bg-green-500/20 border-green-500/30';
    if (pos === 'bearish') return 'bg-red-500/20 border-red-500/30';
    return 'bg-slate-500/20 border-slate-500/30';
  };

  const getConvictionBar = (conviction) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-3 rounded-sm ${
              i < conviction
                ? conviction >= 8 ? 'bg-green-500' : conviction >= 5 ? 'bg-yellow-500' : 'bg-slate-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'current', label: 'Current Positions', icon: Target },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'peers', label: 'Peer Comparison', icon: BarChart2 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold">Position Tracker</h1>
            <p className="text-slate-400 text-sm">Influencer stance monitoring</p>
          </div>
        </div>
        {flippedPositions.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">{flippedPositions.length} position flip(s)</span>
          </div>
        )}
      </div>

      {/* Ticker Input */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter ticker (e.g., AAPL)"
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Track'}
        </button>
        <div className="text-slate-400 text-sm">
          Tracking: <span className="text-purple-400 font-bold">${ticker}</span>
        </div>
      </div>

      {/* Position Distribution Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-green-400">{positionCounts.bullish}</div>
          <div className="text-sm text-slate-400">Bullish</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-red-400">{positionCounts.bearish}</div>
          <div className="text-sm text-slate-400">Bearish</div>
        </div>
        <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-4 text-center">
          <ArrowRight className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-slate-400">{positionCounts.neutral}</div>
          <div className="text-sm text-slate-400">Neutral</div>
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
      {activeTab === 'current' && (
        <div className="space-y-3">
          {positions.map((pos) => (
            <div key={pos.username} className={`bg-slate-800 rounded-lg p-4 ${pos.flipped ? 'border-l-4 border-yellow-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{pos.name}</span>
                    <span className="text-slate-500 text-sm">{pos.username}</span>
                    {pos.flipped && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">FLIPPED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {pos.flipped && (
                      <>
                        <span className={`text-sm ${getPositionColor(pos.previousPosition)}`}>{pos.previousPosition}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </>
                    )}
                    <span className={`px-2 py-0.5 rounded text-sm font-medium border ${getPositionBg(pos.currentPosition)} ${getPositionColor(pos.currentPosition)}`}>
                      {pos.currentPosition.toUpperCase()}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 text-sm">PT: {pos.priceTarget}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-500 text-sm">{pos.lastUpdated}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 italic">"{pos.thesis}"</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs text-slate-500 mb-1">Conviction</div>
                  {getConvictionBar(pos.conviction)}
                  <div className="text-xs text-slate-500 mt-2">{pos.accuracy}% accuracy</div>
                  <div className="text-xs text-slate-500">{pos.postsAboutTicker} posts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Position distribution over last 4 weeks</p>

          {/* Stacked Bar Visualization */}
          <div className="space-y-3 mb-6">
            {historicalData.map((week) => (
              <div key={week.period} className="flex items-center gap-4">
                <div className="w-16 text-sm text-slate-400 text-right">{week.period}</div>
                <div className="flex-1 flex h-8 rounded-lg overflow-hidden">
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs font-medium"
                    style={{ width: `${week.bullish}%` }}
                  >
                    {week.bullish}%
                  </div>
                  <div
                    className="bg-slate-500 flex items-center justify-center text-xs font-medium"
                    style={{ width: `${week.neutral}%` }}
                  >
                    {week.neutral}%
                  </div>
                  <div
                    className="bg-red-500 flex items-center justify-center text-xs font-medium"
                    style={{ width: `${week.bearish}%` }}
                  >
                    {week.bearish}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-slate-400">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-500 rounded" />
              <span className="text-slate-400">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-slate-400">Bearish</span>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="mt-6 bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Trend Analysis</h4>
            <p className="text-sm text-slate-400">
              Bullish sentiment has increased from {historicalData[0].bullish}% to {historicalData[historicalData.length-1].bullish}%
              over the past 4 weeks (+{historicalData[historicalData.length-1].bullish - historicalData[0].bullish}%).
              Bearish sentiment decreased from {historicalData[0].bearish}% to {historicalData[historicalData.length-1].bearish}%.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'peers' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Position comparison across Semiconductor sector peers</p>

          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticker</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Bull %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Bear %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Neutral %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Recent Flips</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Sentiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {peerComparison.map(peer => (
                  <tr key={peer.ticker} className={`hover:bg-slate-700/50 ${peer.ticker === ticker ? 'bg-purple-900/20' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${peer.ticker === ticker ? 'text-purple-400' : ''}`}>
                        {peer.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-green-400 font-medium">{peer.bullish}%</td>
                    <td className="px-4 py-3 text-center text-red-400 font-medium">{peer.bearish}%</td>
                    <td className="px-4 py-3 text-center text-slate-400">{peer.neutral}%</td>
                    <td className="px-4 py-3 text-center">
                      {peer.flips > 0 ? (
                        <span className="text-yellow-400">{peer.flips}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        peer.bullish > peer.bearish + 10 ? 'bg-green-500/20 text-green-400' :
                        peer.bearish > peer.bullish + 10 ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {peer.bullish > peer.bearish + 10 ? 'BULLISH' :
                         peer.bearish > peer.bullish + 10 ? 'BEARISH' : 'MIXED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Most Bullish</div>
              <div className="font-bold text-green-400">NVDA (65%)</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Most Bearish</div>
              <div className="font-bold text-red-400">INTC (45%)</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Most Flips</div>
              <div className="font-bold text-yellow-400">INTC (3)</div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <h4 className="font-medium text-purple-200 mb-2">Analysis</h4>
        <p className="text-sm text-purple-200/80">
          <strong>${ticker}</strong> shows {positionCounts.bullish > positionCounts.bearish ? 'bullish' : 'bearish'} skew
          ({positionCounts.bullish} bull vs {positionCounts.bearish} bear).
          {flippedPositions.length > 0 && (
            <span> <strong>Alert:</strong> {flippedPositions.length} influencer(s) recently flipped: {flippedPositions.map(p => p.name).join(', ')}.</span>
          )}
          <span> Average conviction: {(positions.reduce((sum, p) => sum + p.conviction, 0) / positions.length).toFixed(1)}/10.</span>
        </p>
      </div>

      {/* Metric Explanation */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
        <strong>Conviction (1-10):</strong> Measured by language strength, posting frequency about ticker, and price target specificity.
        <strong> Position flip:</strong> When an influencer reverses stance (bull→bear or vice versa). High-value signal for sentiment shifts.
        <strong> Accuracy:</strong> Historical accuracy of the influencer's calls.
      </div>
    </div>
  );
}
```

## Position Detection Logic

Claude analyzes tweet content to determine position:

**Bullish signals:**
- Keywords: "long", "buy", "bullish", "accumulating", "adding", "undervalued"
- Price targets above current price
- Positive emojis (rocket, green, money)

**Bearish signals:**
- Keywords: "short", "sell", "bearish", "puts", "overvalued", "crash"
- Price targets below current price
- Negative emojis (red, warning, down)

**Neutral signals:**
- "Watching", "waiting", "sidelines"
- Mixed or balanced commentary
- No clear directional bias

## Conviction Score (1-10)

| Factor | Weight | Description |
|--------|--------|-------------|
| Language strength | 40% | "Strongly bullish" > "slightly bullish" |
| Frequency | 30% | Multiple posts = higher conviction |
| Specificity | 30% | Specific PT > vague statements |

## Position Change Alerts

| Change Type | Alert Level | Signal |
|-------------|-------------|--------|
| Bull → Bear | HIGH | Major sentiment reversal |
| Bear → Bull | HIGH | Major sentiment reversal |
| Neutral → Bull/Bear | MEDIUM | Taking a stance |
| Bull/Bear → Neutral | LOW | Reducing conviction |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/position-tracker.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. **Accept ticker input** from user (any stock or crypto)
2. **Fetch posts via XPOZ MCP** `getTwitterPostsByKeywords` for the ticker
3. **Identify unique influencers** and their positions
4. **Detect position changes** by comparing to previous statements
5. **Calculate conviction scores** using the weighted formula
6. **Identify category peers** using Claude's knowledge
7. **Fetch peer positioning** for comparison
8. **Render React artifact** with all three tabs
9. **Highlight position flips** as high-value signals
