// Widget types for the platform

export type WidgetCategory = 'finance' | 'marketing' | 'travel' | 'healthcare';

export type FinanceWidgetType =
  | 'velocity-tracker'
  | 'acceleration-alerts'
  | 'category-heatmap'
  | 'influencer-radar'
  | 'position-tracker'
  | 'rising-tickers'
  | 'sentiment-deep-dive'
  | 'portfolio-aggregator'
  | 'correlation-radar'
  | 'quality-index'
  | 'sentiment-shift'
  | 'volume-anomaly'
  | 'narrative-tracker'
  | 'divergence-detector'
  | 'basket-builder';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  inputs: WidgetInput[];
  requiresTicker?: boolean;
  supportsTickers?: boolean;
}

export interface WidgetInput {
  name: string;
  type: 'ticker' | 'tickers' | 'category' | 'theme' | 'text';
  required: boolean;
  placeholder?: string;
}

// Common data structures
export interface HourlyData {
  time: string;
  hour: number;
  actual: number;
  baseline: number;
  velocity: number;
}

export interface PeerData {
  ticker: string;
  velocity: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
  mentions: number;
  color: string;
  hourlyVelocity?: number[]; // Velocity for each hour (index 0 = hour 0, etc.)
}

export type Signal = 'VERY_HIGH' | 'HIGH_ACTIVITY' | 'ELEVATED' | 'NORMAL' | 'LOW';
export type Trend = 'accelerating' | 'decelerating' | 'stable';

// Velocity Tracker types
export interface VelocityTrackerData {
  ticker: string;
  category: string;
  currentVelocity: number;
  currentActual: number;
  currentBaseline: number;
  baselineRatio: number;
  trend: Trend;
  signal: Signal;
  hourlyData: HourlyData[];
  categoryPeers: PeerData[];
  generatedAt: string;
}

// Acceleration Alerts types
export interface AccelerationAlertsData {
  ticker: string;
  alerts: AccelerationAlert[];
  currentAcceleration: number;
  trend: Trend;
  generatedAt: string;
}

export interface AccelerationAlert {
  time: string;
  magnitude: number;
  type: 'spike' | 'surge' | 'drop';
  previousVelocity: number;
  currentVelocity: number;
}

// Category Heatmap types
export interface CategoryHeatmapData {
  categories: CategoryData[];
  generatedAt: string;
}

export interface CategoryData {
  name: string;
  avgVelocity: number;
  tickers: TickerHeat[];
}

export interface TickerHeat {
  ticker: string;
  velocity: number;
  mentions: number;
  trend: Trend;
}

// Influencer Radar types
export interface InfluencerRadarData {
  ticker: string;
  influencers: Influencer[];
  totalInfluencers: number;
  generatedAt: string;
}

export interface Influencer {
  username: string;
  name: string;
  followers: number;
  engagement: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recentPosts: number;
  influenceScore: number;
}

// Sentiment Deep Dive types
export interface SentimentDeepDiveData {
  ticker: string;
  overallSentiment: number;
  sentimentByCategory: {
    fundamental: number;
    technical: number;
    news: number;
    speculative: number;
  };
  samplePosts: SentimentPost[];
  generatedAt: string;
}

export interface SentimentPost {
  id: string;
  text: string;
  author: string;
  sentiment: number;
  category: string;
  engagement: number;
}

// API Response types
export interface WidgetApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached: boolean;
  generatedAt: string;
}

// Widget registry
export const FINANCE_WIDGETS: Record<FinanceWidgetType, WidgetConfig> = {
  'velocity-tracker': {
    id: 'velocity-tracker',
    name: 'Velocity Tracker',
    description: 'Track real-time social mention velocity for any ticker',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'TSLA' }],
  },
  'acceleration-alerts': {
    id: 'acceleration-alerts',
    name: 'Acceleration Alerts',
    description: 'Detect sudden spikes in social mentions',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'NVDA' }],
  },
  'category-heatmap': {
    id: 'category-heatmap',
    name: 'Category Heatmap',
    description: 'Visual heatmap of social velocity across sectors',
    category: 'finance',
    inputs: [],
  },
  'influencer-radar': {
    id: 'influencer-radar',
    name: 'Influencer Radar',
    description: 'Find top voices discussing any ticker',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'BTC' }],
  },
  'position-tracker': {
    id: 'position-tracker',
    name: 'Position Tracker',
    description: 'Track bull/bear positions from influencers',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'AAPL' }],
  },
  'rising-tickers': {
    id: 'rising-tickers',
    name: 'Rising Tickers',
    description: 'Discover emerging assets gaining attention',
    category: 'finance',
    inputs: [{ name: 'category', type: 'category', required: false, placeholder: 'crypto' }],
  },
  'sentiment-deep-dive': {
    id: 'sentiment-deep-dive',
    name: 'Sentiment Deep Dive',
    description: 'Multi-dimensional sentiment analysis',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'GOOGL' }],
  },
  'portfolio-aggregator': {
    id: 'portfolio-aggregator',
    name: 'Portfolio Aggregator',
    description: 'Analyze sentiment across multiple holdings',
    category: 'finance',
    inputs: [{ name: 'tickers', type: 'tickers', required: true, placeholder: 'TSLA,NVDA,AAPL' }],
  },
  'correlation-radar': {
    id: 'correlation-radar',
    name: 'Correlation Radar',
    description: 'Find correlated assets by social sentiment',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'BTC' }],
  },
  'quality-index': {
    id: 'quality-index',
    name: 'Quality Index',
    description: 'Detect bot activity and spam in mentions',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'DOGE' }],
  },
  'sentiment-shift': {
    id: 'sentiment-shift',
    name: 'Sentiment Shift',
    description: 'Detect sentiment reversals and changes',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'META' }],
  },
  'volume-anomaly': {
    id: 'volume-anomaly',
    name: 'Volume Anomaly',
    description: 'Detect unusual patterns in mention volume',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'COIN' }],
  },
  'narrative-tracker': {
    id: 'narrative-tracker',
    name: 'Narrative Tracker',
    description: 'Track competing bull/bear narratives',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'NVDA' }],
  },
  'divergence-detector': {
    id: 'divergence-detector',
    name: 'Divergence Detector',
    description: 'Find retail vs smart money sentiment gaps',
    category: 'finance',
    inputs: [{ name: 'ticker', type: 'ticker', required: true, placeholder: 'TSLA' }],
  },
  'basket-builder': {
    id: 'basket-builder',
    name: 'Basket Builder',
    description: 'Build thematic portfolios by sentiment',
    category: 'finance',
    inputs: [{ name: 'theme', type: 'theme', required: true, placeholder: 'AI stocks' }],
  },
};

// Helper function to check if a widget ID is valid
export function isValidFinanceWidget(id: string): id is FinanceWidgetType {
  return id in FINANCE_WIDGETS;
}

// Helper function to get a widget config safely
export function getFinanceWidgetConfig(id: string): WidgetConfig | undefined {
  if (isValidFinanceWidget(id)) {
    return FINANCE_WIDGETS[id];
  }
  return undefined;
}
