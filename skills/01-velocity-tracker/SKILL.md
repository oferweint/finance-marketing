---
name: velocity-tracker
description: Track normalized social discussion velocity for any stock/crypto. Shows velocity relative to hourly baseline (last 3 days), with category comparison tab showing selected asset vs 4 category peers. Uses XPOZ MCP for real-time Twitter data. Activate when user asks about velocity, buzz, social activity, or mentions for any ticker.
---

# Velocity Tracker Skill

## Overview

This skill analyzes **normalized** social media discussion velocity for any financial asset. Velocity is calculated relative to the expected baseline for each hour (based on 3-day historical average), eliminating time-of-day bias.

## When to Use

Activate this skill when the user asks about:
- "What's the velocity/buzz for [TICKER]?"
- "Is [ASSET] getting more or less attention?"
- "Track mentions for [STOCK]"
- "Social activity for [CRYPTO]"
- "Compare [TICKER] to peers"
- "Show me velocity dashboard for [SYMBOL]"

## Data Flow

### ⚠️ CRITICAL: Query Expansion (MUST DO FIRST!)

Before fetching Twitter data for ANY ticker, you MUST expand the query to include the company name. **Searching only for ticker symbols ($GOOG, #GOOG) will miss 80%+ of mentions!**

**Step 0: Look up the company name dynamically**
- Search: `"{TICKER} stock company name"`
- Build an expanded query with BOTH ticker variants AND company name

**Query Expansion Examples:**
| Ticker | Expanded Query |
|--------|----------------|
| GOOG/GOOGL | `$GOOG OR #GOOG OR GOOG OR $GOOGL OR #GOOGL OR GOOGL OR Google OR Alphabet` |
| NVDA | `$NVDA OR #NVDA OR NVDA OR NVIDIA` |
| TSLA | `$TSLA OR #TSLA OR TSLA OR Tesla` |
| AAPL | `$AAPL OR #AAPL OR AAPL OR Apple` |
| MSFT | `$MSFT OR #MSFT OR MSFT OR Microsoft` |
| META | `$META OR #META OR META OR Facebook OR "Meta Platforms"` |
| AMZN | `$AMZN OR #AMZN OR AMZN OR Amazon` |

**Without query expansion:**
- GOOG: ~10-20 mentions/day ❌
- With expansion: ~150+ mentions/day ✅

### Step 1: Fetch Real Data from XPOZ MCP

Use these MCP tools to get real Twitter data. **ALWAYS use the expanded query from Step 0!**

```javascript
// Get posts for the ticker (last 24 hours) - USE EXPANDED QUERY!
const posts = await mcp_xpoz.getTwitterPostsByKeywords({
  query: "$TSLA OR #TSLA OR TSLA OR Tesla", // EXPANDED query, not just $TSLA
  startDate: "YYYY-MM-DD", // 24 hours ago
  endDate: "YYYY-MM-DD",   // today
  fields: ["id", "text", "createdAt", "authorUsername"]
});

// Get baseline data (last 3 days for hourly averages) - SAME EXPANDED QUERY!
const baselinePosts = await mcp_xpoz.getTwitterPostsByKeywords({
  query: "$TSLA OR #TSLA OR TSLA OR Tesla", // MUST match today's query exactly!
  startDate: "YYYY-MM-DD", // 3 days ago
  endDate: "YYYY-MM-DD",   // today
  fields: ["id", "createdAt"]
});
```

### Step 2: Calculate Hourly Baseline (CRITICAL)

For EACH hour (0-23), calculate the average mentions across the last 3 days:

```javascript
// Group posts by hour-of-day across 3 days
// baseline[hour] = average mentions for that hour over 3 days
const calculateBaseline = (posts) => {
  // Initialize buckets for each hour (0-23)
  const hourlyBuckets = Array.from({ length: 24 }, () => []);

  posts.forEach(post => {
    const hour = new Date(post.createdAt).getUTCHours(); // Use UTC for consistency
    hourlyBuckets[hour].push(post);
  });

  // Return avg for each hour: total posts in that hour / 3 days
  return hourlyBuckets.map(bucket => bucket.length / 3);
};

// Example: If hour 14:00 had 45, 60, 75 mentions over 3 days:
// baseline[14] = (45 + 60 + 75) / 3 = 60 mentions expected at 14:00
```

### Step 3: Calculate Normalized Velocity

```javascript
// For each hour today, compare actual mentions to baseline for that hour
// Scale: 5.0 = 1x baseline (normal), 7.5 = 2x baseline, 10.0 = 3x+ baseline
const normalizeVelocity = (actual, baseline) => {
  const ratio = actual / Math.max(baseline, 1);
  // Formula: velocity = 2.5 + (ratio * 2.5), clamped to 0-10
  return Math.min(10, Math.max(0, 2.5 + (ratio * 2.5)));
};

// To convert velocity back to ratio: ratio = (velocity - 2.5) / 2.5
// Examples:
//   velocity 5.0 → ratio 1.0x (normal)
//   velocity 7.5 → ratio 2.0x (2x normal)
//   velocity 10.0 → ratio 3.0x (3x normal)
```

## Category Mapping

Use this mapping for peer comparison (or infer from context):

| Category | Tickers |
|----------|---------|
| EV / Electric Vehicles | TSLA, RIVN, LCID, NIO, XPEV |
| Big Tech / FAANG | AAPL, GOOGL, MSFT, AMZN, META |
| AI / Semiconductors | NVDA, AMD, INTC, AVGO, QCOM |
| Crypto (BTC ecosystem) | BTC, MSTR, COIN, MARA, RIOT |
| Crypto (ETH ecosystem) | ETH, MATIC, ARB, OP, LDO |
| Meme Stocks | GME, AMC, BBBY, BB, NOK |
| Fintech | SQ, PYPL, SOFI, HOOD, AFRM |
| Biotech | MRNA, BNTX, PFE, JNJ, ABBV |
| Airlines | UAL, DAL, AAL, LUV, JBLU |
| Retail | WMT, TGT, COST, AMZN, HD |
| Energy | XOM, CVX, OXY, SLB, COP |
| Banks | JPM, BAC, GS, MS, C |

## React Artifact Template

Generate this component with real data from XPOZ MCP:

```jsx
import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

export default function VelocityTracker() {
  const [activeTab, setActiveTab] = useState('detail');

  // CLAUDE: Set this to the ticker you're analyzing
  const ticker = 'TSLA'; // Replace with actual ticker

  // Current hour (0-23) in USER'S LOCAL TIMEZONE - used to filter out future hours
  // CLAUDE: Set this to the user's current local hour (ask if unsure)
  const generatedAtHour = 12; // Replace with user's current local hour (0-23)

  // === REPLACE WITH REAL DATA FROM XPOZ MCP ===
  // Category is determined by ticker (use mapping from skill instructions)
  const category = 'EV / Electric Vehicles'; // Auto-detect from ticker

  // FULL hourly data for 24 hours (CLAUDE: Replace with real XPOZ data)
  // Each entry needs: actual mentions, baseline (3-day avg for that hour), and calculated velocity
  const allHourlyData = [
    { time: '00:00', hour: 0, actual: 45, baseline: 40, velocity: 5.6 },
    { time: '01:00', hour: 1, actual: 32, baseline: 35, velocity: 4.8 },
    { time: '02:00', hour: 2, actual: 28, baseline: 30, velocity: 4.7 },
    { time: '03:00', hour: 3, actual: 22, baseline: 25, velocity: 4.5 },
    { time: '04:00', hour: 4, actual: 25, baseline: 28, velocity: 4.6 },
    { time: '05:00', hour: 5, actual: 35, baseline: 32, velocity: 5.2 },
    { time: '06:00', hour: 6, actual: 58, baseline: 45, velocity: 5.7 },
    { time: '07:00', hour: 7, actual: 85, baseline: 65, velocity: 5.8 },
    { time: '08:00', hour: 8, actual: 120, baseline: 90, velocity: 5.8 },
    { time: '09:00', hour: 9, actual: 180, baseline: 110, velocity: 6.6 },
    { time: '10:00', hour: 10, actual: 210, baseline: 125, velocity: 6.7 },
    { time: '11:00', hour: 11, actual: 195, baseline: 130, velocity: 6.3 },
    { time: '12:00', hour: 12, actual: 175, baseline: 120, velocity: 6.1 },
    { time: '13:00', hour: 13, actual: 185, baseline: 115, velocity: 6.5 },
    { time: '14:00', hour: 14, actual: 220, baseline: 120, velocity: 7.1 },
    { time: '15:00', hour: 15, actual: 280, baseline: 125, velocity: 8.1 },
    { time: '16:00', hour: 16, actual: 310, baseline: 130, velocity: 8.5 },
    { time: '17:00', hour: 17, actual: 290, baseline: 125, velocity: 8.3 },
    { time: '18:00', hour: 18, actual: 265, baseline: 115, velocity: 8.3 },
    { time: '19:00', hour: 19, actual: 240, baseline: 105, velocity: 8.2 },
    { time: '20:00', hour: 20, actual: 210, baseline: 95, velocity: 8.0 },
    { time: '21:00', hour: 21, actual: 175, baseline: 80, velocity: 8.0 },
    { time: '22:00', hour: 22, actual: 120, baseline: 60, velocity: 7.5 },
    { time: '23:00', hour: 23, actual: 75, baseline: 50, velocity: 6.3 },
  ];

  // CRITICAL: Filter to only show hours up to the generated time (no future hours!)
  const hourlyData = allHourlyData.filter(d => d.hour <= generatedAtHour);

  // Current stats - ALWAYS derive from the most recent hour's data
  const latestHourData = hourlyData[hourlyData.length - 1];
  const currentVelocity = latestHourData.velocity;
  const currentActual = latestHourData.actual;
  const currentBaseline = latestHourData.baseline;
  const baselineRatio = (currentActual / currentBaseline);
  const trend = 'accelerating'; // accelerating, decelerating, stable (calculate from last 3 hours)
  const signal = baselineRatio > 2 ? 'VERY_HIGH' : baselineRatio > 1.5 ? 'HIGH_ACTIVITY' : baselineRatio > 1.2 ? 'ELEVATED' : baselineRatio > 0.8 ? 'NORMAL' : 'LOW';

  // Category peers for comparison (from XPOZ MCP)
  const categoryPeers = [
    { ticker: 'TSLA', velocity: 8.5, trend: 'accelerating', mentions: 310, color: '#3b82f6' },
    { ticker: 'RIVN', velocity: 6.2, trend: 'stable', mentions: 145, color: '#10b981' },
    { ticker: 'LCID', velocity: 4.8, trend: 'decelerating', mentions: 89, color: '#f59e0b' },
    { ticker: 'NIO', velocity: 5.1, trend: 'accelerating', mentions: 102, color: '#ef4444' },
    { ticker: 'XPEV', velocity: 3.2, trend: 'stable', mentions: 45, color: '#8b5cf6' },
  ];

  // Comparison data for line chart (already filtered by hourlyData)
  // CLAUDE: Replace peer velocity values with real XPOZ data for each ticker
  const comparisonData = hourlyData.map((h, i) => ({
    time: h.time,
    TSLA: h.velocity,
    RIVN: 4.5 + Math.sin(i / 4) * 1.5,  // Replace with real data
    LCID: 4.0 + Math.cos(i / 3) * 0.8,  // Replace with real data
    NIO: 4.2 + Math.sin(i / 5) * 1.2,   // Replace with real data
    XPEV: 3.0 + Math.cos(i / 4) * 0.5,  // Replace with real data
  }));
  // === END REPLACE ===

  const getSignalColor = (signal) => {
    const colors = {
      'VERY_HIGH': 'bg-red-500',
      'HIGH_ACTIVITY': 'bg-orange-500',
      'ELEVATED': 'bg-yellow-500',
      'NORMAL': 'bg-green-500',
      'LOW': 'bg-blue-500'
    };
    return colors[signal] || 'bg-gray-500';
  };

  const TrendIcon = trend === 'accelerating' ? TrendingUp : trend === 'decelerating' ? TrendingDown : Minus;
  const trendColor = trend === 'accelerating' ? 'text-green-400' : trend === 'decelerating' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-400" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{ticker} Velocity</h1>
              <span className="text-slate-500 text-sm">({category})</span>
            </div>
            <p className="text-slate-400 text-sm">Normalized vs hourly baseline (3-day avg)</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-400">{currentVelocity.toFixed(1)}</div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getSignalColor(signal)}`}>
            {signal.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('detail')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'detail' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Detail View
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'compare' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Category Comparison
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'detail' ? (
        <>
          {/* Velocity Chart */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Normalized Velocity (Today) — Showing data through {hourlyData[hourlyData.length - 1]?.time || 'now'}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 10]}
                    tickFormatter={(v) => v === 5 ? '1x' : v === 7.5 ? '2x' : v === 10 ? '3x+' : ''}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value, name, props) => {
                      if (name === 'velocity') {
                        // Correct formula: ratio = (velocity - 2.5) / 2.5
                        // velocity 5.0 = 1x baseline, 7.5 = 2x baseline, 10.0 = 3x baseline
                        const ratio = ((value - 2.5) / 2.5).toFixed(1);
                        const actual = props.payload.actual;
                        const baseline = props.payload.baseline;
                        return [`${actual} mentions (${ratio}x baseline of ${baseline})`, 'Activity'];
                      }
                      return [value, name];
                    }}
                  />
                  <Area type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} fill="url(#velocityGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Trend</div>
              <div className="flex items-center gap-2">
                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                <span className="font-medium capitalize">{trend}</span>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">vs Baseline</div>
              <div className={`text-xl font-bold ${baselineRatio > 1.5 ? 'text-orange-400' : baselineRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
                {baselineRatio >= 1 ? '+' : ''}{((baselineRatio - 1) * 100).toFixed(0)}%
              </div>
              <div className="text-slate-500 text-xs">{baselineRatio >= 1 ? 'above' : 'below'} hourly norm</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Latest Rate ({latestHourData?.time})</div>
              <div className="text-xl font-bold">{currentActual}</div>
              <div className="text-slate-500 text-xs">mentions/hr</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">24h Total</div>
              <div className="text-xl font-bold text-slate-300">{hourlyData.reduce((sum, d) => sum + d.actual, 0)}</div>
              <div className="text-slate-500 text-xs">total mentions</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Category Ranking */}
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">{category} — Velocity Ranking</h3>
            <div className="space-y-3">
              {categoryPeers.sort((a, b) => b.velocity - a.velocity).map((peer, idx) => (
                <div key={peer.ticker} className="flex items-center gap-4">
                  <span className="w-8 text-slate-500 font-medium">#{idx + 1}</span>
                  <span className={`w-16 font-bold ${peer.ticker === ticker ? 'text-blue-400' : 'text-white'}`}>
                    {peer.ticker}
                  </span>
                  <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(peer.velocity / 10) * 100}%`,
                        backgroundColor: peer.color
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold">{peer.velocity.toFixed(1)}</span>
                  <span className="w-20 text-right text-slate-400 text-sm">{peer.mentions}/hr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Line Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">24h Velocity Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  {categoryPeers.map(peer => (
                    <Line
                      key={peer.ticker}
                      type="monotone"
                      dataKey={peer.ticker}
                      stroke={peer.color}
                      strokeWidth={peer.ticker === ticker ? 3 : 1.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Explanation Footer */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>How Velocity Works:</strong> Score is normalized against the 3-day hourly baseline.
          A score of 5.0 = normal activity for this hour. 7.5 = 2x normal. 10 = 3x+ normal.
          This removes time-of-day bias (e.g., naturally lower activity at night).
        </p>
      </div>

      {/* Data Attribution Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Real-time social data powered by <span className="text-blue-400 font-medium">XPOZ MCP</span>
        </p>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface VelocityData {
  ticker: string;
  category: string;
  currentVelocity: number;        // Normalized 0-10 scale
  currentActual: number;          // Raw mentions/hr right now
  currentBaseline: number;        // Expected mentions/hr for this hour
  trend: 'accelerating' | 'decelerating' | 'stable';
  signal: 'LOW' | 'NORMAL' | 'ELEVATED' | 'HIGH_ACTIVITY' | 'VERY_HIGH';
  hourlyData: Array<{
    time: string;                 // "HH:00" format
    actual: number;               // Raw mention count
    baseline: number;             // 3-day avg for this hour
    velocity: number;             // Normalized score
  }>;
  categoryPeers: Array<{
    ticker: string;
    velocity: number;
    trend: string;
    mentions: number;
    color: string;
  }>;
}
```

## Velocity Score Scale

| Score | Meaning | Baseline Multiple |
|-------|---------|-------------------|
| 0-2.5 | Very Low | 0-0.5x baseline |
| 2.5-5 | Below/Normal | 0.5-1x baseline |
| 5.0 | Normal | 1x baseline (expected) |
| 5-7.5 | Elevated | 1-2x baseline |
| 7.5-10 | High/Very High | 2-3x+ baseline |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Create a React artifact (not text/markdown)
2. Replace ALL sample data with real data from XPOZ MCP
3. **NO SEARCH BOX** - Do not add any search input UI
4. **LOCAL TIME** - Set `generatedAtHour` to user's current hour
5. **EXPANDED QUERY** - Include company name in all queries

## Instructions for Claude

### ⚠️ CRITICAL REQUIREMENTS (MUST FOLLOW!)

1. **DO NOT add a search box or any search UI** - The template has no search functionality. Artifacts cannot trigger Claude actions.

2. **USE EXPANDED QUERIES** - Before fetching data, expand the ticker to include company name:
   - GOOG → `$GOOG OR #GOOG OR GOOG OR $GOOGL OR #GOOGL OR GOOGL OR Google OR Alphabet`
   - Without expansion: ~20 mentions. With expansion: ~150+ mentions!

3. **USE LOCAL TIME** - Set `generatedAtHour` to the user's current local hour (0-23), NOT UTC. Ask the user their timezone if unsure.

### Data Collection Steps

1. **Expand the query** (see examples in "Query Expansion" section above)

2. **Fetch TODAY's data** using expanded query:
   ```
   getTwitterPostsByKeywords({ query: "EXPANDED_QUERY", startDate: TODAY, endDate: TODAY })
   ```

3. **Fetch BASELINE data** (last 3 days) using SAME expanded query:
   ```
   getTwitterPostsByKeywords({ query: "EXPANDED_QUERY", startDate: 3_DAYS_AGO, endDate: TODAY })
   ```

4. **Download full CSV** - Use `dataDumpExportOperationId` to get ALL tweets, not just first 100

5. **Calculate hourly baselines** - For each hour (0-23): `baseline[hour] = totalPostsInThatHour / 3`

6. **Calculate velocity** - For each hour: `velocity = 2.5 + (actual/baseline * 2.5)`, clamped 0-10

### Replace These Values in Template

| Variable | Value |
|----------|-------|
| `ticker` | The ticker being analyzed (e.g., 'GOOGL') |
| `generatedAtHour` | User's current local hour (0-23) |
| `category` | Detected from category mapping |
| `allHourlyData` | Real hourly data array |
| `categoryPeers` | Real peer data for all 5 peers |

### Data Consistency Rules

- Header velocity = `latestHourData.velocity` (auto-calculated)
- `currentVelocity`, `currentActual`, `currentBaseline` all derive from `latestHourData` - do NOT set manually
- Graph stops at `generatedAtHour` (via filter)
- "above/below" text is now dynamic based on `baselineRatio`

### For Different Tickers

Generate a completely NEW artifact with fresh data. Each artifact is standalone.
