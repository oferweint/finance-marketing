---
name: influencer-radar
description: Identify key voices and influencers discussing any financial asset. Input any ticker to see top accounts by reach, engagement, and influence. Compare sentiment across peer group influencers with real-time Twitter data.
---

# Influencer Radar Skill

## Overview

This skill identifies and ranks social media influencers discussing a specific asset, showing their reach, engagement, stated positions, and influence scores - all powered by XPOZ MCP real-time Twitter data.

## When to Use

Activate this skill when the user asks about:
- "Who's talking about [TICKER]?"
- "Find influencers for [ASSET]"
- "Key voices on [STOCK]"
- "Who are the top [CRYPTO] analysts?"
- "Influential accounts discussing [TICKER]"
- "Smart money voices on [STOCK]"

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
| META | `$META OR #META OR META OR Facebook OR "Meta Platforms"` |
| BTC | `$BTC OR #BTC OR BTC OR Bitcoin` |
| ETH | `$ETH OR #ETH OR ETH OR Ethereum` |

**For other tickers**, look up the company name via web search: `"{TICKER} stock company name"`

**Without query expansion:**
- GOOGL: ~20 mentions/day ❌
- With expansion: ~150+ mentions/day ✅

### Data Flow for Claude:

1. **Get recent posts mentioning the ticker (USE EXPANDED QUERY!):**
```
Use getTwitterPostsByKeywords with:
- query: "$TSLA OR #TSLA OR TSLA OR Tesla" (EXPANDED, not just "$TSLA")
- Get last 24-48 hours of posts
- Use dataDumpExportOperationId to get ALL posts, not just first 100
```

2. **For each unique author, fetch profile data:**
```
Use getTwitterUserByUsername to get:
- Follower count
- Following count
- Tweet count
- Verified status
- Bio/description
```

3. **Calculate influence score per user:**
```
Influence = (0.3 × follower_score) + (0.3 × engagement_score) + (0.2 × relevance_score) + (0.2 × frequency_score)

Where:
- follower_score: normalized followers (log scale, 1-10)
- engagement_score: avg retweets + replies per post about ticker
- relevance_score: % of recent posts about this ticker
- frequency_score: posts per day about ticker
```

4. **Detect position (bullish/bearish/neutral):**
- Analyze recent tweet text for sentiment keywords
- Bullish: "long", "buy", "bullish", "moon", "undervalued", "🚀"
- Bearish: "short", "sell", "bearish", "overvalued", "crash"
- Neutral: balanced or informational

5. **Get peer comparison data:**
- Use Claude's category knowledge to identify 5 peer tickers
- Fetch top influencer for each peer for comparison

## Output Requirements

Always render a **React artifact** with:
1. **NO search box** - artifacts cannot trigger Claude actions
2. Ranked influencer cards with metrics
3. Three tabs: **Top Voices**, **Activity Timeline**, **Peer Comparison**
4. Position indicators (bull/bear/neutral)
5. Clear explanation of influence score
6. Generated time showing user's local hour

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, Award, MessageCircle, Repeat2, Clock, BarChart2, CheckCircle } from 'lucide-react';

