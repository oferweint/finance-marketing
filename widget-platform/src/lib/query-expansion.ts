/**
 * Query Expansion for XPOZ API
 *
 * Expands ticker symbols to include company names and variations
 * to capture 5-8x more mentions than ticker-only searches.
 *
 * Supports both static mapping (for speed) and dynamic Yahoo Finance lookup.
 */

// Dynamic cache for ticker lookups (in-memory)
const dynamicTickerCache = new Map<string, string[]>();

/**
 * Fetch company name from Yahoo Finance API (free, no API key required)
 */
async function fetchCompanyNameFromYahoo(ticker: string): Promise<string[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${ticker}&quotesCount=1&newsCount=0`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const quote = data.quotes?.[0];

    if (quote && quote.shortname) {
      const names: string[] = [];

      // Add short name (e.g., "Palantir Technologies")
      if (quote.shortname) names.push(quote.shortname);

      // Add long name if different (e.g., "Palantir Technologies Inc.")
      if (quote.longname && quote.longname !== quote.shortname) {
        names.push(quote.longname);
      }

      // Extract simple company name (first word or two)
      const simpleName = quote.shortname.split(/\s+(Inc|Corp|Ltd|LLC|Technologies|Holdings|Group|Co)\b/i)[0].trim();
      if (simpleName && simpleName !== quote.shortname && simpleName.length > 2) {
        names.push(simpleName);
      }

      return names;
    }
  } catch (error) {
    console.log(`[Query Expansion] Yahoo lookup failed for ${ticker}:`, error);
  }

  return [];
}

// Ticker to company name mapping (static cache for common tickers)
const TICKER_COMPANY_MAP: Record<string, string[]> = {
  // EV / Electric Vehicles
  TSLA: ['Tesla'],
  RIVN: ['Rivian'],
  LCID: ['Lucid', 'Lucid Motors'],
  NIO: ['NIO'],
  XPEV: ['XPeng'],

  // Big Tech / FAANG
  AAPL: ['Apple'],
  GOOGL: ['Google', 'Alphabet'],
  GOOG: ['Google', 'Alphabet'],
  MSFT: ['Microsoft'],
  AMZN: ['Amazon'],
  META: ['Meta', 'Facebook'],
  NFLX: ['Netflix'],

  // AI / Semiconductors
  NVDA: ['NVIDIA', 'Nvidia'],
  AMD: ['AMD', 'Advanced Micro Devices'],
  INTC: ['Intel'],
  AVGO: ['Broadcom'],
  QCOM: ['Qualcomm'],
  TSM: ['TSMC', 'Taiwan Semiconductor'],

  // Crypto
  BTC: ['Bitcoin'],
  ETH: ['Ethereum'],
  SOL: ['Solana'],
  DOGE: ['Dogecoin'],
  XRP: ['Ripple', 'XRP'],
  ADA: ['Cardano'],
  MATIC: ['Polygon'],
  DOT: ['Polkadot'],
  AVAX: ['Avalanche'],
  LINK: ['Chainlink'],
  UNI: ['Uniswap'],
  SHIB: ['Shiba Inu', 'Shib'],

  // Crypto-related stocks
  MSTR: ['MicroStrategy'],
  COIN: ['Coinbase'],
  MARA: ['Marathon Digital'],
  RIOT: ['Riot Platforms', 'Riot Blockchain'],
  HUT: ['Hut 8'],
  CLSK: ['CleanSpark'],

  // Meme Stocks
  GME: ['GameStop'],
  AMC: ['AMC Entertainment', 'AMC Theatres'],
  BBBY: ['Bed Bath Beyond'],
  BB: ['BlackBerry'],
  NOK: ['Nokia'],

  // Fintech
  SQ: ['Square', 'Block'],
  PYPL: ['PayPal'],
  SOFI: ['SoFi'],
  HOOD: ['Robinhood'],
  AFRM: ['Affirm'],

  // Enterprise / Data Analytics
  PLTR: ['Palantir', 'Palantir Technologies'],
  SNOW: ['Snowflake'],
  DDOG: ['Datadog'],
  MDB: ['MongoDB'],
  NET: ['Cloudflare'],
  CRM: ['Salesforce'],
  ORCL: ['Oracle'],
  IBM: ['IBM'],
  NOW: ['ServiceNow'],
  PANW: ['Palo Alto', 'Palo Alto Networks'],

  // Biotech
  MRNA: ['Moderna'],
  BNTX: ['BioNTech'],
  PFE: ['Pfizer'],
  JNJ: ['Johnson Johnson', 'J&J'],
  ABBV: ['AbbVie'],

  // Airlines
  UAL: ['United Airlines'],
  DAL: ['Delta Airlines', 'Delta Air'],
  AAL: ['American Airlines'],
  LUV: ['Southwest Airlines'],
  JBLU: ['JetBlue'],

  // Retail
  WMT: ['Walmart'],
  TGT: ['Target'],
  COST: ['Costco'],
  HD: ['Home Depot'],
  LOW: ["Lowe's", 'Lowes'],

  // Energy
  XOM: ['Exxon', 'ExxonMobil'],
  CVX: ['Chevron'],
  OXY: ['Occidental'],
  SLB: ['Schlumberger'],
  COP: ['ConocoPhillips'],

  // Banks
  JPM: ['JPMorgan', 'Chase'],
  BAC: ['Bank of America', 'BofA'],
  GS: ['Goldman Sachs'],
  MS: ['Morgan Stanley'],
  C: ['Citigroup', 'Citi'],
  WFC: ['Wells Fargo'],
};

// Category mappings
export const CATEGORY_TICKERS: Record<string, string[]> = {
  'EV / Electric Vehicles': ['TSLA', 'RIVN', 'LCID', 'NIO', 'XPEV'],
  'Big Tech / FAANG': ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'],
  'AI / Semiconductors': ['NVDA', 'AMD', 'INTC', 'AVGO', 'QCOM'],
  'Crypto (BTC ecosystem)': ['BTC', 'MSTR', 'COIN', 'MARA', 'RIOT'],
  'Crypto (ETH ecosystem)': ['ETH', 'MATIC', 'ARB', 'OP', 'LDO'],
  'Meme Stocks': ['GME', 'AMC', 'BBBY', 'BB', 'NOK'],
  Fintech: ['SQ', 'PYPL', 'SOFI', 'HOOD', 'AFRM'],
  Biotech: ['MRNA', 'BNTX', 'PFE', 'JNJ', 'ABBV'],
  Airlines: ['UAL', 'DAL', 'AAL', 'LUV', 'JBLU'],
  Retail: ['WMT', 'TGT', 'COST', 'AMZN', 'HD'],
  Energy: ['XOM', 'CVX', 'OXY', 'SLB', 'COP'],
  Banks: ['JPM', 'BAC', 'GS', 'MS', 'C'],
};

/**
 * Build an expanded query for a ticker symbol.
 * Uses static mapping first, then falls back to Yahoo Finance API for unknown tickers.
 *
 * @param ticker - The ticker symbol (e.g., 'TSLA')
 * @returns Expanded query string (e.g., '$TSLA OR #TSLA OR TSLA OR Tesla')
 */
export async function buildExpandedQuery(ticker: string | null): Promise<string> {
  if (!ticker) return '';

  const normalizedTicker = ticker.toUpperCase().replace('$', '').replace('#', '');

  // Try static mapping first (fastest)
  let companyNames = TICKER_COMPANY_MAP[normalizedTicker];

  // Fallback to dynamic lookup if not in static map
  if (!companyNames || companyNames.length === 0) {
    // Check cache first
    if (dynamicTickerCache.has(normalizedTicker)) {
      companyNames = dynamicTickerCache.get(normalizedTicker)!;
      console.log(`[Query Expansion] Cache hit for ${normalizedTicker}:`, companyNames);
    } else {
      // Fetch from Yahoo Finance API
      console.log(`[Query Expansion] Fetching from Yahoo Finance for ${normalizedTicker}...`);
      companyNames = await fetchCompanyNameFromYahoo(normalizedTicker);

      // Cache the result (even if empty, to avoid repeated API calls)
      dynamicTickerCache.set(normalizedTicker, companyNames);

      if (companyNames.length > 0) {
        console.log(`[Query Expansion] Yahoo Finance returned for ${normalizedTicker}:`, companyNames);
      } else {
        console.log(`[Query Expansion] No company name found for ${normalizedTicker}`);
      }
    }
  }

  const parts: string[] = [
    `$${normalizedTicker}`,
    `#${normalizedTicker}`,
    normalizedTicker,
  ];

  // Add company names and hashtags (API is case-insensitive)
  for (const name of companyNames || []) {
    parts.push(name);
    // Add hashtag version for single-word names (e.g., #Tesla, #Bitcoin)
    if (!name.includes(' ')) {
      parts.push(`#${name}`);
    }
  }

  return parts.join(' OR ');
}

