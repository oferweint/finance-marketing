---
name: volume-anomaly
description: Detect unusual patterns in social mention volume for financial assets. Identifies anomalies, coordinated activity, and irregular spikes. Use when validating signals, detecting manipulation, or finding unusual activity.
---

# Volume Anomaly Skill

## Overview

This skill detects unusual patterns in social media mention volume, identifying potential manipulation, coordinated activity, or genuine breakout signals. Uses baseline-normalized metrics to distinguish real anomalies from normal fluctuations.

## When to Use

Activate this skill when the user asks about:
- "Any unusual activity on [TICKER]?"
- "Detect anomalies for [ASSET]"
- "Is [STOCK] volume normal?"
- "Suspicious patterns on [CRYPTO]?"
- "Volume anomaly check for [TICKER]"

## XPOZ MCP Data Flow

### Step 1: Gather Volume Data
Use `getTwitterPostsByKeywords` to fetch recent posts:
```
Query: "$GME" or "GameStop stock"
Fields: ["id", "text", "authorUsername", "createdAtDate", "retweetCount"]
```

### Step 2: Calculate Hourly Volume
- Count mentions per hour for past 24 hours
- Calculate 3-day baseline (average mentions per hour of day)
- Compute velocity = current_hour_volume / baseline_for_that_hour

### Step 3: Detect Anomalies
- Calculate Z-score for each hour
- Flag hours with Z-score > 2.0 (moderate) or > 4.0 (extreme)
- Analyze account age distribution during anomaly windows

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
   - Volume Overview: Timeline with anomaly markers
   - Pattern Analysis: Classification and indicators
   - Category Comparison: Anomaly rates vs peers

## React Artifact Template