export default function InfluencerRadar() {
  const [activeTab, setActiveTab] = useState('voices');

  // CLAUDE: Set this to the ticker being analyzed
  const ticker = 'TSLA'; // Replace with actual ticker

  // CLAUDE: Set this to user's current local hour (0-23) - NOT UTC!
  const generatedAtHour = 12; // Replace with user's current local hour

  // SAMPLE DATA - Claude MUST replace with XPOZ MCP data using EXPANDED QUERIES
  // IMPORTANT: Use "$TSLA OR Tesla" not just "$TSLA" to capture all mentions!
  const influencers = [
    {
      username: '@SawyerMerritt',
      name: 'Sawyer Merritt',
      followers: 512000,
      engagement: 5.1,
      position: 'bullish',
      recentTake: 'FSD v12 is a game changer. Robotaxi coming.',
      influenceScore: 9.5,
      verified: true,
      avgRetweets: 1240,
      avgReplies: 445,
      postsToday: 12,
      relevance: 85, // % of posts about this ticker
      recentPosts: [
        { time: '2h ago', text: 'TSLA deliveries looking strong for Q4', retweets: 892 },
        { time: '5h ago', text: 'Model Y still #1 selling car worldwide', retweets: 1105 },
      ]
    },
    {
      username: '@TeslaDaily',
      name: 'Rob Maurer',
      followers: 245000,
      engagement: 4.2,
      position: 'bullish',
      recentTake: 'Q4 deliveries will beat expectations. Long TSLA.',
      influenceScore: 9.2,
      verified: true,
      avgRetweets: 892,
      avgReplies: 234,
      postsToday: 8,
      relevance: 92,
      recentPosts: [
        { time: '1h ago', text: 'New episode out - breaking down the numbers', retweets: 456 },
        { time: '4h ago', text: 'Energy storage growth continues to impress', retweets: 678 },
      ]
    },
    {
      username: '@WholeMarsBlog',
      name: 'Whole Mars Catalog',
      followers: 389000,
      engagement: 4.6,
      position: 'bullish',
      recentTake: 'Tesla energy business underappreciated.',
      influenceScore: 8.9,
      verified: false,
      avgRetweets: 678,
      avgReplies: 289,
      postsToday: 15,
      relevance: 78,
      recentPosts: [
        { time: '30m ago', text: 'FSD improving rapidly with each update', retweets: 534 },
        { time: '3h ago', text: 'Supercharger network is a massive moat', retweets: 721 },
      ]
    },
    {
      username: '@GordonJohnson',
      name: 'Gordon Johnson',
      followers: 89000,
      engagement: 3.8,
      position: 'bearish',
      recentTake: 'Demand destruction is real. PT $85.',
      influenceScore: 7.8,
      verified: true,
      avgRetweets: 456,
      avgReplies: 312,
      postsToday: 6,
      relevance: 65,
      recentPosts: [
        { time: '3h ago', text: 'Margins continue to compress, as predicted', retweets: 234 },
        { time: '8h ago', text: 'Competition catching up fast', retweets: 189 },
      ]
    },
    {
      username: '@TeslaEconomist',
      name: 'Tesla Economist',
      followers: 156000,
      engagement: 3.9,
      position: 'neutral',
      recentTake: 'Waiting for margins to stabilize before adding.',
      influenceScore: 7.5,
      verified: false,
      avgRetweets: 234,
      avgReplies: 145,
      postsToday: 4,
      relevance: 88,
      recentPosts: [
        { time: '6h ago', text: 'Q4 estimates looking reasonable', retweets: 156 },
        { time: '12h ago', text: 'Need to see margin improvement next quarter', retweets: 198 },
      ]
    },
  ];

  // Peer comparison data - top influencer per peer stock
  const peerInfluencers = [
    { ticker: 'TSLA', topVoice: '@SawyerMerritt', followers: '512K', position: 'bullish', score: 9.5 },
    { ticker: 'RIVN', topVoice: '@RivianOwners', followers: '125K', position: 'bullish', score: 7.2 },
    { ticker: 'LCID', topVoice: '@LucidInsider', followers: '89K', position: 'neutral', score: 6.8 },
    { ticker: 'NIO', topVoice: '@NIOStock', followers: '234K', position: 'bullish', score: 7.9 },
    { ticker: 'XPEV', topVoice: '@XPengNews', followers: '45K', position: 'neutral', score: 5.5 },
  ];

  const sortedInfluencers = [...influencers].sort((a, b) => b.influenceScore - a.influenceScore);

  const positionCounts = {
    bullish: influencers.filter(i => i.position === 'bullish').length,
    bearish: influencers.filter(i => i.position === 'bearish').length,
    neutral: influencers.filter(i => i.position === 'neutral').length
  };

  const formatFollowers = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
  };

  const PositionBadge = ({ position }) => {
    const styles = {
      bullish: 'bg-green-500/20 text-green-400 border-green-500/30',
      bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
      neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    const icons = {
      bullish: <TrendingUp className="w-3 h-3" />,
      bearish: <TrendingDown className="w-3 h-3" />,
      neutral: <Minus className="w-3 h-3" />
    };
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${styles[position]}`}>
        {icons[position]}
        {position}
      </div>
    );
  };

  const tabs = [
    { id: 'voices', label: 'Top Voices', icon: Users },
    { id: 'timeline', label: 'Activity', icon: Clock },
    { id: 'peers', label: 'Peer Comparison', icon: BarChart2 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Influencer Radar</h1>
            <p className="text-slate-400 text-sm">Key voices & opinion leaders</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Generated at: {String(generatedAtHour).padStart(2, '0')}:00 local</div>
          <div className="text-xs text-slate-500">Last 24-48 hours</div>
        </div>
      </div>

      {/* Position Summary */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-slate-400">{positionCounts.bullish} Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-slate-400">{positionCounts.bearish} Bearish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full" />
          <span className="text-slate-400">{positionCounts.neutral} Neutral</span>
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
                  ? 'bg-cyan-600 text-white'
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
      {activeTab === 'voices' && (
        <div>
          {/* Influencer Cards */}
          <div className="space-y-3 mb-6">
            {sortedInfluencers.map((inf, idx) => (
              <div key={inf.username} className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
                        {inf.name.charAt(0)}
                      </div>
                      {idx < 3 && (
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : 'bg-orange-600'
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{inf.name}</span>
                        {inf.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                        <PositionBadge position={inf.position} />
                      </div>
                      <div className="text-slate-400 text-sm">{inf.username}</div>
                      <p className="text-sm text-slate-300 mt-2 italic">"{inf.recentTake}"</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">{inf.influenceScore}</div>
                    <div className="text-xs text-slate-400">influence</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {formatFollowers(inf.followers)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat2 className="w-3 h-3" />
                    {inf.avgRetweets} avg RTs
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {inf.avgReplies} avg replies
                  </div>
                  <div>{inf.postsToday} posts today</div>
                  <div>{inf.relevance}% about ${ticker}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs mb-1">Total Reach</div>
              <div className="text-xl font-bold">{formatFollowers(influencers.reduce((sum, i) => sum + i.followers, 0))}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs mb-1">Avg Influence</div>
              <div className="text-xl font-bold text-cyan-400">
                {(influencers.reduce((sum, i) => sum + i.influenceScore, 0) / influencers.length).toFixed(1)}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs mb-1">Bull/Bear</div>
              <div className={`text-xl font-bold ${positionCounts.bullish > positionCounts.bearish ? 'text-green-400' : 'text-red-400'}`}>
                {positionCounts.bullish}:{positionCounts.bearish}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-xs mb-1">Posts Today</div>
              <div className="text-xl font-bold">{influencers.reduce((sum, i) => sum + i.postsToday, 0)}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Recent posts from top influencers about ${ticker}</p>
          <div className="space-y-3">
            {sortedInfluencers.flatMap(inf =>
              inf.recentPosts.map((post, idx) => ({
                ...post,
                author: inf.name,
                username: inf.username,
                position: inf.position,
              }))
            ).sort((a, b) => {
              const timeOrder = { '30m ago': 0, '1h ago': 1, '2h ago': 2, '3h ago': 3, '4h ago': 4, '5h ago': 5, '6h ago': 6, '8h ago': 8, '12h ago': 12 };
              return (timeOrder[a.time] || 24) - (timeOrder[b.time] || 24);
            }).map((post, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{post.author}</span>
                    <span className="text-slate-500 text-sm">{post.username}</span>
                    <PositionBadge position={post.position} />
                  </div>
                  <span className="text-slate-500 text-sm">{post.time}</span>
                </div>
                <p className="text-slate-300">{post.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Repeat2 className="w-3 h-3" /> {post.retweets} RTs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'peers' && (
        <div>
          <p className="text-sm text-slate-400 mb-4">Top influencer comparison across EV sector peers</p>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Top Voice</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Followers</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Position</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Influence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {peerInfluencers.map(peer => (
                  <tr key={peer.ticker} className={`hover:bg-slate-700/50 ${peer.ticker === ticker ? 'bg-cyan-900/20' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${peer.ticker === ticker ? 'text-cyan-400' : ''}`}>
                        {peer.ticker}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{peer.topVoice}</td>
                    <td className="px-4 py-3 text-right">{peer.followers}</td>
                    <td className="px-4 py-3 text-center">
                      <PositionBadge position={peer.position} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-400">{peer.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Most Bullish</div>
              <div className="font-bold text-green-400">TSLA, RIVN, NIO</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Most Active</div>
              <div className="font-bold">TSLA (45 posts/day)</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-slate-400 text-xs">Highest Influence</div>
              <div className="font-bold text-cyan-400">TSLA (9.5)</div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis */}
      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <h4 className="font-medium text-cyan-200 mb-2">Analysis</h4>
        <p className="text-sm text-cyan-200/80">
          <strong>Top influencer:</strong> {sortedInfluencers[0].name} ({sortedInfluencers[0].username}) with {sortedInfluencers[0].influenceScore}/10 influence score
          and {formatFollowers(sortedInfluencers[0].followers)} followers.
          <strong> Sentiment:</strong> {positionCounts.bullish > positionCounts.bearish ? 'Bullish bias' : positionCounts.bullish < positionCounts.bearish ? 'Bearish bias' : 'Mixed'}
          ({positionCounts.bullish} bull vs {positionCounts.bearish} bear).
          <strong> Combined reach:</strong> {formatFollowers(influencers.reduce((sum, i) => sum + i.followers, 0))}.
        </p>
      </div>

      {/* Metric Explanation */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
        <strong>Influence Score (1-10):</strong> Calculated from follower count (30%), engagement rate (30%),
        relevance to ticker (20%), and posting frequency (20%). Higher scores indicate more impactful voices in the conversation.
      </div>
    </div>
  );
}
```

## How Influence Score is Calculated

| Factor | Weight | Description |
|--------|--------|-------------|
| Follower count | 30% | Log-normalized follower count (1M+ = 10) |
| Engagement rate | 30% | Avg retweets + replies per post |
| Relevance | 20% | % of posts about this specific ticker |
| Frequency | 20% | Posts per day about the ticker |

### Score Scale

| Score | Meaning |
|-------|---------|
| 9-10 | Elite - major market mover |
| 7-8 | High influence - widely followed |
| 5-6 | Moderate - respected voice |
| 3-4 | Emerging - growing following |
| 1-2 | Niche - small but engaged |

## Position Detection

Claude analyzes tweet text to determine position:

**Bullish indicators:**
- Keywords: "long", "buy", "bullish", "undervalued", "moon", "accumulating"
- Emojis: rocket, green charts, money
- Price targets above current

**Bearish indicators:**
- Keywords: "short", "sell", "bearish", "overvalued", "crash", "bubble"
- Emojis: red charts, warning
- Price targets below current

**Neutral indicators:**
- Balanced analysis, waiting for data
- No clear directional bias

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Create a **React artifact** (not text/markdown)
2. Replace ALL sample data with real data from XPOZ MCP
3. **NO SEARCH BOX** - Do not add any ticker search input UI
4. **LOCAL TIME** - Set `generatedAtHour` to user's current local hour (0-23)
5. **EXPANDED QUERIES** - Use company names in all queries (TSLA OR Tesla, not just TSLA)

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any search UI** - Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - For EVERY ticker, include the company name:
   - `$TSLA OR #TSLA OR TSLA OR Tesla` (not just `$TSLA`)
   - Without expansion you'll get ~20 mentions instead of ~150+!

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC. Ask the user their timezone if unsure.

4. **DOWNLOAD FULL CSV** - Use `dataDumpExportOperationId` to get ALL tweets, not just first 100.

### Data Collection Steps

1. **Expand the query** for the ticker (e.g., TSLA → `$TSLA OR #TSLA OR TSLA OR Tesla`)

2. **Fetch posts** using expanded query:
   ```
   getTwitterPostsByKeywords({ query: "EXPANDED_QUERY", startDate: 2_DAYS_AGO, endDate: TODAY })
   ```

3. **Get user profiles** for unique authors via `getTwitterUserByUsername`

4. **Calculate influence scores** using the weighted formula

5. **Detect positions** by analyzing tweet sentiment keywords

6. **Identify category peers** (e.g., TSLA → EVs: RIVN, LCID, NIO, XPEV)

### Replace These Values in Template

| Variable | Value |
|----------|-------|
| `ticker` | The ticker being analyzed (e.g., 'TSLA') |
| `generatedAtHour` | User's current local hour (0-23) |
| `influencers` | Real influencer data from XPOZ MCP |
| `peerInfluencers` | Top influencer for each peer ticker |
