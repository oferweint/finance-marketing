/**
 * XPOZ MCP Integration Layer
 *
 * This module provides integration with the XPOZ MCP server for real-time
 * social media data (Twitter/X, Instagram, TikTok).
 *
 * XPOZ MCP provides:
 * - 1.5B+ indexed social posts
 * - No API rate limits
 * - Real-time sentiment and velocity data
 *
 * @see https://xpoz.ai
 */

// Data types matching XPOZ MCP response structures
export interface XpozPost {
  id: string;
  text: string;
  authorUsername: string;
  authorId?: string;
  createdAtDate: string;
  retweetCount: number;
  replyCount: number;
  quoteCount?: number;
  impressionCount?: number;
  bookmarkCount?: number;
  hashtags?: string[];
  mentions?: string[];
  lang?: string;
}

export interface XpozUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  followersCount: number;
  followingCount: number;
  tweetCount?: number;
  verified?: boolean;
  verifiedType?: string;
  profileImageUrl?: string;
}

export interface XpozPaginatedResponse<T> {
  results: T[];
  pagination: {
    totalRows: number;
    totalPages: number;
    resultsCount: number;
    pageSize: number;
    tableName: string;
  };
  dataDumpExportOperationId?: string;
}

// Sentiment analysis utilities
export type SentimentType = 'bullish' | 'bearish' | 'neutral';

const BULLISH_KEYWORDS = [
  'buy', 'long', 'bullish', 'moon', 'rocket', '🚀', 'calls', 'breaking out',
  'undervalued', 'accumulate', 'strong', 'growth', 'beat', 'upgrade', 'target',
  'all time high', 'ath', 'green', 'pump', 'rally', 'up', 'gain', 'winner'
];

const BEARISH_KEYWORDS = [
  'sell', 'short', 'bearish', 'puts', 'crash', 'dump', 'overvalued',
  'downgrade', 'weak', 'decline', 'loss', 'red', 'drop', 'fall', 'down',
  'warning', 'risk', 'avoid', 'bubble', 'correction', 'bear'
];

/**
 * Analyze sentiment of a post based on keywords
 */
export function analyzeSentiment(text: string): { sentiment: SentimentType; score: number } {
  const lowerText = text.toLowerCase();

  let bullishScore = 0;
  let bearishScore = 0;

  BULLISH_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) bullishScore++;
  });

  BEARISH_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) bearishScore++;
  });

  const total = bullishScore + bearishScore;
  if (total === 0) {
    return { sentiment: 'neutral', score: 50 };
  }

  const score = Math.round((bullishScore / total) * 100);

  if (score >= 60) return { sentiment: 'bullish', score };
  if (score <= 40) return { sentiment: 'bearish', score };
  return { sentiment: 'neutral', score };
}

/**
 * Calculate aggregate sentiment from multiple posts
 */
export function calculateAggregateSentiment(posts: XpozPost[]): {
  overallSentiment: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  sentimentByCategory: Record<string, number>;
} {
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;
  let totalScore = 0;

  posts.forEach(post => {
    const { sentiment, score } = analyzeSentiment(post.text);
    totalScore += score;

    if (sentiment === 'bullish') bullishCount++;
    else if (sentiment === 'bearish') bearishCount++;
    else neutralCount++;
  });

  const overallSentiment = posts.length > 0 ? Math.round(totalScore / posts.length) : 50;

  return {
    overallSentiment,
    bullishCount,
    bearishCount,
    neutralCount,
    sentimentByCategory: {
      fundamental: 40 + Math.round(overallSentiment * 0.3),
      technical: 45 + Math.round(overallSentiment * 0.25),
      news: 35 + Math.round(overallSentiment * 0.35),
      speculative: 30 + Math.round(overallSentiment * 0.4),
    }
  };
}

/**
 * Calculate velocity metrics from post counts
 */
export function calculateVelocityMetrics(
  currentCount: number,
  baselineCount: number,
  historicalCounts?: number[]
): {
  velocity: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
  signal: 'VERY_HIGH' | 'HIGH_ACTIVITY' | 'ELEVATED' | 'NORMAL' | 'LOW';
  baselineRatio: number;
} {
  const baselineRatio = baselineCount > 0 ? currentCount / baselineCount : 1;

  // Velocity on 0-10 scale
  const velocity = Math.min(10, Math.max(0, baselineRatio * 5));

  // Determine signal
  let signal: 'VERY_HIGH' | 'HIGH_ACTIVITY' | 'ELEVATED' | 'NORMAL' | 'LOW' = 'NORMAL';
  if (baselineRatio > 2) signal = 'VERY_HIGH';
  else if (baselineRatio > 1.5) signal = 'HIGH_ACTIVITY';
  else if (baselineRatio > 1.2) signal = 'ELEVATED';
  else if (baselineRatio < 0.8) signal = 'LOW';

  // Determine trend from historical data
  let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
  if (historicalCounts && historicalCounts.length >= 3) {
    const recent = historicalCounts.slice(-3);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / 3;
    const earlier = historicalCounts.slice(-6, -3);
    const avgEarlier = earlier.length > 0
      ? earlier.reduce((a, b) => a + b, 0) / earlier.length
      : avgRecent;

    if (avgRecent > avgEarlier * 1.1) trend = 'accelerating';
    else if (avgRecent < avgEarlier * 0.9) trend = 'decelerating';
  }

  return { velocity, trend, signal, baselineRatio };
}

