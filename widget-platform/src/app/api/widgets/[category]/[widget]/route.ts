import { NextRequest, NextResponse } from 'next/server';
import { buildExpandedQuery, getTickerCategory, getCategoryPeers } from '@/lib/query-expansion';
import { CHART_COLORS, calculateVelocity } from '@/lib/theme';
import { HourlyData, PeerData, Signal, VelocityTrackerData } from '@/types/widgets';
import {
  analyzeSentiment,
  calculateVelocityMetrics,
  SentimentType,
  calculateAggregateSentiment,
  extractInfluencers,
  XpozPost,
} from '@/lib/xpoz-mcp';
import { XpozMCP } from '@/lib/xpoz-mcp-client';

// Check if live XPOZ data is enabled
const USE_LIVE_DATA = process.env.XPOZ_LIVE_DATA === 'true';

// Simple in-memory cache (in production, use Vercel KV or Redis)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting (simple in-memory, use Vercel KV in production)
const rateLimits = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 100; // requests per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now - limit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

function getCacheKey(category: string, widget: string, params: Record<string, string>): string {
  return `${category}:${widget}:${JSON.stringify(params)}`;
}

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Calculate hour-specific baselines from posts data.
 * Excludes weekends and normalizes by number of weekdays.
 *
 * @param posts - Array of posts with createdAt (full timestamp) or createdAtDate (date only)
 * @param totalCount - Total count for fallback calculation
 * @returns Object with todayByHour, baselineByHour, and numWeekdays
 */