/**
 * Get the category for a ticker.
 *
 * @param ticker - The ticker symbol
 * @returns Category name or null if not found
 */
export function getTickerCategory(ticker: string): string | null {
  const normalizedTicker = ticker.toUpperCase().replace('$', '').replace('#', '');

  for (const [category, tickers] of Object.entries(CATEGORY_TICKERS)) {
    if (tickers.includes(normalizedTicker)) {
      return category;
    }
  }

  return null;
}

/**
 * Get peer tickers in the same category.
 *
 * @param ticker - The ticker symbol
 * @returns Array of peer ticker symbols
 */
export function getCategoryPeers(ticker: string): string[] {
  const category = getTickerCategory(ticker);
  if (!category) return [];

  const normalizedTicker = ticker.toUpperCase().replace('$', '').replace('#', '');
  return CATEGORY_TICKERS[category].filter((t) => t !== normalizedTicker);
}

/**
 * Get company names for a ticker.
 *
 * @param ticker - The ticker symbol
 * @returns Array of company names
 */
export function getCompanyNames(ticker: string): string[] {
  const normalizedTicker = ticker.toUpperCase().replace('$', '').replace('#', '');
  return TICKER_COMPANY_MAP[normalizedTicker] || [];
}

/**
 * Normalize a ticker symbol.
 *
 * @param ticker - Raw ticker input
 * @returns Normalized ticker (uppercase, no $ or #)
 */
export function normalizeTicker(ticker: string): string {
  return ticker.toUpperCase().replace('$', '').replace('#', '').trim();
}
