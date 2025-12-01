import { NextRequest, NextResponse } from 'next/server';
import { buildExpandedQuery, getTickerCategory, getCategoryPeers } from '@/lib/query-expansion';
import { CHART_COLORS, calculateVelocity } from '@/lib/theme';
import { HourlyData, PeerData, Signal, VelocityTrackerData } from '@/types/widgets';

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

// Generate mock data based on widget type
function generateMockData(widget: string, params: Record<string, string>): unknown {
  const ticker = params.ticker || 'TSLA';

  switch (widget) {
    case 'velocity-tracker':
      return generateVelocityTrackerData(ticker);

    // Add other widget generators here as needed
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
    // For now, generate mock data
    // TODO: Replace with actual MCP proxy calls
    const data = generateMockData(widget, queryParams);

    // Cache the result
    setCache(cacheKey, data);

    return NextResponse.json(
      { success: true, data, cached: false },
      { headers: { 'X-Cache': 'MISS' } }
    );
  } catch (error) {
    console.error(`Error generating widget data for ${category}/${widget}:`, error);
    return NextResponse.json(
      { error: 'Failed to generate widget data' },
      { status: 500 }
    );
  }
}
