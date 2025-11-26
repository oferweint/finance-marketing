import { NextRequest, NextResponse } from 'next/server'

// Mock data for demo purposes - will be replaced with real widget calls
const mockResponses: Record<string, (params: Record<string, unknown>) => object> = {
  'velocity-tracker': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'TSLA',
    velocity_score: 8.5,
    signal: 'HIGH_ACTIVITY',
    trend: 'accelerating',
    acceleration: {
      is_accelerating: true,
      rate: 1.23
    },
    hourly_breakdown: [
      { hour: 0, mentions: 145, velocity: 7.2 },
      { hour: 1, mentions: 152, velocity: 7.5 },
      { hour: 2, mentions: 189, velocity: 8.1 },
      { hour: 3, mentions: 210, velocity: 8.5 },
    ],
    baseline_comparison: {
      current: 210,
      baseline: 85,
      multiplier: 2.47
    },
    sample_posts: [
      { text: 'TSLA breaking out! New ATH incoming?', engagement: 1250 },
      { text: 'Just loaded up more TSLA, fundamentals are strong', engagement: 890 },
    ]
  }),

  'sentiment-deep-dive': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'TSLA',
    overall_sentiment: {
      score: 0.65,
      label: 'bullish',
      confidence: 0.82
    },
    dimensions: {
      fundamental: { score: 0.72, drivers: ['earnings beat', 'delivery numbers'] },
      technical: { score: 0.45, drivers: ['RSI overbought', 'support holding'] },
      news: { score: 0.78, drivers: ['positive coverage', 'analyst upgrades'] },
      speculative: { score: 0.55, drivers: ['options activity', 'short interest'] }
    },
    sentiment_breakdown: {
      bullish: 65,
      bearish: 20,
      neutral: 15
    }
  }),

  'narrative-tracker': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'TSLA',
    narratives: [
      { theme: 'FSD Progress', share: 35, sentiment: 0.72, trending: true },
      { theme: 'Valuation Concerns', share: 25, sentiment: -0.45, trending: false },
      { theme: 'Energy Business Growth', share: 20, sentiment: 0.68, trending: true },
      { theme: 'Competition from China', share: 12, sentiment: -0.35, trending: false },
      { theme: 'Elon Leadership', share: 8, sentiment: 0.15, trending: false },
    ],
    consensus: 'MIXED',
    dominant_narrative: 'FSD Progress'
  }),

  'influencer-radar': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'TSLA',
    influencers: [
      { username: '@evanalyst', tier: 'ELITE', followers: 250000, engagement_rate: 4.2, accuracy_score: 78 },
      { username: '@teslainvestor', tier: 'HIGH', followers: 125000, engagement_rate: 3.8, accuracy_score: 72 },
      { username: '@stockpicker99', tier: 'MEDIUM', followers: 45000, engagement_rate: 5.1, accuracy_score: 65 },
    ],
    total_influencers_found: 47,
    tier_distribution: { ELITE: 3, HIGH: 12, MEDIUM: 32 }
  }),

  'acceleration-alerts': (params) => ({
    version: '1.0.0',
    alerts: [
      { asset: 'TSLA', severity: 'HIGH', type: 'VELOCITY_SPIKE', multiplier: 2.8, timestamp: new Date().toISOString() },
      { asset: 'NVDA', severity: 'MEDIUM', type: 'ACCELERATION', multiplier: 1.9, timestamp: new Date().toISOString() },
    ],
    monitored_assets: params.assets || ['TSLA', 'NVDA'],
    threshold: params.threshold || 2.0
  }),

  'category-heatmap': () => ({
    version: '1.0.0',
    sectors: [
      { name: 'Technology', heat: 0.85, trend: 'up', top_ticker: 'NVDA' },
      { name: 'Energy', heat: 0.62, trend: 'stable', top_ticker: 'XOM' },
      { name: 'Finance', heat: 0.48, trend: 'down', top_ticker: 'JPM' },
      { name: 'Healthcare', heat: 0.55, trend: 'up', top_ticker: 'UNH' },
      { name: 'Consumer', heat: 0.41, trend: 'stable', top_ticker: 'AMZN' },
    ]
  }),

  'rising-tickers': () => ({
    version: '1.0.0',
    rising: [
      { ticker: 'SOL', velocity_change: 180, current_velocity: 8.2, sector: 'crypto' },
      { ticker: 'PLTR', velocity_change: 125, current_velocity: 7.5, sector: 'tech' },
      { ticker: 'RKLB', velocity_change: 95, current_velocity: 6.8, sector: 'aerospace' },
    ],
    timeframe: '24h'
  }),

  'portfolio-aggregator': (params) => ({
    version: '1.0.0',
    holdings: params.holdings || ['AAPL', 'MSFT', 'GOOGL'],
    portfolio_sentiment: 0.65,
    risk_score: 3.2,
    opportunities: 2,
    risks: 1,
    holdings_analysis: [
      { ticker: 'AAPL', sentiment: 0.72, velocity: 6.5, signal: 'NORMAL' },
      { ticker: 'MSFT', sentiment: 0.68, velocity: 5.8, signal: 'NORMAL' },
      { ticker: 'GOOGL', sentiment: 0.55, velocity: 7.2, signal: 'ELEVATED' },
    ]
  }),

  'correlation-radar': (params) => ({
    version: '1.0.0',
    assets: params.assets || ['TSLA', 'RIVN', 'LCID'],
    correlations: [
      { pair: 'TSLA-RIVN', correlation: 0.78, strength: 'strong' },
      { pair: 'TSLA-LCID', correlation: 0.65, strength: 'moderate' },
      { pair: 'RIVN-LCID', correlation: 0.82, strength: 'strong' },
    ],
    clusters: [{ name: 'EV Cluster', members: ['TSLA', 'RIVN', 'LCID'] }]
  }),

  'quality-index': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'GME',
    quality_index: 7.2,
    bot_ratio: 0.12,
    authenticity_score: 0.88,
    source_breakdown: {
      verified_accounts: 35,
      established_accounts: 45,
      new_accounts: 20
    }
  }),

  'sentiment-shift': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'NVDA',
    shift: {
      direction: 'bullish',
      magnitude: 0.35,
      confidence: 0.78
    },
    before: { sentiment: 0.42, period: '7d ago' },
    after: { sentiment: 0.77, period: 'now' },
    catalyst: 'Earnings beat expectations'
  }),

  'volume-anomaly': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'AMC',
    anomalies: [
      { type: 'SPIKE', confidence: 0.92, timestamp: new Date().toISOString(), multiplier: 3.5 },
    ],
    baseline_volume: 1250,
    current_volume: 4375
  }),

  'divergence-detector': (params) => ({
    version: '1.0.0',
    asset: params.asset || 'SPY',
    divergence: {
      retail_sentiment: 'bullish',
      smart_money_proxy: 'bearish',
      divergence_score: 0.65
    },
    historical_accuracy: 0.72,
    signal: 'POTENTIAL_REVERSAL'
  }),

  'basket-builder': (params) => ({
    version: '1.0.0',
    theme: params.theme || 'AI infrastructure',
    basket: [
      { ticker: 'NVDA', weight: 25, sentiment: 0.78, rationale: 'GPU leader' },
      { ticker: 'AMD', weight: 20, sentiment: 0.65, rationale: 'Alternative chips' },
      { ticker: 'MSFT', weight: 18, sentiment: 0.72, rationale: 'Azure AI' },
      { ticker: 'GOOGL', weight: 15, sentiment: 0.68, rationale: 'Cloud + AI' },
      { ticker: 'AMZN', weight: 12, sentiment: 0.62, rationale: 'AWS AI services' },
      { ticker: 'META', weight: 10, sentiment: 0.58, rationale: 'AI investments' },
    ],
    basket_sentiment: 0.67,
    correlation_score: 0.72
  }),
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    const mockFn = mockResponses[id]
    if (!mockFn) {
      return NextResponse.json(
        { error: `Widget '${id}' not found` },
        { status: 404 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const response = mockFn(body)
    return NextResponse.json(response)
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const mockFn = mockResponses[id]
  if (!mockFn) {
    return NextResponse.json(
      { error: `Widget '${id}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    widget: id,
    description: `Mock endpoint for ${id}`,
    method: 'POST',
    example_body: { asset: 'TSLA' }
  })
}