```jsx
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { Activity, AlertOctagon, Search, Zap, Clock, Layers, Users, Shield } from 'lucide-react';

export default function VolumeAnomaly() {
  const [ticker, setTicker] = useState('GME');
  const [activeTab, setActiveTab] = useState('overview');

  // SAMPLE DATA - Replace with XPOZ MCP data
  const volumeData = [
    { time: '24h', volume: 450, baseline: 500, vsBaseline: 0.90, zscore: -0.2 },
    { time: '20h', volume: 520, baseline: 500, vsBaseline: 1.04, zscore: 0.1 },
    { time: '16h', volume: 480, baseline: 500, vsBaseline: 0.96, zscore: -0.1 },
    { time: '12h', volume: 890, baseline: 500, vsBaseline: 1.78, zscore: 1.8 },
    { time: '8h', volume: 2400, baseline: 500, vsBaseline: 4.80, zscore: 4.2, anomaly: true },
    { time: '4h', volume: 3100, baseline: 500, vsBaseline: 6.20, zscore: 5.8, anomaly: true },
    { time: 'Now', volume: 2800, baseline: 500, vsBaseline: 5.60, zscore: 5.1, anomaly: true },
  ];

  const anomalies = [
    {
      id: 1,
      type: 'SPIKE',
      severity: 'high',
      detectedAt: '8h ago',
      zscore: 5.8,
      peakVolume: 3100,
      baseline: 500,
      multiplier: 6.2,
      classification: 'Coordinated pump suspected',
      indicators: [
        { label: 'Volume 6.2x baseline', severity: 'high' },
        { label: '73% mentions from accounts < 60 days old', severity: 'high' },
        { label: 'Identical hashtag pattern detected', severity: 'medium' },
        { label: 'Time clustering at specific hours', severity: 'medium' }
      ]
    }
  ];

  const accountAnalysis = {
    newAccounts: 73,     // % of mentions from accounts < 60 days
    verified: 5,         // % from verified accounts
    bots: 28,            // % likely bot accounts
    organic: 67          // % organic accounts
  };

  const peerComparison = [
    { ticker: 'GME', anomalyRate: 3, avgZScore: 5.1, status: 'Anomaly', vsCategory: 5.1 },
    { ticker: 'AMC', anomalyRate: 2, avgZScore: 2.8, status: 'Elevated', vsCategory: 2.8 },
    { ticker: 'BBBY', anomalyRate: 0, avgZScore: 0.5, status: 'Normal', vsCategory: 0.5 },
    { ticker: 'BB', anomalyRate: 0, avgZScore: 0.3, status: 'Normal', vsCategory: 0.3 },
    { ticker: 'PLTR', anomalyRate: 1, avgZScore: 2.1, status: 'Elevated', vsCategory: 2.1 }
  ];

  const currentAnomaly = anomalies[0];

  const stats = {
    currentVolume: volumeData[volumeData.length - 1].volume,
    baseline: 500,
    peakZScore: 5.8,
    anomalyDuration: '8 hours',
    patternType: 'Coordinated spike'
  };

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (severity === 'medium') return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  };

  const getZScoreColor = (zscore) => {
    if (zscore >= 4) return 'text-red-400';
    if (zscore >= 2) return 'text-orange-400';
    return 'text-green-400';
  };

  const tabs = [
    { id: 'overview', label: 'Volume Overview', icon: Activity },
    { id: 'analysis', label: 'Pattern Analysis', icon: Search },
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
            placeholder="Enter ticker (e.g., GME, TSLA, BTC)"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Volume Anomaly</h1>
            <p className="text-slate-400 text-sm">Unusual pattern detection (24h)</p>
          </div>
        </div>
        {anomalies.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Anomaly Detected</span>
          </div>
        )}
      </div>

      {/* Anomaly Alert Card */}
      {currentAnomaly && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full border ${getSeverityColor(currentAnomaly.severity)}`}>
                <span className="text-sm font-bold">{currentAnomaly.severity.toUpperCase()}</span>
              </div>
              <div>
                <div className="font-bold">{currentAnomaly.type}</div>
                <div className="text-sm text-slate-400">{currentAnomaly.classification}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">{currentAnomaly.multiplier}x</div>
              <div className="text-xs text-slate-400">above baseline</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-700">
            <Clock className="w-3 h-3" />
            Detected {currentAnomaly.detectedAt} | Z-score: {currentAnomaly.zscore} | Duration: {stats.anomalyDuration}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-red-500/20 text-red-400'
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
          {/* Volume Chart */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-400">Mention Volume vs Baseline (24h)</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-400 rounded"></span> Volume</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-slate-500 rounded"></span> Baseline</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value, name) => [
                      name === 'volume' ? `${value} mentions` : `${value} (baseline)`,
                      name === 'volume' ? 'Volume' : 'Baseline'
                    ]}
                  />
                  <ReferenceLine y={500} stroke="#64748b" strokeDasharray="3 3" label={{ value: '1x Baseline', fill: '#64748b', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.anomaly) {
                        return <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
                      }
                      return <circle cx={cx} cy={cy} r={3} fill="#ef4444" />;
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-center">
              Red dots indicate anomaly detection points (Z-score > 4.0)
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Current Volume</div>
              <div className="text-2xl font-bold text-red-400">{stats.currentVolume}</div>
              <div className="text-xs text-slate-500">{(stats.currentVolume / stats.baseline).toFixed(1)}x baseline</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Baseline</div>
              <div className="text-2xl font-bold">{stats.baseline}</div>
              <div className="text-xs text-slate-500">/hour avg (3-day)</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Peak Z-Score</div>
              <div className={`text-2xl font-bold ${getZScoreColor(stats.peakZScore)}`}>{stats.peakZScore}</div>
              <div className="text-xs text-slate-500">std deviations</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Duration</div>
              <div className="text-2xl font-bold">{stats.anomalyDuration}</div>
              <div className="text-xs text-slate-500">ongoing</div>
            </div>
          </div>

          {/* Y-Axis Legend */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding the Y-Axis (Baseline Multiplier)</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-green-500/10 rounded">
                <div className="font-bold text-green-400">0.5x-1.5x</div>
                <div className="text-xs text-slate-500">Normal range</div>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded">
                <div className="font-bold text-yellow-400">1.5x-3x</div>
                <div className="text-xs text-slate-500">Elevated</div>
              </div>
              <div className="text-center p-2 bg-orange-500/10 rounded">
                <div className="font-bold text-orange-400">3x-5x</div>
                <div className="text-xs text-slate-500">High anomaly</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded">
                <div className="font-bold text-red-400">5x+</div>
                <div className="text-xs text-slate-500">Extreme</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Indicators */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Anomaly Indicators</h3>
            <div className="grid grid-cols-2 gap-3">
              {currentAnomaly?.indicators.map((ind, i) => (
                <div key={i} className={`flex items-center gap-2 p-3 rounded-lg border ${getSeverityColor(ind.severity)}`}>
                  <AlertOctagon className="w-4 h-4" />
                  <span className="text-sm">{ind.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Analysis */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Account Quality Distribution
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{accountAnalysis.newAccounts}%</div>
                <div className="text-xs text-slate-500">New Accounts</div>
                <div className="text-xs text-red-400">(&lt;60 days)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">{accountAnalysis.bots}%</div>
                <div className="text-xs text-slate-500">Likely Bots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{accountAnalysis.organic}%</div>
                <div className="text-xs text-slate-500">Organic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{accountAnalysis.verified}%</div>
                <div className="text-xs text-slate-500">Verified</div>
              </div>
            </div>
            <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden flex">
              <div className="bg-red-500 h-full" style={{ width: `${accountAnalysis.newAccounts}%` }} />
              <div className="bg-orange-500 h-full" style={{ width: `${accountAnalysis.bots}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${accountAnalysis.organic - accountAnalysis.bots}%` }} />
              <div className="bg-blue-500 h-full" style={{ width: `${accountAnalysis.verified}%` }} />
            </div>
          </div>

          {/* Pattern Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Pattern Classification
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pattern Type</span>
                  <span className="font-bold text-red-400">{stats.patternType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence</span>
                  <span className="font-bold text-red-400">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Similar Past Events</span>
                  <span className="font-bold">3 in 90 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Duration</span>
                  <span className="font-bold">12-24 hours</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Signal Reliability
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">LOW</div>
                <div className="text-sm text-slate-400">Quality Score</div>
                <div className="text-xs text-slate-500 mt-2">
                  High new-account concentration and bot activity suggest low signal reliability
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Meme Stocks Anomaly Comparison (24h)</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="pb-3">Ticker</th>
                  <th className="pb-3">Anomaly Hours</th>
                  <th className="pb-3">Peak Z-Score</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">vs Category Avg</th>
                </tr>
              </thead>
              <tbody>
                {peerComparison.map((peer) => (
                  <tr key={peer.ticker} className={`border-t border-slate-700 ${peer.ticker === ticker ? 'bg-red-500/10' : ''}`}>
                    <td className="py-3">
                      <span className={`font-bold ${peer.ticker === ticker ? 'text-red-400' : ''}`}>
                        {peer.ticker}
                        {peer.ticker === ticker && <span className="ml-2 text-xs text-red-400">(Selected)</span>}
                      </span>
                    </td>
                    <td className="py-3">{peer.anomalyRate}</td>
                    <td className="py-3">
                      <span className={getZScoreColor(peer.avgZScore)}>{peer.avgZScore.toFixed(1)}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        peer.status === 'Anomaly' ? 'bg-red-500/20 text-red-400' :
                        peer.status === 'Elevated' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {peer.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={peer.vsCategory >= 2 ? 'text-red-400' : 'text-slate-400'}>
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
                  <span className="text-slate-400">Category Avg Z-Score</span>
                  <span className="font-bold">1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{ticker} vs Category</span>
                  <span className="font-bold text-red-400">5.1x higher</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank in Category</span>
                  <span className="font-bold">#1 of 5</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Category Anomaly Summary</h3>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">2</div>
                  <div className="text-xs text-slate-500">In Anomaly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">1</div>
                  <div className="text-xs text-slate-500">Elevated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">2</div>
                  <div className="text-xs text-slate-500">Normal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-sm text-red-200">
          <strong>Anomaly Alert:</strong> {ticker} showing {currentAnomaly?.multiplier}x volume spike (Z-score: {currentAnomaly?.zscore}).
          Pattern classified as "{currentAnomaly?.classification}".
          Key indicators: {accountAnalysis.newAccounts}% new account concentration, {accountAnalysis.bots}% likely bot activity.
          This is 5.1x higher than category average. Recommend Quality Index validation before acting on sentiment signals.
        </p>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Understanding These Metrics</h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-300">Z-Score:</strong> Number of standard deviations from mean. Z > 2.0 = Moderate anomaly (95th percentile), Z > 4.0 = Extreme anomaly (99.99th percentile).
          </div>
          <div>
            <strong className="text-slate-300">Baseline:</strong> 3-day rolling average of mentions for each hour of day. Accounts for time-of-day patterns.
          </div>
          <div>
            <strong className="text-slate-300">New Accounts:</strong> Percentage of mentions from accounts created within 60 days. High % suggests coordinated activity.
          </div>
          <div>
            <strong className="text-slate-300">vs Category:</strong> How this ticker's Z-score compares to its peer group average. Values above 2.0x suggest outlier behavior.
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Data Format

```typescript
interface VolumeAnomalyData {
  ticker: string;
  volumeData: Array<{
    time: string;
    volume: number;
    baseline: number;
    vsBaseline: number;    // volume / baseline ratio
    zscore: number;
    anomaly?: boolean;
  }>;
  anomalies: Array<{
    id: number;
    type: 'SPIKE' | 'DROP' | 'PATTERN';
    severity: 'high' | 'medium' | 'low';
    detectedAt: string;
    zscore: number;
    peakVolume: number;
    baseline: number;
    multiplier: number;
    classification: string;
    indicators: Array<{ label: string; severity: string }>;
  }>;
  accountAnalysis: {
    newAccounts: number;
    verified: number;
    bots: number;
    organic: number;
  };
  peerComparison: Array<{
    ticker: string;
    anomalyRate: number;
    avgZScore: number;
    status: 'Anomaly' | 'Elevated' | 'Normal';
    vsCategory: number;
  }>;
}
```

## Z-Score Thresholds

| Z-Score | Classification | Percentile |
|---------|----------------|------------|
| > 4.0 | Extreme anomaly | 99.99% |
| 3.0-4.0 | High anomaly | 99.7% |
| 2.0-3.0 | Moderate anomaly | 95% |
| < 2.0 | Normal variance | <95% |

## IMPORTANT: Artifact Format

When generating this artifact in Claude.ai, you MUST:
1. Save the file with `.jsx` extension
2. Use the exact format: `/mnt/user-data/outputs/volume-anomaly.jsx`
3. Replace ALL sample data with real data from XPOZ MCP before rendering
4. **CRITICAL**: When ticker changes, recalculate ALL data for new ticker

## Instructions for Claude

1. Accept ticker input from user
2. Fetch volume data via XPOZ MCP `getTwitterPostsByKeywords`
3. Calculate baseline (3-day average volume per hour of day)
4. Compute Z-scores for each hour
5. Analyze account age distribution during anomaly windows
6. Compare to category peers
7. Render React artifact with 3 tabs
8. Recommend Quality Index validation for anomalies
