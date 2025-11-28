---
name: quality-index
version: 2025-11-28
description: Assess the authenticity and quality of social mentions for an asset. Detects bot activity, spam campaigns, and genuine engagement. Use when validating signals, filtering noise, or assessing mention credibility.
---

# Quality Index Skill

## Overview

This skill evaluates the quality and authenticity of social media mentions, helping distinguish genuine sentiment from manipulation or noise with category peer comparison.

## When to Use

Activate this skill when the user asks about:
- "Is [TICKER] buzz real or bots?"
- "Quality check for [ASSET] mentions"
- "Validate sentiment for [STOCK]"
- "Are [CRYPTO] mentions authentic?"
- "Filter noise on [TICKER]"

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

### Step 1: Get Mentions Data
```
Use getTwitterPostsByKeywords with EXPANDED query:
- query: "$TICKER OR #TICKER OR TICKER OR CompanyName" (see expansion table above)
- fields: ["text", "authorUsername", "createdAt", "retweetCount"]
```

### Step 2: Get Author Details
```
For each unique author, use getTwitterUserByUsername:
- fields: ["followersCount", "followingCount", "createdAt", "verified", "tweetCount"]
```

### Step 3: Quality Analysis
Analyze each mention for:
- **Account Age**: Flag accounts < 30 days old
- **Follower Ratio**: followersCount / followingCount
- **Content Originality**: Detect duplicate/templated posts
- **Engagement Pattern**: Natural vs coordinated timing
- **Verified Status**: Weight verified accounts higher

### Step 4: Aggregate Quality Score
Calculate overall quality based on mention distribution.

## Output Requirements

Always render a **React artifact** with:
1. **Ticker input field** at the top
2. **3 tabs**: Quality Overview | Account Analysis | Category Comparison
3. Quality score gauge
4. Authenticity breakdown
5. Bot detection metrics
6. Category peer quality comparison

## Category Mapping

| Category | Tickers | Typical Quality |
|----------|---------|----------------|
| EV | TSLA, RIVN, LCID, NIO, XPEV | Medium-High |
| Big Tech | AAPL, MSFT, GOOGL, META, AMZN | High |
| AI/Semiconductors | NVDA, AMD, INTC, AVGO, QCOM | High |
| Crypto | BTC, ETH, SOL, DOGE, XRP | Low-Medium |
| Meme Stocks | GME, AMC, BBBY, BB, NOK | Low |

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Bot, CheckCircle, AlertTriangle, Users, MessageSquare, Activity, Layers } from 'lucide-react';

