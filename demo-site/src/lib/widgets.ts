export interface Widget {
  id: string
  name: string
  shortName: string
  description: string
  category: 'velocity' | 'sentiment' | 'discovery' | 'portfolio'
  icon: string
  features: string[]
  inputExample: Record<string, unknown>
  outputPreview: string
}

export const widgets: Widget[] = [
  {
    id: 'velocity-tracker',
    name: 'Discussion Velocity Tracker',
    shortName: 'Velocity',
    description: 'Track the rate of social mentions for any asset over time. Detect when mindshare is growing or declining before price moves.',
    category: 'velocity',
    icon: 'activity',
    features: ['Velocity score (1-10)', 'Trend direction', 'Acceleration detection', 'Signal classification'],
    inputExample: { asset: 'TSLA', hours_back: 168 },
    outputPreview: 'velocity_score: 8.5, signal: HIGH_ACTIVITY'
  },
  {
    id: 'acceleration-alerts',
    name: 'Acceleration Alert System',
    shortName: 'Alerts',
    description: 'Detect sudden spikes or drops in discussion velocity. Get early warning of potential market-moving events.',
    category: 'velocity',
    icon: 'zap',
    features: ['Spike detection', 'Alert severity levels', 'Hourly monitoring', 'Threshold customization'],
    inputExample: { assets: ['TSLA', 'NVDA'], threshold: 2.0 },
    outputPreview: 'alerts: [{asset: "TSLA", severity: "HIGH"}]'
  },
  {
    id: 'category-heatmap',
    name: 'Category Velocity Heatmap',
    shortName: 'Heatmap',
    description: 'Visualize discussion velocity across multiple sectors and categories simultaneously.',
    category: 'velocity',
    icon: 'grid-3x3',
    features: ['Sector comparison', 'Heat intensity', 'Trend arrows', 'Interactive grid'],
    inputExample: { categories: ['tech', 'finance', 'energy'] },
    outputPreview: 'sectors: [{name: "tech", heat: 0.85}]'
  },
  {
    id: 'influencer-radar',
    name: 'Sector Influencer Radar',
    shortName: 'Influencers',
    description: 'Identify the most influential voices discussing any asset. Separate real influencers from noise.',
    category: 'discovery',
    icon: 'users',
    features: ['Influence scoring', 'Engagement metrics', 'Tier classification', 'Historical accuracy'],
    inputExample: { asset: 'BTC', min_followers: 10000 },
    outputPreview: 'influencers: [{username: "@analyst", tier: "ELITE"}]'
  },
  {
    id: 'position-tracker',
    name: 'Influencer Position Tracker',
    shortName: 'Positions',
    description: 'Track what positions key influencers are taking on assets. See bull vs bear stances.',
    category: 'discovery',
    icon: 'target',
    features: ['Position detection', 'Conviction scoring', 'Bull/bear ratio', 'Position changes'],
    inputExample: { asset: 'AAPL', timeframe: '7d' },
    outputPreview: 'positions: {bulls: 65%, bears: 35%}'
  },
  {
    id: 'rising-tickers',
    name: 'Rising Ticker Discovery',
    shortName: 'Rising',
    description: 'Discover assets gaining social traction before they become mainstream. Early signal detection.',
    category: 'discovery',
    icon: 'trending-up',
    features: ['Emerging assets', 'Velocity ranking', 'First-mover alerts', 'Sector filtering'],
    inputExample: { sector: 'crypto', min_velocity_change: 50 },
    outputPreview: 'rising: [{ticker: "SOL", change: +180%}]'
  },
  {
    id: 'sentiment-deep-dive',
    name: 'Stock Sentiment Deep Dive',
    shortName: 'Sentiment',
    description: 'Multi-dimensional sentiment analysis breaking down fundamental, technical, news, and speculative sentiment.',
    category: 'sentiment',
    icon: 'pie-chart',
    features: ['4-dimension sentiment', 'Confidence scores', 'Key drivers', 'Sample posts'],
    inputExample: { asset: 'MSFT', hours_back: 72 },
    outputPreview: 'sentiment: {fundamental: 0.72, technical: 0.45}'
  },
  {
    id: 'portfolio-aggregator',
    name: 'Portfolio Sentiment Aggregator',
    shortName: 'Portfolio',
    description: 'Aggregate sentiment analysis across your entire portfolio. Identify risks and opportunities.',
    category: 'portfolio',
    icon: 'briefcase',
    features: ['Holdings analysis', 'Risk scoring', 'Opportunity flags', 'Correlation warnings'],
    inputExample: { holdings: ['AAPL', 'MSFT', 'GOOGL'] },
    outputPreview: 'portfolio_sentiment: 0.65, risks: 2'
  },
  {
    id: 'correlation-radar',
    name: 'Cross-Asset Correlation Radar',
    shortName: 'Correlation',
    description: 'Detect social sentiment correlations between assets. Find hidden connections and divergences.',
    category: 'portfolio',
    icon: 'git-branch',
    features: ['Correlation matrix', 'Cluster detection', 'Divergence alerts', 'Historical patterns'],
    inputExample: { assets: ['TSLA', 'RIVN', 'LCID'] },
    outputPreview: 'correlations: [{pair: "TSLA-RIVN", r: 0.78}]'
  },
  {
    id: 'quality-index',
    name: 'Mention Quality Index',
    shortName: 'Quality',
    description: 'Assess the quality and authenticity of social mentions. Filter signal from noise.',
    category: 'sentiment',
    icon: 'shield-check',
    features: ['Quality scoring', 'Bot detection', 'Authenticity metrics', 'Source credibility'],
    inputExample: { asset: 'GME', sample_size: 500 },
    outputPreview: 'quality_index: 7.2, bot_ratio: 12%'
  },
  {
    id: 'sentiment-shift',
    name: 'Sentiment Shift Detector',
    shortName: 'Shifts',
    description: 'Detect significant changes in sentiment over time. Catch reversals early.',
    category: 'sentiment',
    icon: 'refresh-cw',
    features: ['Shift detection', 'Before/after comparison', 'Catalyst identification', 'Trend reversal signals'],
    inputExample: { asset: 'NVDA', lookback_days: 14 },
    outputPreview: 'shift: {direction: "bullish", magnitude: 0.35}'
  },
  {
    id: 'volume-anomaly',
    name: 'Volume Anomaly Alert',
    shortName: 'Anomalies',
    description: 'Detect unusual patterns in social discussion volume. Identify potential manipulation or breaking news.',
    category: 'velocity',
    icon: 'alert-triangle',
    features: ['Anomaly detection', 'Pattern classification', 'Confidence scoring', 'Historical comparison'],
    inputExample: { asset: 'AMC', sensitivity: 'high' },
    outputPreview: 'anomalies: [{type: "spike", confidence: 0.92}]'
  },
  {
    id: 'narrative-tracker',
    name: 'Asset Narrative Tracker',
    shortName: 'Narratives',
    description: 'Track competing narratives around an asset. Understand what stories are driving sentiment.',
    category: 'sentiment',
    icon: 'message-square',
    features: ['Narrative extraction', 'Popularity ranking', 'Evolution tracking', 'Consensus detection'],
    inputExample: { asset: 'TSLA', max_narratives: 5 },
    outputPreview: 'narratives: [{theme: "FSD progress", share: 35%}]'
  },
  {
    id: 'divergence-detector',
    name: 'Retail vs Smart Money Divergence',
    shortName: 'Divergence',
    description: 'Detect when retail sentiment diverges from institutional indicators. Find contrarian opportunities.',
    category: 'portfolio',
    icon: 'git-compare',
    features: ['Retail sentiment', 'Smart money proxy', 'Divergence scoring', 'Historical accuracy'],
    inputExample: { asset: 'SPY', lookback: '30d' },
    outputPreview: 'divergence: {retail: "bullish", smart: "bearish"}'
  },
  {
    id: 'basket-builder',
    name: 'Thematic Basket Builder',
    shortName: 'Baskets',
    description: 'Build thematic investment baskets based on social sentiment and narrative analysis.',
    category: 'portfolio',
    icon: 'layers',
    features: ['Theme extraction', 'Asset weighting', 'Sentiment scoring', 'Correlation balancing'],
    inputExample: { theme: 'AI infrastructure', max_assets: 10 },
    outputPreview: 'basket: [{ticker: "NVDA", weight: 25%}]'
  }
]

export const categories = [
  { id: 'all', name: 'All Widgets', count: widgets.length },
  { id: 'velocity', name: 'Velocity', count: widgets.filter(w => w.category === 'velocity').length },
  { id: 'sentiment', name: 'Sentiment', count: widgets.filter(w => w.category === 'sentiment').length },
  { id: 'discovery', name: 'Discovery', count: widgets.filter(w => w.category === 'discovery').length },
  { id: 'portfolio', name: 'Portfolio', count: widgets.filter(w => w.category === 'portfolio').length },
]

export function getWidgetById(id: string): Widget | undefined {
  return widgets.find(w => w.id === id)
}