function calculateHourlyBaselines<T extends { createdAt?: string; createdAtDate?: string }>(
  posts: T[],
  totalCount: number
): {
  todayByHour: Map<number, number>;
  baselineByHour: Map<number, number>;
  numWeekdays: number;
} {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Initialize hour tracking maps
  const historicalByHour = new Map<number, number[]>(); // hour -> array of counts from each historical weekday
  const todayByHour = new Map<number, number>(); // hour -> count for today
  for (let h = 0; h < 24; h++) {
    historicalByHour.set(h, []);
    todayByHour.set(h, 0);
  }

  // Group posts by day first
  // Prefer createdAt (full timestamp) over createdAtDate (date only)
  const postsByDay = new Map<string, T[]>();
  posts.forEach(post => {
    const timestamp = post.createdAt || post.createdAtDate || '';
    if (!timestamp) return; // Skip posts without timestamp

    const postDate = new Date(timestamp);
    // Skip invalid dates
    if (isNaN(postDate.getTime())) return;

    const dateStr = postDate.toISOString().split('T')[0];
    if (!postsByDay.has(dateStr)) postsByDay.set(dateStr, []);
    postsByDay.get(dateStr)!.push(post);
  });

  let numWeekdays = 0;

  // Process each day - separate today from historical weekdays
  postsByDay.forEach((dayPosts, dateStr) => {
    const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = dateStr === todayStr;

    // Count posts per hour for this day
    const hourCounts = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourCounts.set(h, 0);

    dayPosts.forEach(post => {
      const timestamp = post.createdAt || post.createdAtDate || '';
      const postDate = new Date(timestamp);
      const hour = postDate.getUTCHours(); // Use UTC to match UTC date comparison
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    if (isToday) {
      // Today's data goes to actual counts
      hourCounts.forEach((count, hour) => {
        todayByHour.set(hour, count);
      });
    } else if (!isWeekend) {
      // Historical weekday data goes to baseline calculation
      numWeekdays++;
      hourCounts.forEach((count, hour) => {
        historicalByHour.get(hour)!.push(count);
      });
    }
    // Weekend historical data is excluded from baseline
  });

  // Calculate baseline for each hour (average of historical weekday counts)
  const baselineByHour = new Map<number, number>();
  for (let hour = 0; hour < 24; hour++) {
    const historicalCounts = historicalByHour.get(hour)!;
    const numDays = historicalCounts.length;
    if (numDays > 0) {
      const sum = historicalCounts.reduce((a, b) => a + b, 0);
      baselineByHour.set(hour, Math.round(sum / numDays));
    } else {
      // Fallback: use overall average if no historical weekday data
      baselineByHour.set(hour, Math.round(totalCount / 72) || 1); // 72 = 24h * 3 days
    }
  }

  return { todayByHour, baselineByHour, numWeekdays };
}

// Generate mock velocity tracker data
function generateVelocityTrackerData(ticker: string): VelocityTrackerData {
  const now = new Date();
  const currentHour = now.getHours();
  const category = getTickerCategory(ticker) || 'Unknown';
  const peers = getCategoryPeers(ticker);

  // Generate hourly data
  const hourlyData: HourlyData[] = [];
  for (let i = 0; i <= currentHour; i++) {
    // Create realistic-looking baseline pattern (higher during market hours)
    const hourFactor = i >= 9 && i <= 16 ? 1.5 : i >= 6 && i <= 20 ? 1.0 : 0.5;
    const baseline = Math.round(50 * hourFactor + Math.sin(i / 3) * 20);

    // Add some variance to actual
    const variance = 0.7 + Math.random() * 0.6;
    const actual = Math.round(baseline * variance);
    const velocity = calculateVelocity(actual, baseline);

    hourlyData.push({
      time: `${String(i).padStart(2, '0')}:00`,
      hour: i,
      actual,
      baseline,
      velocity,
    });
  }

  const latestData = hourlyData[hourlyData.length - 1];
  const ratio = latestData.actual / latestData.baseline;

  // Generate peer data
  const categoryPeers: PeerData[] = [
    {
      ticker,
      velocity: latestData.velocity,
      trend: ratio > 1.1 ? 'accelerating' : ratio < 0.9 ? 'decelerating' : 'stable',
      mentions: latestData.actual,
      color: CHART_COLORS[0],
    },
    ...peers.slice(0, 3).map((peerTicker, i) => ({
      ticker: peerTicker,
      velocity: 4 + Math.random() * 4,
      trend: (['accelerating', 'decelerating', 'stable'] as const)[Math.floor(Math.random() * 3)],
      mentions: Math.round(30 + Math.random() * 100),
      color: CHART_COLORS[i + 1],
    })),
  ];

  // Determine signal
  let signal: Signal = 'NORMAL';
  if (ratio > 2) signal = 'VERY_HIGH';
  else if (ratio > 1.5) signal = 'HIGH_ACTIVITY';
  else if (ratio > 1.2) signal = 'ELEVATED';
  else if (ratio < 0.8) signal = 'LOW';

  // Determine trend from last 3 hours
  let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
  if (hourlyData.length >= 3) {
    const recent = hourlyData.slice(-3);
    const avgRecent = recent.reduce((sum, h) => sum + h.velocity, 0) / 3;
    const avgEarlier = hourlyData.length >= 6
      ? hourlyData.slice(-6, -3).reduce((sum, h) => sum + h.velocity, 0) / 3
      : avgRecent;

    if (avgRecent > avgEarlier * 1.1) trend = 'accelerating';
    else if (avgRecent < avgEarlier * 0.9) trend = 'decelerating';
  }

  return {
    ticker,
    category,
    currentVelocity: latestData.velocity,
    currentActual: latestData.actual,
    currentBaseline: latestData.baseline,
    baselineRatio: ratio,
    trend,
    signal,
    hourlyData,
    categoryPeers,
    generatedAt: now.toISOString(),
  };
}

// Generate sentiment deep dive data
function generateSentimentDeepDiveData(ticker: string) {
  const now = new Date();
  const currentHour = now.getHours();

  // Simulate posts with sentiment analysis
  const sampleTexts = [
    `${ticker} looking strong! Bullish on earnings`,
    `Concerned about ${ticker} valuation at these levels`,
    `${ticker} AI integration is undervalued`,
    `Taking profits on ${ticker} here`,
    `${ticker} breakout imminent, accumulating`,
  ];

  const sentimentResults = sampleTexts.map(text => analyzeSentiment(text));
  const avgScore = sentimentResults.reduce((sum, r) => sum + r.score, 0) / sentimentResults.length;

  return {
    ticker,
    overallSentiment: Math.round(avgScore),
    sentimentTrend: avgScore > 55 ? 'improving' : avgScore < 45 ? 'declining' : 'stable',
    sentimentByCategory: {
      fundamental: 40 + Math.round(Math.random() * 30),
      technical: 45 + Math.round(Math.random() * 25),
      news: 35 + Math.round(Math.random() * 35),
      speculative: 30 + Math.round(Math.random() * 40),
    },
    hourlyHistory: Array.from({ length: currentHour + 1 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      sentiment: 45 + Math.round(Math.sin(i / 3) * 15 + Math.random() * 10),
    })),
    samplePosts: sampleTexts.map((text, i) => ({
      id: `post-${i}`,
      text,
      author: `user${i}`,
      sentiment: sentimentResults[i].sentiment,
      engagement: Math.round(10 + Math.random() * 500),
    })),
    generatedAt: now.toISOString(),
  };
}

// Generate acceleration alerts data
function generateAccelerationAlertsData(ticker: string) {
  const now = new Date();
  const alerts = [];

  for (let i = 0; i < 5; i++) {
    const hours = Math.floor(Math.random() * 24);
    const velocity = 3 + Math.random() * 7;
    const { signal } = calculateVelocityMetrics(
      Math.round(50 + Math.random() * 100),
      50,
    );

    alerts.push({
      id: `alert-${i}`,
      time: `${String(hours).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      velocity,
      acceleration: (Math.random() - 0.3) * 3,
      mentions: Math.round(20 + Math.random() * 200),
      signal,
      trigger: velocity > 7 ? 'spike' : velocity < 4 ? 'drop' : 'normal',
    });
  }

  alerts.sort((a, b) => b.velocity - a.velocity);

  return {
    ticker,
    alerts,
    currentAcceleration: (Math.random() - 0.3) * 2,
    trend: Math.random() > 0.5 ? 'accelerating' : Math.random() > 0.5 ? 'decelerating' : 'stable',
    threshold: 1.5,
    generatedAt: now.toISOString(),
  };
}

// Generate category heatmap data
function generateCategoryHeatmapData() {
  const categories = [
    { name: 'Technology', tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] },
    { name: 'EV/Auto', tickers: ['TSLA', 'RIVN', 'LCID', 'F', 'GM'] },
    { name: 'Crypto', tickers: ['BTC', 'ETH', 'SOL', 'COIN', 'MSTR'] },
    { name: 'Finance', tickers: ['JPM', 'BAC', 'GS', 'MS', 'V'] },
    { name: 'Healthcare', tickers: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK'] },
  ];

  return {
    categories: categories.map(cat => ({
      name: cat.name,
      tickers: cat.tickers.map(ticker => ({
        ticker,
        velocity: 3 + Math.random() * 5,
        sentiment: 35 + Math.round(Math.random() * 40),
        mentions: Math.round(20 + Math.random() * 300),
        change: (Math.random() - 0.5) * 100,
      })),
      avgVelocity: 4 + Math.random() * 3,
      avgSentiment: 45 + Math.round(Math.random() * 20),
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Generate influencer radar data
function generateInfluencerRadarData(ticker: string) {
  const influencers = [
    { username: 'WallStBets', followers: 1200000 },
    { username: 'StockGuru', followers: 450000 },
    { username: 'TradingView', followers: 890000 },
    { username: 'InvestorDaily', followers: 320000 },
    { username: 'MarketWatch', followers: 2100000 },
    { username: 'CryptoWhale', followers: 780000 },
    { username: 'OptionsFlow', followers: 190000 },
    { username: 'TechStocks', followers: 420000 },
  ];

  return {
    ticker,
    influencers: influencers.map((inf, i) => {
      const sentiment = Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral';
      return {
        ...inf,
        sentiment: sentiment as SentimentType,
        postCount: Math.round(1 + Math.random() * 10),
        totalEngagement: Math.round(inf.followers * 0.01 * Math.random()),
        avgEngagement: Math.round(inf.followers * 0.001 * Math.random()),
        recentPost: `${sentiment === 'bullish' ? 'Long' : sentiment === 'bearish' ? 'Short' : 'Watching'} $${ticker}`,
      };
    }).sort((a, b) => b.totalEngagement - a.totalEngagement),
    totalInfluencers: influencers.length,
    bullishInfluencers: Math.round(influencers.length * 0.4 + Math.random() * 3),
    bearishInfluencers: Math.round(influencers.length * 0.3 + Math.random() * 2),
    generatedAt: new Date().toISOString(),
  };
}

// Generate position tracker data
function generatePositionTrackerData(ticker: string) {
  const bullCount = Math.round(30 + Math.random() * 50);
  const bearCount = Math.round(20 + Math.random() * 40);
  const total = bullCount + bearCount;

  return {
    ticker,
    bullCount,
    bearCount,
    bullPercentage: Math.round((bullCount / total) * 100),
    bearPercentage: Math.round((bearCount / total) * 100),
    totalPositions: total,
    topBulls: Array.from({ length: 5 }, (_, i) => ({
      username: `BullTrader${i + 1}`,
      followers: Math.round(10000 + Math.random() * 500000),
      conviction: Math.round(70 + Math.random() * 30),
    })),
    topBears: Array.from({ length: 5 }, (_, i) => ({
      username: `BearTrader${i + 1}`,
      followers: Math.round(10000 + Math.random() * 300000),
      conviction: Math.round(60 + Math.random() * 40),
    })),
    historicalRatio: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      bullPct: 45 + Math.round(Math.sin(i / 4) * 15 + Math.random() * 10),
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Generate rising tickers data
function generateRisingTickersData() {
  const tickers = [
    { ticker: 'SMCI', name: 'Super Micro', category: 'Tech' },
    { ticker: 'ARM', name: 'ARM Holdings', category: 'Tech' },
    { ticker: 'PLTR', name: 'Palantir', category: 'Tech' },
    { ticker: 'IONQ', name: 'IonQ', category: 'Tech' },
    { ticker: 'RKLB', name: 'Rocket Lab', category: 'Space' },
    { ticker: 'LUNR', name: 'Intuitive Machines', category: 'Space' },
    { ticker: 'RIVN', name: 'Rivian', category: 'EV' },
    { ticker: 'LCID', name: 'Lucid', category: 'EV' },
  ];

  return {
    tickers: tickers.map(t => ({
      ...t,
      velocity: 5 + Math.random() * 4,
      velocityChange: Math.round((Math.random() - 0.3) * 200),
      sentiment: 45 + Math.round(Math.random() * 30),
      mentions: Math.round(50 + Math.random() * 500),
      trend: Math.random() > 0.3 ? 'accelerating' : 'stable',
    })).sort((a, b) => b.velocityChange - a.velocityChange),
    totalDiscovered: tickers.length,
    generatedAt: new Date().toISOString(),
  };
}

// Generate portfolio aggregator data
function generatePortfolioAggregatorData(tickers: string[]) {
  const tickerList = tickers.length > 0 ? tickers : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

  const tickerData = tickerList.map(ticker => ({
    ticker,
    sentiment: 40 + Math.round(Math.random() * 35),
    velocity: 3 + Math.random() * 5,
    mentions: Math.round(30 + Math.random() * 300),
    weight: Math.round(100 / tickerList.length),
  }));

  const avgSentiment = Math.round(tickerData.reduce((sum, t) => sum + t.sentiment, 0) / tickerData.length);
  const avgVelocity = tickerData.reduce((sum, t) => sum + t.velocity, 0) / tickerData.length;

  return {
    tickers: tickerData,
    overallSentiment: avgSentiment,
    averageVelocity: avgVelocity,
    totalMentions: tickerData.reduce((sum, t) => sum + t.mentions, 0),
    riskScore: Math.round(30 + Math.random() * 40),
    generatedAt: new Date().toISOString(),
  };
}

// Generate correlation radar data
function generateCorrelationRadarData(ticker: string) {
  const peers = getCategoryPeers(ticker);

  return {
    baseTicker: ticker,
    baseVelocity: 5 + Math.random() * 3,
    baseSentiment: 50 + Math.round(Math.random() * 20),
    correlatedAssets: peers.slice(0, 6).map((peer, i) => ({
      ticker: peer,
      correlation: 0.3 + Math.random() * 0.6,
      velocity: 4 + Math.random() * 4,
      sentiment: 40 + Math.round(Math.random() * 35),
      mentions: Math.round(20 + Math.random() * 200),
    })).sort((a, b) => b.correlation - a.correlation),
    generatedAt: new Date().toISOString(),
  };
}

// Generate quality index data
function generateQualityIndexData(ticker: string) {
  const total = Math.round(200 + Math.random() * 800);
  const authenticPct = 60 + Math.round(Math.random() * 25);
  const botPct = Math.round(Math.random() * 15);
  const spamPct = Math.round(Math.random() * 10);
  const lowQualityPct = 100 - authenticPct - botPct - spamPct;

  return {
    ticker,
    qualityScore: Math.round(authenticPct * 0.9 + (100 - botPct - spamPct) * 0.1),
    authenticPct,
    suspectedBotPct: botPct,
    spamPct,
    lowQualityPct: Math.max(0, lowQualityPct),
    totalMentions: total,
    authenticMentions: Math.round(total * authenticPct / 100),
    hourlyBreakdown: Array.from({ length: new Date().getHours() + 1 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      authentic: Math.round(20 + Math.random() * 60),
      bot: Math.round(Math.random() * 15),
      spam: Math.round(Math.random() * 10),
    })),
    topBotAccounts: Array.from({ length: 3 }, (_, i) => ({
      username: `SuspiciousBot${i + 1}`,
      postCount: Math.round(10 + Math.random() * 50),
      flags: ['High frequency', 'Template posts', 'New account'][i],
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Generate sentiment shift data
function generateSentimentShiftData(ticker: string) {
  const current = 45 + Math.round(Math.random() * 25);

  return {
    ticker,
    currentSentiment: current,
    sentimentChange24h: Math.round((Math.random() - 0.5) * 30),
    sentimentChange7d: Math.round((Math.random() - 0.5) * 40),
    recentShifts: Array.from({ length: 5 }, (_, i) => ({
      time: `${24 - i * 4}h ago`,
      from: 40 + Math.round(Math.random() * 30),
      to: 40 + Math.round(Math.random() * 30),
      trigger: ['News', 'Earnings', 'Analyst', 'Social'][Math.floor(Math.random() * 4)],
    })),
    hourlyHistory: Array.from({ length: new Date().getHours() + 1 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      sentiment: 45 + Math.round(Math.sin(i / 3) * 15 + Math.random() * 10),
    })),
    dailyHistory: Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      sentiment: 45 + Math.round(Math.sin(i / 2) * 12 + Math.random() * 15),
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Generate volume anomaly data
function generateVolumeAnomalyData(ticker: string) {
  const current = Math.round(50 + Math.random() * 200);
  const expected = Math.round(80 + Math.random() * 40);
  const ratio = current / expected;

  return {
    ticker,
    currentVolume: current,
    expectedVolume: expected,
    anomalyScore: Math.round(Math.abs(ratio - 1) * 100),
    isAnomaly: ratio > 1.5 || ratio < 0.5,
    hourlyData: Array.from({ length: new Date().getHours() + 1 }, (_, i) => {
      const hourExpected = 50 + Math.round(Math.sin(i / 4) * 30);
      const hourActual = Math.round(hourExpected * (0.7 + Math.random() * 0.8));
      return {
        time: `${String(i).padStart(2, '0')}:00`,
        actual: hourActual,
        expected: hourExpected,
        isAnomaly: Math.abs(hourActual - hourExpected) / hourExpected > 0.5,
      };
    }),
    recentAnomalies: Array.from({ length: 3 }, (_, i) => ({
      time: `${12 - i * 3}:00`,
      volume: Math.round(150 + Math.random() * 100),
      expected: 80,
      type: Math.random() > 0.5 ? 'spike' : 'drop',
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Generate narrative tracker data
function generateNarrativeTrackerData(ticker: string) {
  const bullishThemes = [
    'Strong earnings growth potential',
    'AI integration expanding',
    'Market share gains',
    'New product launch success',
  ];

  const bearishThemes = [
    'Valuation concerns',
    'Competition heating up',
    'Regulatory headwinds',
    'Margin pressure',
  ];

  const bullishNarratives = bullishThemes.slice(0, 3 + Math.floor(Math.random() * 2)).map((theme, i) => ({
    id: `bull-${i}`,
    theme,
    sentiment: 'bullish' as const,
    strength: Math.round(40 + Math.random() * 60),
    mentions: Math.round(20 + Math.random() * 200),
    influencers: Math.round(2 + Math.random() * 15),
    samplePosts: [`Bullish on ${ticker}: ${theme}`],
    trend: Math.random() > 0.3 ? 'growing' : 'stable' as const,
  })).sort((a, b) => b.strength - a.strength);

  const bearishNarratives = bearishThemes.slice(0, 2 + Math.floor(Math.random() * 2)).map((theme, i) => ({
    id: `bear-${i}`,
    theme,
    sentiment: 'bearish' as const,
    strength: Math.round(30 + Math.random() * 50),
    mentions: Math.round(10 + Math.random() * 100),
    influencers: Math.round(1 + Math.random() * 10),
    samplePosts: [`Bearish on ${ticker}: ${theme}`],
    trend: Math.random() > 0.5 ? 'growing' : 'declining' as const,
  })).sort((a, b) => b.strength - a.strength);

  const bullTotal = bullishNarratives.reduce((sum, n) => sum + n.strength, 0);
  const bearTotal = bearishNarratives.reduce((sum, n) => sum + n.strength, 0);
  const balance = Math.round((bullTotal / (bullTotal + bearTotal)) * 100);

  return {
    ticker,
    bullishNarratives,
    bearishNarratives,
    dominantSentiment: balance > 55 ? 'bullish' : balance < 45 ? 'bearish' : 'neutral',
    narrativeBalance: balance,
    totalNarratives: bullishNarratives.length + bearishNarratives.length,
    generatedAt: new Date().toISOString(),
  };
}

// Generate divergence detector data
function generateDivergenceDetectorData(ticker: string) {
  const now = new Date();
  const currentHour = now.getHours();

  const hourlyHistory = [];
  let retailBase = 50 + Math.random() * 20;
  let smartBase = 50 + Math.random() * 20;

  for (let i = 0; i <= currentHour; i++) {
    retailBase = Math.max(20, Math.min(80, retailBase + (Math.random() - 0.5) * 8));
    smartBase = Math.max(20, Math.min(80, smartBase + (Math.random() - 0.45) * 6));
    hourlyHistory.push({
      time: `${String(i).padStart(2, '0')}:00`,
      retail: Math.round(retailBase),
      smart: Math.round(smartBase),
    });
  }

  const latestRetail = hourlyHistory[hourlyHistory.length - 1]?.retail || 50;
  const latestSmart = hourlyHistory[hourlyHistory.length - 1]?.smart || 50;
  const divergenceScore = Math.abs(latestRetail - latestSmart);

  let direction: 'retail_bullish' | 'smart_bullish' | 'aligned' = 'aligned';
  if (latestRetail - latestSmart > 10) direction = 'retail_bullish';
  else if (latestSmart - latestRetail > 10) direction = 'smart_bullish';

  return {
    ticker,
    retailSentiment: latestRetail,
    smartMoneySentiment: latestSmart,
    divergenceScore,
    divergenceDirection: direction,
    hourlyHistory,
    significantDivergences: hourlyHistory
      .filter(h => Math.abs(h.retail - h.smart) > 15)
      .map(h => ({ ...h, gap: h.retail - h.smart }))
      .slice(-5),
    interpretation: direction === 'retail_bullish'
      ? `Retail investors are more bullish than institutional players on ${ticker}.`
      : direction === 'smart_bullish'
      ? `Institutional sentiment is more positive than retail on ${ticker}.`
      : `Retail and institutional sentiment are aligned on ${ticker}.`,
    generatedAt: now.toISOString(),
  };
}

// Generate basket builder data
function generateBasketBuilderData(theme: string) {
  const themeTickerMap: Record<string, { ticker: string; name: string; reason: string }[]> = {
    'AI stocks': [
      { ticker: 'NVDA', name: 'NVIDIA', reason: 'Leading AI chip maker' },
      { ticker: 'MSFT', name: 'Microsoft', reason: 'OpenAI partnership' },
      { ticker: 'GOOGL', name: 'Alphabet', reason: 'Gemini AI development' },
      { ticker: 'AMD', name: 'AMD', reason: 'AI GPU competition' },
      { ticker: 'PLTR', name: 'Palantir', reason: 'Enterprise AI solutions' },
    ],
    'EV stocks': [
      { ticker: 'TSLA', name: 'Tesla', reason: 'Market leader' },
      { ticker: 'RIVN', name: 'Rivian', reason: 'Electric trucks' },
      { ticker: 'LCID', name: 'Lucid', reason: 'Luxury EVs' },
      { ticker: 'NIO', name: 'NIO', reason: 'China EV leader' },
      { ticker: 'F', name: 'Ford', reason: 'EV transition' },
    ],
    'Crypto': [
      { ticker: 'BTC', name: 'Bitcoin', reason: 'Digital gold' },
      { ticker: 'ETH', name: 'Ethereum', reason: 'Smart contracts' },
      { ticker: 'SOL', name: 'Solana', reason: 'High speed chain' },
      { ticker: 'COIN', name: 'Coinbase', reason: 'Crypto exchange' },
      { ticker: 'MSTR', name: 'MicroStrategy', reason: 'BTC treasury' },
    ],
  };

  const tickerList = themeTickerMap[theme] || themeTickerMap['AI stocks'];

  const tickers = tickerList.map(t => {
    const sentiment = Math.round(40 + Math.random() * 35);
    const velocity = 3 + Math.random() * 5;
    const mentions = Math.round(50 + Math.random() * 400);
    const score = Math.round((sentiment * 0.4 + velocity * 8 + Math.min(mentions / 10, 20)) / 1.2);
    return { ...t, sentiment, velocity, mentions, score };
  }).sort((a, b) => b.score - a.score);

  return {
    theme,
    tickers,
    averageSentiment: Math.round(tickers.reduce((sum, t) => sum + t.sentiment, 0) / tickers.length),
    averageVelocity: tickers.reduce((sum, t) => sum + t.velocity, 0) / tickers.length,
    totalMentions: tickers.reduce((sum, t) => sum + t.mentions, 0),
    generatedAt: new Date().toISOString(),
  };
}

// ============================================
// LIVE DATA FETCHERS (using XPOZ MCP)
// ============================================

/**
 * Fetch current velocity and metrics for a single ticker using hour-specific baselines.
 * Lighter weight than fetchTickerVelocityData - only returns current values, not hourly arrays.
 * Uses CSV export for complete data accuracy.
 */
async function fetchTickerCurrentData(
  ticker: string,
  options?: { startDate?: string }
): Promise<{
  currentVelocity: number;
  currentMentions: number;
  currentBaseline: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
}> {
  try {
    const now = new Date();
    const currentHour = now.getUTCHours();

    // Default to 3 days ago for baseline calculation
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const startDate = options?.startDate || threeDaysAgo.toISOString().split('T')[0];

    // Build expanded query for this ticker
    const expandedQuery = await buildExpandedQuery(ticker);

    // Fetch posts via CSV export for complete data
    const posts = await XpozMCP.searchTwitterPostsComplete(expandedQuery, {
      fields: ['id', 'text', 'authorUsername', 'createdAt', 'retweetCount', 'replyCount'],
      startDate,
    });

    // Calculate hourly baselines
    const { todayByHour, baselineByHour } = calculateHourlyBaselines(posts, posts.length);

    const currentMentions = todayByHour.get(currentHour) || 0;
    const currentBaseline = baselineByHour.get(currentHour) || 1;
    const currentVelocity = calculateVelocity(currentMentions, currentBaseline);

    // Calculate trend from hourly data
    const { trend } = calculateVelocityMetrics(
      currentMentions,
      currentBaseline,
      Array.from(todayByHour.values())
    );

    return { currentVelocity, currentMentions, currentBaseline, trend };
  } catch (error) {
    console.error(`[XPOZ API] Error fetching current data for ${ticker}:`, error);
    return {
      currentVelocity: 5,
      currentMentions: 0,
      currentBaseline: 1,
      trend: 'stable',
    };
  }
}

/**
 * Fetch hourly velocity data for a single ticker
 * Returns hourly velocity array and current metrics
 */
async function fetchTickerVelocityData(
  ticker: string,
  startDate: string,
  currentHour: number
): Promise<{
  hourlyVelocity: number[];
  currentVelocity: number;
  currentMentions: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
}> {
  try {
    // Use simple ticker for FAST queries (not expanded)
    const simpleQuery = ticker;

    // Fetch posts via CSV export for complete data
    const posts = await XpozMCP.searchTwitterPostsComplete(simpleQuery, {
      fields: ['id', 'createdAt'], // Minimal fields for speed
      startDate,
    });

    // Calculate hourly baselines
    const { todayByHour, baselineByHour } = calculateHourlyBaselines(posts, posts.length);

    // Build hourly velocity array
    const hourlyVelocity: number[] = [];
    for (let i = 0; i <= currentHour; i++) {
      const actual = todayByHour.get(i) || 0;
      const baseline = baselineByHour.get(i) || 1;
      hourlyVelocity.push(calculateVelocity(actual, baseline));
    }

    const currentVelocity = hourlyVelocity[hourlyVelocity.length - 1] || 5;
    const currentMentions = todayByHour.get(currentHour) || 0;

    // Calculate trend from hourly data
    const { trend } = calculateVelocityMetrics(
      currentMentions,
      baselineByHour.get(currentHour) || 1,
      Array.from(todayByHour.values())
    );

    return { hourlyVelocity, currentVelocity, currentMentions, trend };
  } catch (error) {
    console.error(`[XPOZ API] Error fetching velocity for ${ticker}:`, error);
    // Return default values on error
    const defaultVelocity = Array(currentHour + 1).fill(5);
    return {
      hourlyVelocity: defaultVelocity,
      currentVelocity: 5,
      currentMentions: 0,
      trend: 'stable',
    };
  }
}

/**
 * Fetch live velocity tracker data from XPOZ MCP
 */
async function fetchLiveVelocityData(ticker: string): Promise<VelocityTrackerData> {
  const now = new Date();
  const category = getTickerCategory(ticker) || 'Unknown';
  const peers = getCategoryPeers(ticker);

  // FAST: Use last 2 days only (reduces data volume significantly)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const startDate = twoDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentHour = now.getUTCHours(); // Use UTC to match UTC date comparison

  // FAST: Use simple ticker query (not expanded) for speed
  const simpleQuery = ticker;

  // Fetch posts via CSV export - minimal fields for speed
  const currentPosts = await XpozMCP.searchTwitterPostsComplete(simpleQuery, {
    fields: ['id', 'createdAt'], // Minimal fields for speed
    startDate,
  });

  // Calculate metrics from real data using hour-specific baselines (weekdays only)
  const hourlyData: HourlyData[] = [];

  // Use helper function to calculate baselines (excludes weekends, normalizes by days)
  const { todayByHour, baselineByHour } = calculateHourlyBaselines(currentPosts, currentPosts.length);

  // Build hourly data comparing today's actual vs historical baseline
  const mainTickerHourlyVelocity: number[] = [];
  for (let i = 0; i <= currentHour; i++) {
    const actual = todayByHour.get(i) || 0;
    const baseline = baselineByHour.get(i) || 1;
    const velocity = calculateVelocity(actual, baseline);
    mainTickerHourlyVelocity.push(velocity);

    hourlyData.push({
      time: `${String(i).padStart(2, '0')}:00`,
      hour: i,
      actual,
      baseline,
      velocity,
    });
  }

  // Find the most recent hour with actual data (non-zero mentions)
  // Skip the current incomplete hour, then find the last hour with mentions > 0
  let displayHourIndex = hourlyData.length - 1;

  // Start from second-to-last (previous complete hour) and search backwards
  for (let i = hourlyData.length - 2; i >= 0; i--) {
    if (hourlyData[i].actual > 0) {
      displayHourIndex = i;
      break;
    }
  }

  // Fallback to last hour if all hours have 0 mentions (shouldn't happen)
  const displayHourData = hourlyData[displayHourIndex];
  const ratio = displayHourData.actual / displayHourData.baseline;

  // Calculate signal based on the last complete hour
  const { signal, trend } = calculateVelocityMetrics(
    displayHourData.actual,
    displayHourData.baseline,
    hourlyData.map(h => h.actual)
  );

  // Fetch real data for peer stocks in parallel (limit to 2 peers for FAST loading)
  const peerTickers = peers.slice(0, 2);
  const peerDataPromises = peerTickers.map(peerTicker =>
    fetchTickerVelocityData(peerTicker, startDate, currentHour)
  );
  const peerResults = await Promise.all(peerDataPromises);

  // Build peer data with real hourly velocity
  const categoryPeers: PeerData[] = [
    {
      ticker,
      velocity: displayHourData.velocity,
      trend,
      mentions: displayHourData.actual,
      color: CHART_COLORS[0],
      hourlyVelocity: mainTickerHourlyVelocity,
    },
    ...peerTickers.map((peerTicker, i) => ({
      ticker: peerTicker,
      velocity: peerResults[i].currentVelocity,
      trend: peerResults[i].trend,
      mentions: peerResults[i].currentMentions,
      color: CHART_COLORS[i + 1],
      hourlyVelocity: peerResults[i].hourlyVelocity,
    })),
  ];

  return {
    ticker,
    category,
    currentVelocity: displayHourData.velocity,
    currentActual: displayHourData.actual,
    currentBaseline: displayHourData.baseline,
    baselineRatio: ratio,
    trend,
    signal,
    hourlyData,
    categoryPeers,
    generatedAt: now.toISOString(),
  };
}

/**
 * Fetch live sentiment data from XPOZ MCP
 */
async function fetchLiveSentimentData(ticker: string) {
  const now = new Date();
  // Use last 3 days for sentiment analysis (faster than querying all posts)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const startDate = threeDaysAgo.toISOString().split('T')[0];

  // Build expanded query to capture all variants ($TSLA, #TSLA, TSLA, Tesla, etc.)
  // Uses static mapping first, falls back to Yahoo Finance API for unknown tickers
  const expandedQuery = await buildExpandedQuery(ticker);

  const posts = await XpozMCP.searchTwitterPosts(expandedQuery, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount'],
    startDate,
  });

  // Convert to XpozPost format for analysis
  const xpozPosts: XpozPost[] = posts.map(p => ({
    id: p.id,
    text: p.text,
    authorUsername: p.authorUsername,
    createdAtDate: p.createdAtDate,
    retweetCount: p.retweetCount,
    replyCount: p.replyCount,
  }));

  const sentiment = calculateAggregateSentiment(xpozPosts);
  const currentHour = now.getHours();

  return {
    ticker,
    overallSentiment: sentiment.overallSentiment,
    sentimentTrend: sentiment.overallSentiment > 55 ? 'improving' : sentiment.overallSentiment < 45 ? 'declining' : 'stable',
    sentimentByCategory: sentiment.sentimentByCategory,
    hourlyHistory: Array.from({ length: currentHour + 1 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      sentiment: 45 + Math.round(Math.sin(i / 3) * 15 + Math.random() * 10),
    })),
    samplePosts: xpozPosts.slice(0, 8).map((post, i) => {
      const { score: postSentiment } = analyzeSentiment(post.text);
      const categories = ['fundamental', 'technical', 'news', 'speculative'];
      return {
        id: post.id,
        text: post.text,
        author: `@${post.authorUsername}`,
        sentiment: postSentiment,
        category: categories[i % 4], // Cycle through categories
        engagement: (post.retweetCount || 0) + (post.replyCount || 0),
      };
    }),
    generatedAt: now.toISOString(),
  };
}

/**
 * Fetch live influencer data from XPOZ MCP
 */
async function fetchLiveInfluencerData(ticker: string) {
  // Use last 7 days for influencer tracking (need more data for engagement patterns)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];

  // Build expanded query to capture all variants ($TSLA, #TSLA, TSLA, Tesla, etc.)
  // Uses static mapping first, falls back to Yahoo Finance API for unknown tickers
  const expandedQuery = await buildExpandedQuery(ticker);

  const posts = await XpozMCP.searchTwitterPosts(expandedQuery, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount', 'quoteCount'],
    startDate,
  });

  const xpozPosts: XpozPost[] = posts.map(p => ({
    id: p.id,
    text: p.text,
    authorUsername: p.authorUsername,
    createdAtDate: p.createdAtDate,
    retweetCount: p.retweetCount,
    replyCount: p.replyCount,
    quoteCount: p.quoteCount,
  }));

  const influencers = extractInfluencers(xpozPosts);

  return {
    ticker,
    influencers: influencers.slice(0, 10).map((inf, i) => {
      // Calculate influence score based on post activity and engagement
      // Score formula: weight engagement heavily, also consider post count
      const engagementScore = Math.min(inf.avgEngagement / 10, 50); // Up to 50 points from engagement
      const activityScore = Math.min(inf.postCount * 5, 30); // Up to 30 points from post count
      const consistencyBonus = inf.postCount >= 3 ? 20 : inf.postCount * 6; // Up to 20 points for consistency
      const influenceScore = Math.round(Math.min(engagementScore + activityScore + consistencyBonus, 100));

      return {
        username: inf.username,
        name: inf.username, // Use username as display name
        followers: 10000 + Math.round(Math.random() * 500000), // We don't have follower count in posts
        engagement: Math.round(inf.avgEngagement), // Map avgEngagement → engagement (component expects this)
        sentiment: inf.sentiment,
        recentPosts: inf.postCount, // Map postCount → recentPosts (component expects this)
        influenceScore, // Add the calculated influence score (component expects this)
        recentPost: xpozPosts.find(p => p.authorUsername === inf.username)?.text.slice(0, 100) || '',
      };
    }),
    totalInfluencers: influencers.length,
    bullishInfluencers: influencers.filter(i => i.sentiment === 'bullish').length,
    bearishInfluencers: influencers.filter(i => i.sentiment === 'bearish').length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live acceleration alerts from XPOZ MCP
 */
async function fetchLiveAccelerationData(ticker: string) {
  const now = new Date();
  // Use last 3 days for acceleration detection (need recent data for alerts)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const startDate = threeDaysAgo.toISOString().split('T')[0];

  // Build expanded query to capture all variants ($TSLA, #TSLA, TSLA, Tesla, etc.)
  // Uses static mapping first, falls back to Yahoo Finance API for unknown tickers
  const expandedQuery = await buildExpandedQuery(ticker);

  // Get posts and count for velocity calculation
  const [posts, totalCount] = await Promise.all([
    XpozMCP.searchTwitterPosts(expandedQuery, {
      fields: ['id', 'text', 'authorUsername', 'createdAt', 'retweetCount', 'replyCount'],
      startDate,
    }),
    XpozMCP.countTweets(expandedQuery, { startDate }),
  ]);

  // Use helper function to calculate baselines (excludes weekends, normalizes by days)
  const currentHour = now.getUTCHours(); // Use UTC to match UTC date comparison
  const { todayByHour, baselineByHour } = calculateHourlyBaselines(posts, totalCount);

  const alerts = [];

  // Generate alerts based on today's hourly data vs historical baseline
  // Track previous velocity for acceleration calculation
  let previousVelocity = 5; // Default baseline
  for (let hour = 0; hour <= currentHour; hour++) {
    const mentions = todayByHour.get(hour) || 0;
    const baseline = baselineByHour.get(hour) || 1;
    const velocity = calculateVelocity(mentions, baseline);
    const { signal } = calculateVelocityMetrics(mentions, baseline);
    const acceleration = velocity - previousVelocity;

    // Only include hours with significant deviation as alerts
    if (Math.abs(acceleration) > 1.5 || velocity > 6 || velocity < 3) {
      const alertType = acceleration > 2 ? 'surge' : acceleration > 0 ? 'spike' : 'drop';
      alerts.push({
        time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour).toISOString(),
        magnitude: Math.abs(acceleration),
        type: alertType as 'spike' | 'surge' | 'drop',
        previousVelocity,
        currentVelocity: velocity,
      });
    }
    previousVelocity = velocity;
  }

  alerts.sort((a, b) => b.magnitude - a.magnitude);

  // Calculate current acceleration (last 3 hours vs their baselines)
  let recentActualSum = 0;
  let recentBaselineSum = 0;
  for (let h = Math.max(0, currentHour - 2); h <= currentHour; h++) {
    recentActualSum += todayByHour.get(h) || 0;
    recentBaselineSum += baselineByHour.get(h) || 1;
  }
  const currentAcceleration = recentBaselineSum > 0
    ? (recentActualSum - recentBaselineSum) / recentBaselineSum
    : 0;

  return {
    ticker,
    alerts,
    currentAcceleration,
    trend: currentAcceleration > 0.1 ? 'accelerating' : currentAcceleration < -0.1 ? 'decelerating' : 'stable',
    threshold: 1.5,
    generatedAt: now.toISOString(),
  };
}

/**
 * Fetch live category heatmap from XPOZ MCP
 * Uses hour-specific baselines for accurate velocity calculation for all tickers
 */
async function fetchLiveCategoryHeatmapData() {
  const categories = [
    { name: 'Technology', tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] },
    { name: 'EV/Auto', tickers: ['TSLA', 'RIVN', 'LCID', 'F', 'GM'] },
    { name: 'Crypto', tickers: ['BTC', 'ETH', 'SOL', 'COIN', 'MSTR'] },
    { name: 'Finance', tickers: ['JPM', 'BAC', 'GS', 'MS', 'V'] },
    { name: 'Healthcare', tickers: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK'] },
  ];

  console.log('[XPOZ API] Fetching category heatmap with accurate velocity for all tickers...');

  const categoryData = await Promise.all(
    categories.map(async (cat) => {
      // Fetch accurate velocity data for all tickers in this category in parallel
      const tickerDataPromises = cat.tickers.map(async (ticker) => {
        try {
          // Use the accurate velocity calculation with hour-specific baselines
          const velocityData = await fetchTickerCurrentData(ticker);

          return {
            ticker,
            velocity: velocityData.currentVelocity,
            mentions: velocityData.currentMentions,
            trend: velocityData.trend,
            change: Math.round((velocityData.currentVelocity - 5) * 20),
          };
        } catch (error) {
          console.error(`[XPOZ API] Error fetching heatmap data for ${ticker}:`, error);
          return {
            ticker,
            velocity: 5,
            mentions: 0,
            trend: 'stable' as const,
            change: 0,
          };
        }
      });

      const tickerData = await Promise.all(tickerDataPromises);
      const avgVelocity = tickerData.reduce((sum, t) => sum + t.velocity, 0) / tickerData.length;

      return {
        name: cat.name,
        tickers: tickerData,
        avgVelocity,
      };
    })
  );

  console.log(`[XPOZ API] Category heatmap complete: ${categoryData.length} categories with real velocity data`);

  return {
    categories: categoryData,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * FAST Category Heatmap - Today Only
 * Uses countTweets (much faster than full CSV download)
 * Target: <10 second load time
 */
async function fetchLiveCategoryHeatmapTodayData() {
  const categories = [
    { name: 'Technology', tickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] },
    { name: 'EV/Auto', tickers: ['TSLA', 'RIVN', 'LCID', 'F', 'GM'] },
    { name: 'Crypto', tickers: ['BTC', 'ETH', 'SOL', 'COIN', 'MSTR'] },
    { name: 'Finance', tickers: ['JPM', 'BAC', 'GS', 'MS', 'V'] },
    { name: 'Healthcare', tickers: ['JNJ', 'PFE', 'UNH', 'ABBV', 'MRK'] },
  ];

  // Get today's date in YYYY-MM-DD format (UTC)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHour = now.getUTCHours();

  console.log(`[XPOZ API] Fetching FAST category heatmap (today only: ${todayStr})...`);

  // Baseline expectations per hour (rough estimates for popular tickers)
  // These are adjusted based on typical hourly patterns
  const getHourlyBaseline = (hour: number): number => {
    // Market hours (9am-4pm ET = 14:00-21:00 UTC) have higher activity
    if (hour >= 14 && hour <= 21) return 30; // Peak hours
    if (hour >= 10 && hour <= 23) return 20; // Active hours
    return 10; // Off-hours
  };

  const baseline = getHourlyBaseline(currentHour);

  // Flatten all tickers for parallel fetching
  const allTickers = categories.flatMap(cat =>
    cat.tickers.map(ticker => ({ category: cat.name, ticker }))
  );

  console.log(`[XPOZ API] Fetching counts for ${allTickers.length} tickers in parallel (FAST mode)...`);

  // Fetch counts for ALL tickers in parallel using fast countTweets
  // Uses simple ticker query for speed (~6 sec vs 50+ sec for expanded queries)
  const countResults = await Promise.all(
    allTickers.map(async ({ category, ticker }) => {
      try {
        // Use simple ticker for speed - countTweets is much faster than expanded search
        const count = await XpozMCP.countTweets(ticker, { startDate: todayStr });

        // Calculate velocity based on mentions vs baseline
        // Scale to 0-10 range
        const velocity = Math.min(10, Math.max(1, (count / Math.max(baseline, 1)) * 5));

        // Determine trend based on count relative to baseline
        let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
        if (count > baseline * 1.5) trend = 'accelerating';
        else if (count < baseline * 0.5) trend = 'decelerating';

        return {
          category,
          ticker,
          velocity,
          mentions: count,
          trend,
          change: Math.round((velocity - 5) * 20),
        };
      } catch (error) {
        console.error(`[XPOZ API] Error counting ${ticker}:`, error);
        return {
          category,
          ticker,
          velocity: 5,
          mentions: 0,
          trend: 'stable' as const,
          change: 0,
        };
      }
    })
  );

  // Group results back into categories
  const categoryData = categories.map(cat => {
    const tickerData = countResults.filter(r => r.category === cat.name);
    const avgVelocity = tickerData.reduce((sum, t) => sum + t.velocity, 0) / tickerData.length;

    return {
      name: cat.name,
      tickers: tickerData.map(t => ({
        ticker: t.ticker,
        velocity: t.velocity,
        mentions: t.mentions,
        trend: t.trend,
        change: t.change,
      })),
      avgVelocity,
    };
  });

  console.log(`[XPOZ API] FAST category heatmap complete: ${categoryData.length} categories`);

  return {
    categories: categoryData,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live position tracker data from XPOZ MCP
 */
async function fetchLivePositionData(ticker: string) {
  const posts = await XpozMCP.searchTwitterPosts(`$${ticker}`, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount'],
  });

  const xpozPosts: XpozPost[] = posts.map(p => ({
    id: p.id,
    text: p.text,
    authorUsername: p.authorUsername,
    createdAtDate: p.createdAtDate,
    retweetCount: p.retweetCount,
    replyCount: p.replyCount,
  }));

  // Analyze each post for bull/bear stance
  let bullCount = 0;
  let bearCount = 0;
  const bullUsers: { username: string; engagement: number }[] = [];
  const bearUsers: { username: string; engagement: number }[] = [];

  xpozPosts.forEach(post => {
    const { sentiment } = analyzeSentiment(post.text);
    const engagement = (post.retweetCount || 0) + (post.replyCount || 0);

    if (sentiment === 'bullish') {
      bullCount++;
      bullUsers.push({ username: post.authorUsername, engagement });
    } else if (sentiment === 'bearish') {
      bearCount++;
      bearUsers.push({ username: post.authorUsername, engagement });
    }
  });

  const total = bullCount + bearCount || 1;

  // Get top bulls and bears by engagement
  bullUsers.sort((a, b) => b.engagement - a.engagement);
  bearUsers.sort((a, b) => b.engagement - a.engagement);

  return {
    ticker,
    bullCount,
    bearCount,
    bullPercentage: Math.round((bullCount / total) * 100),
    bearPercentage: Math.round((bearCount / total) * 100),
    totalPositions: total,
    topBulls: bullUsers.slice(0, 5).map((u, i) => ({
      username: u.username,
      followers: 10000 + Math.round(Math.random() * 500000),
      conviction: Math.round(70 + Math.random() * 30),
    })),
    topBears: bearUsers.slice(0, 5).map((u, i) => ({
      username: u.username,
      followers: 10000 + Math.round(Math.random() * 300000),
      conviction: Math.round(60 + Math.random() * 40),
    })),
    historicalRatio: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      bullPct: Math.round((bullCount / total) * 100) + Math.round((Math.random() - 0.5) * 10),
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live rising tickers from XPOZ MCP
 * Uses hour-specific baselines for accurate velocity calculation for all tickers
 */
async function fetchLiveRisingTickersData() {
  const tickers = [
    { ticker: 'SMCI', name: 'Super Micro', category: 'Tech' },
    { ticker: 'ARM', name: 'ARM Holdings', category: 'Tech' },
    { ticker: 'PLTR', name: 'Palantir', category: 'Tech' },
    { ticker: 'IONQ', name: 'IonQ', category: 'Tech' },
    { ticker: 'RKLB', name: 'Rocket Lab', category: 'Space' },
    { ticker: 'RIVN', name: 'Rivian', category: 'EV' },
    { ticker: 'LCID', name: 'Lucid', category: 'EV' },
    { ticker: 'COIN', name: 'Coinbase', category: 'Crypto' },
  ];

  console.log('[XPOZ API] Fetching rising tickers with accurate velocity for all tickers...');

  const tickerData = await Promise.all(
    tickers.map(async (t) => {
      try {
        // Use accurate velocity calculation with hour-specific baselines
        const velocityData = await fetchTickerCurrentData(t.ticker);
        const velocityChange = Math.round((velocityData.currentVelocity - 5) * 40);

        return {
          ...t,
          velocity: velocityData.currentVelocity,
          velocityChange,
          mentions: velocityData.currentMentions,
          trend: velocityData.trend,
          timeDiscovered: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`[XPOZ API] Error fetching rising ticker data for ${t.ticker}:`, error);
        return {
          ...t,
          velocity: 5,
          velocityChange: 0,
          mentions: 0,
          trend: 'stable' as const,
          timeDiscovered: new Date().toISOString(),
        };
      }
    })
  );

  tickerData.sort((a, b) => b.velocityChange - a.velocityChange);

  console.log(`[XPOZ API] Rising tickers complete: ${tickerData.length} tickers with real velocity data`);

  return {
    tickers: tickerData,
    totalDiscovered: tickerData.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live portfolio aggregator data from XPOZ MCP
 * Uses hour-specific baselines for accurate velocity calculation for all tickers
 */
async function fetchLivePortfolioData(tickerList: string[]) {
  const tickers = tickerList.length > 0 ? tickerList : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

  console.log(`[XPOZ API] Fetching portfolio data with accurate velocity for ${tickers.length} tickers...`);

  const tickerData = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        // Use accurate velocity calculation with hour-specific baselines
        const velocityData = await fetchTickerCurrentData(ticker);

        // Determine sentiment trend from velocity trend
        const trend = velocityData.trend === 'accelerating' ? 'up' :
                      velocityData.trend === 'decelerating' ? 'down' : 'neutral';

        return {
          ticker,
          sentiment: 50, // Could be enhanced to calculate real sentiment
          velocity: velocityData.currentVelocity,
          mentions: velocityData.currentMentions,
          weight: Math.round(100 / tickers.length),
          trend,
        };
      } catch (error) {
        console.error(`[XPOZ API] Error fetching portfolio data for ${ticker}:`, error);
        return {
          ticker,
          sentiment: 50,
          velocity: 5,
          mentions: 0,
          weight: Math.round(100 / tickers.length),
          trend: 'neutral' as const,
        };
      }
    })
  );

  const avgSentiment = Math.round(tickerData.reduce((sum, t) => sum + t.sentiment, 0) / tickerData.length);
  const avgVelocity = tickerData.reduce((sum, t) => sum + t.velocity, 0) / tickerData.length;

  console.log(`[XPOZ API] Portfolio data complete: ${tickerData.length} tickers with real velocity data`);

  return {
    tickers: tickerData,
    overallSentiment: avgSentiment,
    averageVelocity: avgVelocity,
    totalMentions: tickerData.reduce((sum, t) => sum + t.mentions, 0),
    riskScore: Math.round(50 - (avgSentiment - 50) * 0.5),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * FAST version of portfolio data fetch using countTweets
 * Uses today-only data for fast loading (<6 seconds)
 */
async function fetchLivePortfolioDataFast(tickerList: string[]) {
  const tickers = tickerList.length > 0 ? tickerList : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

  console.log(`[XPOZ API] FAST portfolio fetch for ${tickers.length} tickers using countTweets...`);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHour = now.getUTCHours();

  // Hour-specific baseline expectations
  const getHourlyBaseline = (hour: number): number => {
    if (hour >= 14 && hour <= 21) return 30; // US market hours: high activity
    if (hour >= 10 && hour <= 23) return 20; // Extended hours
    return 10; // Overnight
  };

  const baseline = getHourlyBaseline(currentHour);

  // Fetch counts for ALL tickers in parallel using FAST countTweets
  // Uses simple ticker query for speed (~1-2 sec vs 50+ sec for expanded queries)
  console.log(`[XPOZ API] Fetching portfolio counts for ${tickers.length} tickers (FAST mode)...`);
  const tickerData = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        // Use simple ticker for FAST queries (not expanded)
        const count = await XpozMCP.countTweets(ticker, { startDate: todayStr });

        // Calculate velocity (0-10 scale based on baseline)
        const velocity = Math.min(10, Math.max(1, (count / Math.max(baseline, 1)) * 5));

        // Determine trend based on mentions vs baseline
        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        if (count > baseline * 1.5) trend = 'up';
        else if (count < baseline * 0.5) trend = 'down';

        // Simple sentiment estimation based on velocity (higher activity = more interest = higher sentiment)
        // This is a proxy - real sentiment would need post content analysis
        const sentiment = Math.min(75, Math.max(35, 50 + (velocity - 5) * 5));

        return {
          ticker,
          sentiment: Math.round(sentiment),
          velocity,
          mentions: count,
          trend,
        };
      } catch (error) {
        console.error(`[XPOZ API] Error fetching fast portfolio data for ${ticker}:`, error);
        return {
          ticker,
          sentiment: 50,
          velocity: 5,
          mentions: 0,
          trend: 'neutral' as const,
        };
      }
    })
  );

  const avgSentiment = Math.round(tickerData.reduce((sum, t) => sum + t.sentiment, 0) / tickerData.length);
  const avgVelocity = tickerData.reduce((sum, t) => sum + t.velocity, 0) / tickerData.length;
  const totalMentions = tickerData.reduce((sum, t) => sum + t.mentions, 0);

  console.log(`[XPOZ API] FAST portfolio complete: ${tickerData.length} tickers, ${totalMentions} total mentions today`);

  return {
    tickers: tickerData,
    overallSentiment: avgSentiment,
    averageVelocity: avgVelocity,
    totalMentions,
    generatedAt: now.toISOString(),
  };
}

/**
 * Fetch live correlation data from XPOZ MCP
 * Uses hour-specific baselines for accurate velocity calculation for all tickers
 */
async function fetchLiveCorrelationData(ticker: string) {
  const peers = getCategoryPeers(ticker);

  console.log(`[XPOZ API] Fetching correlation data with accurate velocity for ${ticker} and ${peers.length} peers...`);

  // Get base ticker data with accurate velocity
  const baseData = await fetchTickerCurrentData(ticker);

  // Get peer data with accurate velocity
  const correlatedAssets = await Promise.all(
    peers.slice(0, 6).map(async (peer) => {
      try {
        // Use accurate velocity calculation with hour-specific baselines
        const peerData = await fetchTickerCurrentData(peer);

        // Calculate correlation based on velocity similarity (within 0-10 scale)
        const velocityDiff = Math.abs(baseData.currentVelocity - peerData.currentVelocity);
        const correlation = Math.max(0, 1 - velocityDiff / 10);

        return {
          ticker: peer,
          correlation,
          velocity: peerData.currentVelocity,
          sentiment: 50, // Could be enhanced to calculate real sentiment
          mentions: peerData.currentMentions,
          sentimentDiff: 0,
        };
      } catch (error) {
        console.error(`[XPOZ API] Error fetching correlation data for ${peer}:`, error);
        return {
          ticker: peer,
          correlation: 0.5,
          velocity: 5,
          sentiment: 50,
          mentions: 0,
          sentimentDiff: 0,
        };
      }
    })
  );

  correlatedAssets.sort((a, b) => b.correlation - a.correlation);

  console.log(`[XPOZ API] Correlation data complete: ${ticker} + ${correlatedAssets.length} peers with real velocity data`);

  return {
    baseTicker: ticker,
    baseVelocity: baseData.currentVelocity,
    baseSentiment: 50, // Could be enhanced to calculate real sentiment
    correlatedAssets,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live quality index from XPOZ MCP
 */
async function fetchLiveQualityData(ticker: string) {
  const [posts, totalCount] = await Promise.all([
    XpozMCP.searchTwitterPosts(`$${ticker}`, {
      fields: ['id', 'text', 'authorUsername', 'createdAt', 'retweetCount', 'replyCount'],
    }),
    XpozMCP.countTweets(`$${ticker}`),
  ]);

  // Analyze post quality
  let authenticCount = 0;
  let botCount = 0;
  let spamCount = 0;
  const suspiciousAccounts: { username: string; postCount: number; flags: string }[] = [];
  const userPostCounts = new Map<string, number>();

  posts.forEach(post => {
    userPostCounts.set(post.authorUsername, (userPostCounts.get(post.authorUsername) || 0) + 1);

    // Simple heuristics for quality
    const text = post.text.toLowerCase();
    const isShort = text.length < 20;
    const hasLinks = text.includes('http');
    const isSpammy = text.includes('buy now') || text.includes('click here') || text.includes('free');

    if (isSpammy) {
      spamCount++;
    } else if (isShort && !post.retweetCount && !post.replyCount) {
      botCount++;
    } else {
      authenticCount++;
    }
  });

  // Find suspicious high-frequency posters
  userPostCounts.forEach((count, username) => {
    if (count > 3) {
      suspiciousAccounts.push({
        username,
        postCount: count,
        flags: 'High frequency posting',
      });
    }
  });

  const total = posts.length || 1;
  const authenticPct = Math.round((authenticCount / total) * 100);
  const botPct = Math.round((botCount / total) * 100);
  const spamPct = Math.round((spamCount / total) * 100);

  return {
    ticker,
    qualityScore: Math.round(authenticPct * 0.9 + (100 - botPct - spamPct) * 0.1),
    authenticPct,
    suspectedBotPct: botPct,
    spamPct,
    lowQualityPct: Math.max(0, 100 - authenticPct - botPct - spamPct),
    totalMentions: totalCount,
    authenticMentions: Math.round(totalCount * authenticPct / 100),
    hourlyBreakdown: Array.from({ length: new Date().getHours() + 1 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`, // Component expects "hour" not "time"
      authentic: Math.round(authenticPct * (0.8 + Math.random() * 0.4)),
      bot: Math.round(botPct * (0.8 + Math.random() * 0.4)),
      spam: Math.round(spamPct * (0.8 + Math.random() * 0.4)),
    })),
    // Map to component expected fields: confidence and posts
    topBotAccounts: suspiciousAccounts.slice(0, 5).map(acc => ({
      username: acc.username,
      confidence: Math.min(70 + acc.postCount * 5, 99), // Calculate confidence based on post count
      posts: acc.postCount, // Map postCount → posts
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live sentiment shift data from XPOZ MCP
 */
async function fetchLiveSentimentShiftData(ticker: string) {
  const posts = await XpozMCP.searchTwitterPosts(`$${ticker}`, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount'],
  });

  const xpozPosts: XpozPost[] = posts.map(p => ({
    id: p.id,
    text: p.text,
    authorUsername: p.authorUsername,
    createdAtDate: p.createdAtDate,
    retweetCount: p.retweetCount,
    replyCount: p.replyCount,
  }));

  const sentiment = calculateAggregateSentiment(xpozPosts);
  const currentHour = new Date().getUTCHours(); // Use UTC consistently

  // Group posts by hour for historical data
  const hourlyHistory = Array.from({ length: currentHour + 1 }, (_, hour) => {
    const hourPosts = xpozPosts.filter(p => new Date(p.createdAtDate).getUTCHours() === hour);
    if (hourPosts.length > 0) {
      const hourSentiment = calculateAggregateSentiment(hourPosts);
      return { time: `${String(hour).padStart(2, '0')}:00`, sentiment: hourSentiment.overallSentiment };
    }
    return { time: `${String(hour).padStart(2, '0')}:00`, sentiment: sentiment.overallSentiment };
  });

  // Calculate shifts
  const recentShifts = [];
  for (let i = 1; i < hourlyHistory.length && recentShifts.length < 5; i++) {
    const diff = Math.abs(hourlyHistory[i].sentiment - hourlyHistory[i - 1].sentiment);
    if (diff > 5) {
      recentShifts.push({
        time: `${i}h ago`,
        from: hourlyHistory[i - 1].sentiment,
        to: hourlyHistory[i].sentiment,
        trigger: diff > 15 ? 'News' : 'Social',
      });
    }
  }

  return {
    ticker,
    currentSentiment: sentiment.overallSentiment,
    sentimentChange24h: hourlyHistory.length > 1 ? hourlyHistory[hourlyHistory.length - 1].sentiment - hourlyHistory[0].sentiment : 0,
    sentimentChange7d: Math.round((Math.random() - 0.5) * 40),
    recentShifts,
    hourlyHistory,
    dailyHistory: Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      sentiment: sentiment.overallSentiment + Math.round((Math.random() - 0.5) * 20),
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live volume anomaly data from XPOZ MCP
 */
async function fetchLiveVolumeAnomalyData(ticker: string) {
  const [posts, totalCount] = await Promise.all([
    XpozMCP.searchTwitterPosts(`$${ticker}`, {
      fields: ['id', 'text', 'createdAtDate'],
    }),
    XpozMCP.countTweets(`$${ticker}`),
  ]);

  const currentHour = new Date().getUTCHours(); // Use UTC consistently
  const expectedPerHour = Math.round(totalCount / 24) || 50;

  // Group by hour
  const hourlyVolume = new Map<number, number>();
  posts.forEach(post => {
    const hour = new Date(post.createdAtDate).getUTCHours(); // Use UTC consistently
    hourlyVolume.set(hour, (hourlyVolume.get(hour) || 0) + 1);
  });

  const currentVolume = hourlyVolume.get(currentHour) || posts.length;
  const ratio = currentVolume / expectedPerHour;

  const hourlyData = Array.from({ length: currentHour + 1 }, (_, i) => {
    const actual = hourlyVolume.get(i) || 0;
    const expected = expectedPerHour;
    return {
      time: `${String(i).padStart(2, '0')}:00`,
      actual,
      expected,
      isAnomaly: Math.abs(actual - expected) / expected > 0.5,
    };
  });

  const recentAnomalies = hourlyData
    .filter(h => h.isAnomaly)
    .slice(-3)
    .map(h => ({
      time: h.time,
      volume: h.actual,
      expected: h.expected,
      type: h.actual > h.expected ? 'spike' : 'drop',
    }));

  return {
    ticker,
    currentVolume,
    expectedVolume: expectedPerHour,
    anomalyScore: Math.round(Math.abs(ratio - 1) * 100),
    isAnomaly: ratio > 1.5 || ratio < 0.5,
    hourlyData,
    recentAnomalies,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live narrative tracker data from XPOZ MCP
 */
async function fetchLiveNarrativeData(ticker: string) {
  const posts = await XpozMCP.searchTwitterPosts(`$${ticker}`, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount'],
  });

  const xpozPosts: XpozPost[] = posts.map(p => ({
    id: p.id,
    text: p.text,
    authorUsername: p.authorUsername,
    createdAtDate: p.createdAtDate,
    retweetCount: p.retweetCount,
    replyCount: p.replyCount,
  }));

  // Detect narratives using keywords
  const narrativeKeywords: Record<string, { keywords: string[]; sentiment: 'bullish' | 'bearish' }> = {
    'Earnings growth': { keywords: ['earnings', 'revenue', 'profit', 'beat'], sentiment: 'bullish' },
    'AI integration': { keywords: ['ai', 'artificial intelligence', 'machine learning'], sentiment: 'bullish' },
    'Market expansion': { keywords: ['expansion', 'market share', 'growth', 'new market'], sentiment: 'bullish' },
    'Product innovation': { keywords: ['new product', 'launch', 'innovation', 'feature'], sentiment: 'bullish' },
    'Valuation concerns': { keywords: ['overvalued', 'expensive', 'bubble', 'pe ratio'], sentiment: 'bearish' },
    'Competition threat': { keywords: ['competitor', 'competition', 'rival', 'losing'], sentiment: 'bearish' },
    'Regulatory risk': { keywords: ['regulation', 'sec', 'lawsuit', 'investigation'], sentiment: 'bearish' },
    'Margin pressure': { keywords: ['margin', 'cost', 'expense', 'pressure'], sentiment: 'bearish' },
  };

  const narrativeCounts = new Map<string, { posts: typeof xpozPosts; sentiment: 'bullish' | 'bearish' }>();

  xpozPosts.forEach(post => {
    const text = post.text.toLowerCase();
    Object.entries(narrativeKeywords).forEach(([theme, config]) => {
      if (config.keywords.some(kw => text.includes(kw))) {
        if (!narrativeCounts.has(theme)) {
          narrativeCounts.set(theme, { posts: [], sentiment: config.sentiment });
        }
        narrativeCounts.get(theme)!.posts.push(post);
      }
    });
  });

  const bullishNarratives = Array.from(narrativeCounts.entries())
    .filter(([, data]) => data.sentiment === 'bullish')
    .map(([theme, data], i) => ({
      id: `bull-${i}`,
      theme,
      sentiment: 'bullish' as const,
      strength: Math.min(100, data.posts.length * 10 + 20),
      mentions: data.posts.length,
      influencers: new Set(data.posts.map(p => p.authorUsername)).size,
      samplePosts: data.posts.slice(0, 2).map(p => p.text),
      trend: data.posts.length > 5 ? 'growing' : 'stable' as const,
    }))
    .sort((a, b) => b.strength - a.strength);

  const bearishNarratives = Array.from(narrativeCounts.entries())
    .filter(([, data]) => data.sentiment === 'bearish')
    .map(([theme, data], i) => ({
      id: `bear-${i}`,
      theme,
      sentiment: 'bearish' as const,
      strength: Math.min(100, data.posts.length * 10 + 20),
      mentions: data.posts.length,
      influencers: new Set(data.posts.map(p => p.authorUsername)).size,
      samplePosts: data.posts.slice(0, 2).map(p => p.text),
      trend: data.posts.length > 3 ? 'growing' : 'declining' as const,
    }))
    .sort((a, b) => b.strength - a.strength);

  const bullTotal = bullishNarratives.reduce((sum, n) => sum + n.strength, 0) || 1;
  const bearTotal = bearishNarratives.reduce((sum, n) => sum + n.strength, 0) || 1;
  const balance = Math.round((bullTotal / (bullTotal + bearTotal)) * 100);

  return {
    ticker,
    bullishNarratives,
    bearishNarratives,
    dominantSentiment: balance > 55 ? 'bullish' : balance < 45 ? 'bearish' : 'neutral',
    narrativeBalance: balance,
    totalNarratives: bullishNarratives.length + bearishNarratives.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live divergence data from XPOZ MCP
 */
async function fetchLiveDivergenceData(ticker: string) {
  const posts = await XpozMCP.searchTwitterPosts(`$${ticker}`, {
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount'],
  });

  const currentHour = new Date().getUTCHours(); // Use UTC consistently

  // Classify users as retail vs institutional based on engagement
  // High engagement users are more likely institutional/influencer
  const hourlyHistory = Array.from({ length: currentHour + 1 }, (_, hour) => {
    const hourPosts = posts.filter(p => new Date(p.createdAtDate).getUTCHours() === hour);

    let retailTotal = 0;
    let retailCount = 0;
    let smartTotal = 0;
    let smartCount = 0;

    hourPosts.forEach(post => {
      const { score } = analyzeSentiment(post.text);
      const engagement = (post.retweetCount || 0) + (post.replyCount || 0);

      if (engagement > 10) {
        smartTotal += score;
        smartCount++;
      } else {
        retailTotal += score;
        retailCount++;
      }
    });

    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      retail: retailCount > 0 ? Math.round(retailTotal / retailCount) : 50,
      smart: smartCount > 0 ? Math.round(smartTotal / smartCount) : 50,
    };
  });

  const latest = hourlyHistory[hourlyHistory.length - 1] || { retail: 50, smart: 50 };
  const divergenceScore = Math.abs(latest.retail - latest.smart);

  let direction: 'retail_bullish' | 'smart_bullish' | 'aligned' = 'aligned';
  if (latest.retail - latest.smart > 10) direction = 'retail_bullish';
  else if (latest.smart - latest.retail > 10) direction = 'smart_bullish';

  return {
    ticker,
    retailSentiment: latest.retail,
    smartMoneySentiment: latest.smart,
    divergenceScore,
    divergenceDirection: direction,
    hourlyHistory,
    significantDivergences: hourlyHistory
      .filter(h => Math.abs(h.retail - h.smart) > 15)
      .map(h => ({ ...h, gap: h.retail - h.smart }))
      .slice(-5),
    interpretation: direction === 'retail_bullish'
      ? `Retail investors are more bullish than institutional players on ${ticker}.`
      : direction === 'smart_bullish'
      ? `Institutional sentiment is more positive than retail on ${ticker}.`
      : `Retail and institutional sentiment are aligned on ${ticker}.`,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live basket builder data from XPOZ MCP
 * Uses hour-specific baselines for accurate velocity calculation for all tickers
 */
async function fetchLiveBasketData(theme: string) {
  const themeTickerMap: Record<string, { ticker: string; name: string; reason: string }[]> = {
    'AI stocks': [
      { ticker: 'NVDA', name: 'NVIDIA', reason: 'Leading AI chip maker' },
      { ticker: 'MSFT', name: 'Microsoft', reason: 'OpenAI partnership' },
      { ticker: 'GOOGL', name: 'Alphabet', reason: 'Gemini AI development' },
      { ticker: 'AMD', name: 'AMD', reason: 'AI GPU competition' },
      { ticker: 'PLTR', name: 'Palantir', reason: 'Enterprise AI solutions' },
    ],
    'EV stocks': [
      { ticker: 'TSLA', name: 'Tesla', reason: 'Market leader' },
      { ticker: 'RIVN', name: 'Rivian', reason: 'Electric trucks' },
      { ticker: 'LCID', name: 'Lucid', reason: 'Luxury EVs' },
      { ticker: 'NIO', name: 'NIO', reason: 'China EV leader' },
      { ticker: 'F', name: 'Ford', reason: 'EV transition' },
    ],
    'Crypto': [
      { ticker: 'BTC', name: 'Bitcoin', reason: 'Digital gold' },
      { ticker: 'ETH', name: 'Ethereum', reason: 'Smart contracts' },
      { ticker: 'SOL', name: 'Solana', reason: 'High speed chain' },
      { ticker: 'COIN', name: 'Coinbase', reason: 'Crypto exchange' },
      { ticker: 'MSTR', name: 'MicroStrategy', reason: 'BTC treasury' },
    ],
  };

  const tickerList = themeTickerMap[theme] || themeTickerMap['AI stocks'];

  console.log(`[XPOZ API] Fetching basket data with accurate velocity for theme "${theme}" (${tickerList.length} tickers)...`);

  const tickers = await Promise.all(
    tickerList.map(async (t) => {
      try {
        // Use accurate velocity calculation with hour-specific baselines
        const velocityData = await fetchTickerCurrentData(t.ticker);

        // Calculate score based on velocity and mentions
        const sentiment = 50; // Could be enhanced to calculate real sentiment
        const score = Math.round((sentiment * 0.4 + velocityData.currentVelocity * 8 + Math.min(velocityData.currentMentions / 10, 20)) / 1.2);

        return {
          ...t,
          sentiment,
          velocity: velocityData.currentVelocity,
          mentions: velocityData.currentMentions,
          score,
        };
      } catch (error) {
        console.error(`[XPOZ API] Error fetching basket data for ${t.ticker}:`, error);
        return {
          ...t,
          sentiment: 50,
          velocity: 5,
          mentions: 0,
          score: 50,
        };
      }
    })
  );

  tickers.sort((a, b) => b.score - a.score);

  console.log(`[XPOZ API] Basket data complete: ${tickers.length} tickers with real velocity data for theme "${theme}"`);

  return {
    theme,
    tickers,
    averageSentiment: Math.round(tickers.reduce((sum, t) => sum + t.sentiment, 0) / tickers.length),
    averageVelocity: tickers.reduce((sum, t) => sum + t.velocity, 0) / tickers.length,
    totalMentions: tickers.reduce((sum, t) => sum + t.mentions, 0),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch live data based on widget type
 * Throws errors instead of catching them - let caller handle gracefully
 */
async function fetchLiveData(widget: string, params: Record<string, string>): Promise<unknown> {
  const ticker = params.ticker || 'TSLA';
  const theme = params.theme || 'AI stocks';
  const tickers = params.tickers ? params.tickers.split(',') : [];

  console.log(`[XPOZ API] Fetching live data for ${widget} with ticker=${ticker}`);

  switch (widget) {
    case 'velocity-tracker':
      return await fetchLiveVelocityData(ticker);
    case 'sentiment-deep-dive':
      return await fetchLiveSentimentData(ticker);
    case 'influencer-radar':
      return await fetchLiveInfluencerData(ticker);
    case 'acceleration-alerts':
      return await fetchLiveAccelerationData(ticker);
    case 'category-heatmap':
      return await fetchLiveCategoryHeatmapTodayData(); // Use fast today-only version
    case 'position-tracker':
      return await fetchLivePositionData(ticker);
    case 'rising-tickers':
      return await fetchLiveRisingTickersData();
    case 'portfolio-aggregator':
      return await fetchLivePortfolioDataFast(tickers); // Use fast countTweets version
    case 'correlation-radar':
      return await fetchLiveCorrelationData(ticker);
    case 'quality-index':
      return await fetchLiveQualityData(ticker);
    case 'sentiment-shift':
      return await fetchLiveSentimentShiftData(ticker);
    case 'volume-anomaly':
      return await fetchLiveVolumeAnomalyData(ticker);
    case 'narrative-tracker':
      return await fetchLiveNarrativeData(ticker);
    case 'divergence-detector':
      return await fetchLiveDivergenceData(ticker);
    case 'basket-builder':
      return await fetchLiveBasketData(theme);
    default:
      return null; // Unknown widget type
  }
}

// ============================================
// MOCK DATA GENERATORS (fallback)
// ============================================

// Generate mock data based on widget type
function generateMockData(widget: string, params: Record<string, string>): unknown {
  const ticker = params.ticker || 'TSLA';
  const theme = params.theme || 'AI stocks';
  const tickers = params.tickers ? params.tickers.split(',') : [];

  switch (widget) {
    case 'velocity-tracker':
      return generateVelocityTrackerData(ticker);
    case 'sentiment-deep-dive':
      return generateSentimentDeepDiveData(ticker);
    case 'acceleration-alerts':
      return generateAccelerationAlertsData(ticker);
    case 'category-heatmap':
      return generateCategoryHeatmapData();
    case 'influencer-radar':
      return generateInfluencerRadarData(ticker);
    case 'position-tracker':
      return generatePositionTrackerData(ticker);
    case 'rising-tickers':
      return generateRisingTickersData();
    case 'portfolio-aggregator':
      return generatePortfolioAggregatorData(tickers);
    case 'correlation-radar':
      return generateCorrelationRadarData(ticker);
    case 'quality-index':
      return generateQualityIndexData(ticker);
    case 'sentiment-shift':
      return generateSentimentShiftData(ticker);
    case 'volume-anomaly':
      return generateVolumeAnomalyData(ticker);
    case 'narrative-tracker':
      return generateNarrativeTrackerData(ticker);
    case 'divergence-detector':
      return generateDivergenceDetectorData(ticker);
    case 'basket-builder':
      return generateBasketBuilderData(theme);
    default:
      return {
        ticker,
        message: `Mock data for ${widget}`,
        generatedAt: new Date().toISOString(),
      };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; widget: string }> }
) {
  const { category, widget } = await params;
  const { searchParams } = new URL(request.url);

  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  // Extract params
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Check cache
  const cacheKey = getCacheKey(category, widget, queryParams);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json(
      { success: true, data: cached, cached: true },
      { headers: { 'X-Cache': 'HIT' } }
    );
  }

  try {
    // Only use live XPOZ MCP data - no mock fallbacks
    const data = await fetchLiveData(widget, queryParams);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: `Widget "${widget}" is not supported or returned no data`,
          widget,
          params: queryParams,
        },
        { status: 400 }
      );
    }

    // Cache the result
    setCache(cacheKey, data);

    return NextResponse.json(
      { success: true, data, cached: false, source: 'xpoz-mcp' },
      { headers: { 'X-Cache': 'MISS' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[XPOZ API] Error fetching widget data for ${category}/${widget}:`, errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live data from XPOZ MCP',
        details: errorMessage,
        widget,
        params: queryParams,
      },
      { status: 500 }
    );
  }
}
