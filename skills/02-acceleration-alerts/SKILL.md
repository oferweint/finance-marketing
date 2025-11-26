---
name: acceleration-alerts
description: Detect velocity spikes and acceleration events for any stock/crypto. Shows spike magnitude, timing, triggers, and historical context with normalized baselines. Uses XPOZ MCP for real-time Twitter data. Activate when monitoring for breakout signals, sudden attention surges, or velocity anomalies.
---

# Acceleration Alerts Skill

## Overview

This skill detects and visualizes sudden changes in social discussion velocity, identifying potential breakout moments before they become mainstream. Acceleration is measured relative to hourly baselines (3-day average) to filter out normal time-of-day patterns.

## When to Use

Activate this skill when the user asks about:
- "Alert me to velocity spikes on [TICKER]"
- "Any acceleration events for [ASSET]?"
- "Detect breakouts in [SECTOR]"
- "Sudden attention surge for [CRYPTO]"
- "Social momentum alerts for [STOCK]"
- "Show me spike alerts for [SYMBOL]"

## Data Flow

### Step 1: Fetch Data from XPOZ MCP

```javascript
// Get posts for the ticker (last 24-48 hours for spike detection)
const posts = await mcp_xpoz.getTwitterPostsByKeywords({
  query: "$NVDA OR #NVDA OR NVDA",
  startDate: "YYYY-MM-DD", // 48 hours ago
  endDate: "YYYY-MM-DD",   // today
  fields: ["id", "text", "createdAt", "authorUsername", "retweetCount"]
});

// Get baseline data (last 7 days for robust baseline)
const baselinePosts = await mcp_xpoz.getTwitterPostsByKeywords({
  query: "$NVDA OR #NVDA OR NVDA",
  startDate: "YYYY-MM-DD", // 7 days ago
  endDate: "YYYY-MM-DD",
  fields: ["id", "createdAt"]
});
```

### Step 2: Calculate Acceleration

```javascript
// Detect spikes: compare each hour to its baseline
const detectSpikes = (hourlyData, baselines) => {
  return hourlyData.map((hour, idx) => {
    const baseline = baselines[hour.hourOfDay];
    const ratio = hour.mentions / Math.max(baseline, 1);
    return {
      ...hour,
      baseline,
      ratio,
      isSpike: ratio > 1.5,
      magnitude: ratio,
      severity: ratio > 3 ? 'high' : ratio > 2 ? 'medium' : 'low'
    };
  }).filter(h => h.isSpike);
};
```

## Category Mapping

Use for peer comparison and context:

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

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { AlertTriangle, TrendingUp, Zap, Clock, Search, Bell } from 'lucide-react';