/**
 * Extract influencers from posts based on engagement
 */
export function extractInfluencers(posts: XpozPost[]): {
  username: string;
  postCount: number;
  totalEngagement: number;
  avgEngagement: number;
  sentiment: SentimentType;
}[] {
  const userStats = new Map<string, {
    postCount: number;
    totalEngagement: number;
    sentimentScores: number[];
  }>();

  posts.forEach(post => {
    const engagement = (post.retweetCount || 0) + (post.replyCount || 0) + (post.quoteCount || 0);
    const { score } = analyzeSentiment(post.text);

    const existing = userStats.get(post.authorUsername) || {
      postCount: 0,
      totalEngagement: 0,
      sentimentScores: []
    };

    existing.postCount++;
    existing.totalEngagement += engagement;
    existing.sentimentScores.push(score);

    userStats.set(post.authorUsername, existing);
  });

  return Array.from(userStats.entries())
    .map(([username, stats]) => {
      const avgSentiment = stats.sentimentScores.reduce((a, b) => a + b, 0) / stats.sentimentScores.length;
      let sentiment: SentimentType = 'neutral';
      if (avgSentiment >= 60) sentiment = 'bullish';
      else if (avgSentiment <= 40) sentiment = 'bearish';

      return {
        username,
        postCount: stats.postCount,
        totalEngagement: stats.totalEngagement,
        avgEngagement: Math.round(stats.totalEngagement / stats.postCount),
        sentiment
      };
    })
    .sort((a, b) => b.totalEngagement - a.totalEngagement);
}

/**
 * Group posts by time periods for charting
 */
export function groupPostsByHour(posts: XpozPost[]): Map<number, XpozPost[]> {
  const grouped = new Map<number, XpozPost[]>();

  posts.forEach(post => {
    const date = new Date(post.createdAtDate);
    const hour = date.getHours();

    const existing = grouped.get(hour) || [];
    existing.push(post);
    grouped.set(hour, existing);
  });

  return grouped;
}

/**
 * Detect narrative themes from posts
 */
export function detectNarratives(posts: XpozPost[]): {
  theme: string;
  sentiment: SentimentType;
  count: number;
  samplePosts: string[];
}[] {
  const themes = new Map<string, { posts: XpozPost[]; sentiment: SentimentType }>();

  const themeKeywords: Record<string, string[]> = {
    'Earnings/Financials': ['earnings', 'revenue', 'profit', 'eps', 'quarter', 'financial'],
    'Product/Innovation': ['product', 'launch', 'new', 'innovation', 'feature', 'update'],
    'Competition': ['competitor', 'market share', 'vs', 'compared', 'rival'],
    'Leadership': ['ceo', 'founder', 'management', 'executive', 'leadership'],
    'Valuation': ['overvalued', 'undervalued', 'pe ratio', 'price target', 'valuation'],
    'Technical Analysis': ['chart', 'support', 'resistance', 'breakout', 'pattern', 'moving average'],
    'Momentum/FOMO': ['moon', 'rocket', 'fomo', 'yolo', 'ape', 'diamond hands'],
    'Risk/Warning': ['risk', 'warning', 'caution', 'bubble', 'crash', 'sell off']
  };

  posts.forEach(post => {
    const lowerText = post.text.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(kw => lowerText.includes(kw))) {
        const existing = themes.get(theme) || { posts: [], sentiment: 'neutral' as SentimentType };
        existing.posts.push(post);
        themes.set(theme, existing);
      }
    });
  });

  return Array.from(themes.entries())
    .map(([theme, data]) => {
      const sentiments = data.posts.map(p => analyzeSentiment(p.text));
      const avgScore = sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length;

      let sentiment: SentimentType = 'neutral';
      if (avgScore >= 60) sentiment = 'bullish';
      else if (avgScore <= 40) sentiment = 'bearish';

      return {
        theme,
        sentiment,
        count: data.posts.length,
        samplePosts: data.posts.slice(0, 3).map(p => p.text)
      };
    })
    .filter(n => n.count >= 2)
    .sort((a, b) => b.count - a.count);
}

/**
 * XPOZ MCP Query builder for common widget patterns
 */
export const XpozQueries = {
  /**
   * Build query for ticker mentions
   */
  tickerMentions: (ticker: string) => ({
    query: `$${ticker} OR #${ticker}`,
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount', 'quoteCount']
  }),

  /**
   * Build query for sentiment analysis
   */
  sentimentAnalysis: (ticker: string) => ({
    query: `$${ticker}`,
    fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount', 'replyCount']
  }),

  /**
   * Build query for influencer tracking
   */
  influencerTracking: (ticker: string) => ({
    query: `$${ticker}`,
    fields: ['id', 'text', 'authorUsername', 'authorId', 'createdAtDate', 'retweetCount', 'replyCount', 'quoteCount', 'impressionCount']
  })
};

// Export default configuration
export const XPOZ_CONFIG = {
  baseUrl: 'https://xpoz.ai',
  helpUrl: 'https://help.xpoz.ai',
  // Cache TTL in milliseconds
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  // Default page size
  pageSize: 100,
  // Rate limit (requests per hour)
  rateLimit: 100
};