export default function QualityIndex() {
  const [activeTab, setActiveTab] = useState('overview');

  // CLAUDE: Replace with actual ticker
  const ticker = 'DOGE';

  // CLAUDE: Replace with user's local hour (0-23)
  const generatedAtHour = 12;

  const qualityMetrics = {
    overallScore: 6.2,
    authenticityScore: 0.58,
    botProbability: 0.28,
    spamScore: 0.15,
    engagementQuality: 0.72,
    sampleSize: 4280,
    timeRange: '24h'
  };

  const breakdown = {
    verified: { count: 234, percentage: 12 },
    organic: { count: 1250, percentage: 65 },
    suspicious: { count: 320, percentage: 17 },
    bot: { count: 115, percentage: 6 }
  };

  const pieData = [
    { name: 'Verified', value: breakdown.verified.percentage, color: '#3b82f6' },
    { name: 'Organic', value: breakdown.organic.percentage, color: '#22c55e' },
    { name: 'Suspicious', value: breakdown.suspicious.percentage, color: '#f59e0b' },
    { name: 'Bot', value: breakdown.bot.percentage, color: '#ef4444' }
  ];

  const qualityIndicators = [
    { name: 'Account Age Diversity', score: 0.72, status: 'good', baseline: 0.75 },
    { name: 'Engagement Pattern', score: 0.65, status: 'good', baseline: 0.70 },
    { name: 'Content Originality', score: 0.45, status: 'warning', baseline: 0.65 },
    { name: 'Reply Depth', score: 0.58, status: 'good', baseline: 0.55 },
    { name: 'Timing Distribution', score: 0.38, status: 'warning', baseline: 0.60 },
    { name: 'Sentiment Coherence', score: 0.62, status: 'good', baseline: 0.60 }
  ];

  // Category comparison data
  const category = 'Crypto';
  const categoryPeers = [
    { ticker: 'DOGE', qualityScore: 6.2, botProbability: 28, isTarget: true },
    { ticker: 'BTC', qualityScore: 7.8, botProbability: 15, isTarget: false },
    { ticker: 'ETH', qualityScore: 7.5, botProbability: 18, isTarget: false },
    { ticker: 'SOL', qualityScore: 6.5, botProbability: 25, isTarget: false },
    { ticker: 'XRP', qualityScore: 5.8, botProbability: 32, isTarget: false }
  ];

  const categoryAvg = {
    qualityScore: 6.8,
    botProbability: 23
  };

  const redFlags = [
    'Coordinated posting detected (3:00 AM UTC spike)',
    'High % of accounts < 30 days old (23%)',
    '15% of mentions contain identical phrases'
  ];

  const greenFlags = [
    'Strong engagement from verified accounts',
    'Natural reply chains present',
    'Geographic distribution normal'
  ];

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    if (status === 'good') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const tabs = [
    { id: 'overview', label: 'Quality Overview', icon: Shield },
    { id: 'accounts', label: 'Account Analysis', icon: Users },
    { id: 'comparison', label: 'Category Comparison', icon: Layers }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Quality Index</h1>
            <p className="text-slate-400 text-sm">Mention authenticity analysis • {qualityMetrics.sampleSize.toLocaleString()} tweets • {qualityMetrics.timeRange} • Generated at {generatedAtHour}:00</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getScoreColor(qualityMetrics.overallScore)}`}>
            {qualityMetrics.overallScore}
          </div>
          <div className="text-sm text-slate-400">Quality Score /10</div>
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
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{(qualityMetrics.authenticityScore * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-400 mt-1">Authenticity</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{(qualityMetrics.botProbability * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-400 mt-1">Bot Probability</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{(qualityMetrics.spamScore * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-400 mt-1">Spam Score</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{(qualityMetrics.engagementQuality * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-400 mt-1">Engagement Quality</div>
            </div>
          </div>

          {/* Mention Breakdown Pie */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Mention Source Breakdown</h3>
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
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name} {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Indicators */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Quality Indicators vs Baseline</h3>
              <div className="space-y-2">
                {qualityIndicators.map((ind) => (
                  <div key={ind.name} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(ind.status)}`} />
                      <span className="text-xs">{ind.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${ind.score >= 0.6 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {(ind.score * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-slate-500">
                        ({(ind.baseline * 100).toFixed(0)}% avg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flags Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags
              </h3>
              <ul className="space-y-2">
                {redFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Green Flags
              </h3>
              <ul className="space-y-2">
                {greenFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Account Source Bars */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Account Classification</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Verified Accounts</span>
                    <span className="text-blue-400">{breakdown.verified.percentage}% ({breakdown.verified.count})</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${breakdown.verified.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Organic Users</span>
                    <span className="text-green-400">{breakdown.organic.percentage}% ({breakdown.organic.count})</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${breakdown.organic.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Suspicious Accounts</span>
                    <span className="text-yellow-400">{breakdown.suspicious.percentage}% ({breakdown.suspicious.count})</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${breakdown.suspicious.percentage}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Likely Bots</span>
                    <span className="text-red-400">{breakdown.bot.percentage}% ({breakdown.bot.count})</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${breakdown.bot.percentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Detection Criteria */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Bot Detection Criteria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-xs text-slate-400 mb-1">Account Age &lt; 30 days</div>
                <div className="text-lg font-bold text-red-400">23%</div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-xs text-slate-400 mb-1">Follower Ratio &lt; 0.1</div>
                <div className="text-lg font-bold text-yellow-400">15%</div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-xs text-slate-400 mb-1">Duplicate Content</div>
                <div className="text-lg font-bold text-orange-400">12%</div>
              </div>
              <div className="p-3 bg-slate-700 rounded">
                <div className="text-xs text-slate-400 mb-1">Coordinated Timing</div>
                <div className="text-lg font-bold text-red-400">8%</div>
              </div>
            </div>
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
                <p className="text-slate-400 text-sm">Comparing {ticker} quality to peers</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Category Avg Quality</div>
                <div className={`text-xl font-bold ${getScoreColor(categoryAvg.qualityScore)}`}>
                  {categoryAvg.qualityScore}/10
                </div>
              </div>
            </div>
          </div>

          {/* Peer Comparison Bar Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Quality Score by Ticker</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPeers} layout="vertical">
                  <XAxis type="number" domain={[0, 10]} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="ticker" stroke="#64748b" fontSize={12} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="qualityScore" name="Quality" radius={[0, 4, 4, 0]}>
                    {categoryPeers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isTarget ? '#3b82f6' : entry.qualityScore >= 7 ? '#22c55e' : entry.qualityScore >= 5 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peer Cards */}
          <div className="grid grid-cols-5 gap-3">
            {categoryPeers.map((peer) => (
              <div
                key={peer.ticker}
                className={`bg-slate-800 rounded-lg p-3 text-center ${peer.isTarget ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-lg font-bold ${peer.isTarget ? 'text-blue-400' : 'text-slate-300'}`}>
                  {peer.ticker}
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(peer.qualityScore)}`}>
                  {peer.qualityScore}
                </div>
                <div className="text-xs text-slate-400 mt-1">Quality</div>
                <div className="text-xs text-red-400 mt-1">{peer.botProbability}% bots</div>
              </div>
            ))}
          </div>

          {/* vs Category Average */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">{ticker} vs Category Average</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Quality Score</div>
                <div className={`text-xl font-bold ${qualityMetrics.overallScore < categoryAvg.qualityScore ? 'text-red-400' : 'text-green-400'}`}>
                  {qualityMetrics.overallScore < categoryAvg.qualityScore ? '' : '+'}{(qualityMetrics.overallScore - categoryAvg.qualityScore).toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">vs {categoryAvg.qualityScore} avg</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded">
                <div className="text-sm text-slate-400 mb-1">Bot Probability</div>
                <div className={`text-xl font-bold ${qualityMetrics.botProbability * 100 > categoryAvg.botProbability ? 'text-red-400' : 'text-green-400'}`}>
                  {qualityMetrics.botProbability * 100 > categoryAvg.botProbability ? '+' : ''}{(qualityMetrics.botProbability * 100 - categoryAvg.botProbability).toFixed(0)}%
                </div>
                <div className="text-xs text-slate-500">vs {categoryAvg.botProbability}% avg</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>Quality Assessment:</strong> {ticker} mentions show {qualityMetrics.overallScore >= 7 ? 'high' : qualityMetrics.overallScore >= 5 ? 'moderate' : 'low'} quality ({qualityMetrics.overallScore}/10).
          Bot probability: {(qualityMetrics.botProbability * 100).toFixed(0)}% ({(qualityMetrics.botProbability * 100) > categoryAvg.botProbability ? 'above' : 'below'} category avg).
          {qualityMetrics.authenticityScore < 0.6 ? ' Recommend filtering mentions before relying on sentiment.' : ' Signal quality acceptable for analysis.'}
          Rank #{categoryPeers.findIndex(p => p.ticker === ticker) + 1} of {categoryPeers.length} in {category} category.
        </p>
      </div>
    </div>
  );
}
```

## Metric Explanations

### Quality Score (0-10)
Composite authenticity assessment:
- **8-10**: High quality - Trust sentiment signals
- **6-8**: Moderate quality - Use with caution
- **4-6**: Low quality - High noise, filter recommended
- **0-4**: Very low quality - Significant manipulation risk

### Bot Probability
Likelihood that mentions come from automated accounts:
- Calculated from account age, follower ratio, posting patterns
- Higher = more manipulation risk

### Account Classification
- **Verified**: Twitter blue checkmark accounts
- **Organic**: Real users with normal behavior patterns
- **Suspicious**: Accounts with some bot-like characteristics
- **Bot**: High-confidence automated accounts

### Quality Indicators
- **Account Age Diversity**: Variety in account ages (low = coordinated)
- **Engagement Pattern**: Natural vs artificial engagement timing
- **Content Originality**: Unique vs copy-paste content
- **Reply Depth**: Genuine conversations vs single-level spam
- **Timing Distribution**: Natural posting times vs coordinated bursts
- **Sentiment Coherence**: Consistent vs flip-flopping sentiment

## Data Format

```typescript
interface QualityData {
  ticker: string;
  qualityMetrics: {
    overallScore: number;
    authenticityScore: number;
    botProbability: number;
    spamScore: number;
    engagementQuality: number;
    sampleSize: number;
    timeRange: string;
  };
  breakdown: {
    verified: { count: number; percentage: number };
    organic: { count: number; percentage: number };
    suspicious: { count: number; percentage: number };
    bot: { count: number; percentage: number };
  };
  qualityIndicators: Array<{
    name: string;
    score: number;
    status: 'good' | 'warning' | 'bad';
    baseline: number;
  }>;
  categoryPeers: Array<{
    ticker: string;
    qualityScore: number;
    botProbability: number;
    isTarget: boolean;
  }>;
  categoryAvg: {
    qualityScore: number;
    botProbability: number;
  };
  redFlags: string[];
  greenFlags: string[];
}
```

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/quality-index.jsx`
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
2. Use XPOZ MCP to fetch mentions with expanded query
3. Fetch author details for each unique author
4. Analyze account characteristics (age, followers, patterns)
5. Classify accounts (verified/organic/suspicious/bot)
6. Calculate quality indicators against baselines
7. Map ticker to category and fetch peer quality scores
8. Identify red/green flags
9. Render React artifact with all 3 tabs populated
10. Provide quality assessment with recommendation
11. Suggest Volume Anomaly check if quality is low