export default function AccelerationAlerts() {
  const [tickerInput, setTickerInput] = useState('NVDA');
  const [ticker, setTicker] = useState('NVDA');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');

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

  // === REPLACE WITH REAL DATA FROM XPOZ MCP ===
  const category = 'AI / Semiconductors';

  const alerts = [
    {
      id: 1,
      timestamp: '2h ago',
      time: '14:00',
      type: 'SPIKE',
      magnitude: 3.2,
      trigger: 'Earnings leak rumor spreading on FinTwit',
      actual: 425,
      baseline: 133,
      velocity_before: 4.2,
      velocity_after: 8.5,
      severity: 'high'
    },
    {
      id: 2,
      timestamp: '6h ago',
      time: '10:00',
      type: 'ACCELERATION',
      magnitude: 1.8,
      trigger: 'Analyst upgrade from Morgan Stanley',
      actual: 198,
      baseline: 110,
      velocity_before: 5.0,
      velocity_after: 6.3,
      severity: 'medium'
    },
    {
      id: 3,
      timestamp: '12h ago',
      time: '04:00',
      type: 'SPIKE',
      magnitude: 2.4,
      trigger: 'Asia market reaction to chip news',
      actual: 72,
      baseline: 30,
      velocity_before: 4.8,
      velocity_after: 7.1,
      severity: 'medium'
    }
  ];

  const timelineData = [
    { time: '00:00', actual: 45, baseline: 42, velocity: 5.2 },
    { time: '02:00', actual: 38, baseline: 35, velocity: 5.2 },
    { time: '04:00', actual: 72, baseline: 30, velocity: 7.1 },
    { time: '06:00', actual: 85, baseline: 55, velocity: 5.9 },
    { time: '08:00', actual: 145, baseline: 95, velocity: 5.8 },
    { time: '10:00', actual: 198, baseline: 110, velocity: 6.3 },
    { time: '12:00', actual: 175, baseline: 125, velocity: 5.6 },
    { time: '14:00', actual: 425, baseline: 133, velocity: 8.5 },
    { time: '16:00', actual: 380, baseline: 140, velocity: 7.9 },
    { time: '18:00', actual: 290, baseline: 120, velocity: 7.2 },
    { time: '20:00', actual: 210, baseline: 95, velocity: 7.0 },
    { time: '22:00', actual: 125, baseline: 65, velocity: 6.4 },
  ];

  // Category peers with their current alert status
  const categoryPeers = [
    { ticker: 'NVDA', alerts: 3, maxMagnitude: 3.2, status: 'critical' },
    { ticker: 'AMD', alerts: 1, maxMagnitude: 1.6, status: 'warning' },
    { ticker: 'INTC', alerts: 0, maxMagnitude: 0, status: 'normal' },
    { ticker: 'AVGO', alerts: 1, maxMagnitude: 2.1, status: 'warning' },
    { ticker: 'QCOM', alerts: 0, maxMagnitude: 0, status: 'normal' },
  ];
  // === END REPLACE ===

  const getSeverityColor = (severity) => {
    const colors = {
      'high': 'border-l-red-500 bg-red-500/10',
      'medium': 'border-l-orange-500 bg-orange-500/10',
      'low': 'border-l-yellow-500 bg-yellow-500/10'
    };
    return colors[severity] || 'border-l-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      'critical': 'text-red-400 bg-red-500/20',
      'warning': 'text-orange-400 bg-orange-500/20',
      'normal': 'text-green-400 bg-green-500/20'
    };
    return colors[status] || 'text-gray-400';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (severity === 'medium') return <Zap className="w-5 h-5 text-orange-400" />;
    return <TrendingUp className="w-5 h-5 text-yellow-400" />;
  };

  const totalAlerts = alerts.length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 rounded-xl text-white">
      {/* Ticker Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter ticker (e.g., AAPL)"
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Monitor'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-400" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{ticker} Acceleration Alerts</h1>
              <span className="text-slate-500 text-sm">({category})</span>
            </div>
            <p className="text-slate-400 text-sm">Velocity spike detection vs hourly baseline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm font-medium">{totalAlerts} Active ({highAlerts} High)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'alerts' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Alert Feed
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'timeline' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'category' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Category Status
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && (
        <>
          {/* Alert Cards */}
          <div className="space-y-3 mb-6">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{alert.type}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded">
                          {alert.magnitude.toFixed(1)}x baseline
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded">
                          {alert.actual} mentions (expected: {alert.baseline})
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1">{alert.trigger}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>Velocity: {alert.velocity_before.toFixed(1)}</span>
                        <span>→</span>
                        <span className="text-orange-400 font-medium">{alert.velocity_after.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Peak Velocity</div>
              <div className="text-2xl font-bold text-orange-400">8.5</div>
              <div className="text-slate-500 text-xs">at 14:00</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Max Magnitude</div>
              <div className="text-2xl font-bold text-red-400">3.2x</div>
              <div className="text-slate-500 text-xs">above baseline</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">High Alerts</div>
              <div className="text-2xl font-bold text-red-400">{highAlerts}</div>
              <div className="text-slate-500 text-xs">last 24h</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Alerts</div>
              <div className="text-2xl font-bold text-white">{totalAlerts}</div>
              <div className="text-slate-500 text-xs">last 24h</div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Velocity vs Baseline (24h) — Spikes shown where actual {'>'} 1.5x baseline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'velocity') return [`${value.toFixed(1)} (normalized)`, 'Velocity'];
                    if (name === 'actual') return [value, 'Actual mentions'];
                    if (name === 'baseline') return [value, 'Expected (baseline)'];
                    return [value, name];
                  }}
                />
                <ReferenceLine y={5} stroke="#64748b" strokeDasharray="3 3" label={{ value: '1x baseline', fill: '#64748b', fontSize: 10 }} />
                <ReferenceLine y={7.5} stroke="#f97316" strokeDasharray="3 3" label={{ value: '2x (spike)', fill: '#f97316', fontSize: 10 }} />
                <Area type="monotone" dataKey="velocity" stroke="#f97316" strokeWidth={2} fill="url(#velocityGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'category' && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-4">{category} — Alert Status Comparison</h3>
          <div className="space-y-3">
            {categoryPeers.sort((a, b) => b.maxMagnitude - a.maxMagnitude).map((peer) => (
              <div key={peer.ticker} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
                <span className={`w-20 font-bold ${peer.ticker === ticker ? 'text-orange-400' : 'text-white'}`}>
                  {peer.ticker}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(peer.status)}`}>
                      {peer.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {peer.alerts} alert{peer.alerts !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span className="text-right">
                  {peer.maxMagnitude > 0 ? (
                    <span className={`font-bold ${peer.maxMagnitude > 2 ? 'text-red-400' : 'text-orange-400'}`}>
                      {peer.maxMagnitude.toFixed(1)}x max
                    </span>
                  ) : (
                    <span className="text-slate-500">No spikes</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <p className="text-sm text-orange-200">
          <strong>How Acceleration Works:</strong> Spikes are detected when actual mentions exceed 1.5x the hourly baseline
          (3-day average for that hour). Magnitude shows how many times above baseline. High severity = 3x+, Medium = 2-3x, Low = 1.5-2x.
          Spikes often indicate breaking news, rumors, or viral content that may precede price movement.
        </p>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface AccelerationData {
  ticker: string;
  category: string;
  alerts: Array<{
    id: number;
    timestamp: string;
    time: string;           // Hour when spike occurred
    type: 'SPIKE' | 'ACCELERATION' | 'DECELERATION';
    magnitude: number;      // Multiple of baseline (e.g., 3.2 = 3.2x)
    trigger: string;        // Suspected cause
    actual: number;         // Actual mentions in that hour
    baseline: number;       // Expected mentions (3-day hourly avg)
    velocity_before: number;
    velocity_after: number;
    severity: 'high' | 'medium' | 'low';
  }>;
  timelineData: Array<{
    time: string;
    actual: number;
    baseline: number;
    velocity: number;       // Normalized 0-10 scale
  }>;
  categoryPeers: Array<{
    ticker: string;
    alerts: number;
    maxMagnitude: number;
    status: 'critical' | 'warning' | 'normal';
  }>;
}
```

## Alert Classification

| Magnitude | Severity | Status | Interpretation |
|-----------|----------|--------|----------------|
| 3x+ | High | Critical | Major breakout signal, potential viral event |
| 2-3x | Medium | Warning | Significant attention surge |
| 1.5-2x | Low | Warning | Notable increase worth monitoring |
| <1.5x | None | Normal | Within normal variation |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/acceleration-alerts.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. When user asks about acceleration/spikes for any ticker:
   - Use XPOZ MCP `getTwitterPostsByKeywords` to fetch last 48h of mentions
   - Fetch 7-day baseline data for robust hourly averages
   - Calculate magnitude for each hour (actual / baseline)
   - Identify spikes where magnitude > 1.5x
   - Infer potential triggers from tweet content
   - Fetch category peers for comparison
   - Render the React artifact with real data

2. Replace sample data in component with actual XPOZ data

3. The artifact has 3 tabs: Alert Feed, Timeline, Category Status
