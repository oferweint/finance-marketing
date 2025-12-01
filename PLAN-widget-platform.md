# Widget Platform Architecture Plan

## Overview

Build a web platform to host portable React widgets with:
- Finance category (15 widgets from existing skills)
- Embeddable widgets (iframe/script tag)
- Manual refresh button
- Auto-refresh every 30 minutes
- Same design/colors from existing templates
- Extensible for future categories (Marketing, Travel, Healthcare)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Widget Platform                              │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App (Vercel)                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Website   │  │  Embed API  │  │     Widget Gallery      │ │
│  │  /widgets   │  │  /embed/*   │  │  /finance, /marketing   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (/api)                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/widgets/[category]/[widget]                        │   │
│  │  - Calls XPOZ API                                        │   │
│  │  - Returns JSON data for widgets                         │   │
│  │  - Caching layer (Redis/Vercel KV)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  React Widget Components                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  src/widgets/finance/                                     │  │
│  │    VelocityTracker.tsx                                    │  │
│  │    AccelerationAlerts.tsx                                 │  │
│  │    CategoryHeatmap.tsx                                    │  │
│  │    ... (15 widgets)                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  XPOZ API (External)                                            │
│  - Twitter data via REST API                                    │
│  - Authentication via API key                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
widget-platform/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── (categories)/
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx      # Finance category page
│   │   │   │   └── [widget]/
│   │   │   │       └── page.tsx  # Individual widget page
│   │   │   └── marketing/        # Future
│   │   ├── embed/
│   │   │   └── [category]/
│   │   │       └── [widget]/
│   │   │           └── page.tsx  # Embed-only view (no chrome)
│   │   └── api/
│   │       └── widgets/
│   │           └── [category]/
│   │               └── [widget]/
│   │                   └── route.ts  # API endpoint
│   ├── components/
│   │   ├── ui/                   # Shared UI components
│   │   │   ├── Card.tsx
│   │   │   ├── RefreshButton.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── CategoryNav.tsx
│   │   └── widgets/
│   │       ├── WidgetWrapper.tsx     # HOC with refresh/auto-update
│   │       ├── WidgetEmbed.tsx       # Embed container
│   │       └── finance/
│   │           ├── VelocityTracker.tsx
│   │           ├── AccelerationAlerts.tsx
│   │           ├── CategoryHeatmap.tsx
│   │           ├── InfluencerRadar.tsx
│   │           ├── PositionTracker.tsx
│   │           ├── RisingTickers.tsx
│   │           ├── SentimentDeepDive.tsx
│   │           ├── PortfolioAggregator.tsx
│   │           ├── CorrelationRadar.tsx
│   │           ├── QualityIndex.tsx
│   │           ├── SentimentShift.tsx
│   │           ├── VolumeAnomaly.tsx
│   │           ├── NarrativeTracker.tsx
│   │           ├── DivergenceDetector.tsx
│   │           └── BasketBuilder.tsx
│   ├── lib/
│   │   ├── xpoz-client.ts        # XPOZ API client
│   │   ├── cache.ts              # Caching utilities
│   │   ├── ticker-normalizer.ts  # Port from Python
│   │   └── query-expansion.ts    # Query expansion logic
│   ├── hooks/
│   │   ├── useWidgetData.ts      # Data fetching hook
│   │   └── useAutoRefresh.ts     # Auto-refresh hook
│   └── types/
│       └── widgets.ts            # TypeScript types
├── public/
│   └── embed.js                  # Embeddable script
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## Key Components

### 1. Widget Wrapper (with Refresh/Auto-Update)

```tsx
// src/components/widgets/WidgetWrapper.tsx
interface WidgetWrapperProps {
  category: string;
  widget: string;
  ticker?: string;
  autoRefresh?: boolean;         // Enable 30-min auto-refresh
  refreshInterval?: number;      // Default: 30 minutes
  children: (data: any, isLoading: boolean, refresh: () => void) => ReactNode;
}

function WidgetWrapper({
  category,
  widget,
  ticker,
  autoRefresh = false,
  refreshInterval = 30 * 60 * 1000, // 30 minutes
  children
}: WidgetWrapperProps) {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['widget', category, widget, ticker],
    queryFn: () => fetchWidgetData(category, widget, ticker),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="widget-container">
      {/* Header with refresh controls */}
      <div className="widget-header">
        <span className="last-updated">
          Updated: {formatTime(dataUpdatedAt)}
        </span>
        <div className="controls">
          <button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
            />
            Auto (30min)
          </label>
        </div>
      </div>

      {/* Widget content */}
      {children(data, isLoading, refetch)}
    </div>
  );
}
```

### 2. MCP Proxy Client

```typescript
// src/lib/mcp-proxy.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class McpProxy {
  private client: Client | null = null;

  async connect() {
    if (this.client) return this.client;

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@anthropic/xpoz-mcp'],
      env: {
        XPOZ_API_KEY: process.env.XPOZ_API_KEY!,
      },
    });

    this.client = new Client({ name: 'widget-platform', version: '1.0.0' });
    await this.client.connect(transport);
    return this.client;
  }

  async callTool(name: string, args: Record<string, unknown>) {
    const client = await this.connect();
    return client.callTool({ name, arguments: args });
  }

  // Widget-specific methods
  async getTwitterPosts(query: string, fields: string[]) {
    return this.callTool('getTwitterPostsByKeywords', {
      query,
      fields,
      userPrompt: `Fetching tweets for widget: ${query}`,
    });
  }

  async countTweets(phrase: string, startDate: string, endDate: string) {
    return this.callTool('countTweets', { phrase, startDate, endDate });
  }
}

export const mcpProxy = new McpProxy();
```

### 3. API Route (with Caching & MCP)

```typescript
// src/app/api/widgets/[category]/[widget]/route.ts
import { mcpProxy } from '@/lib/mcp-proxy';
import { kv } from '@vercel/kv';
import { buildExpandedQuery } from '@/lib/query-expansion';

export async function GET(
  request: Request,
  { params }: { params: { category: string; widget: string } }
) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  // Rate limiting by IP (free tier)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `rate:${ip}`;
  const requests = await kv.incr(rateLimitKey);
  if (requests === 1) await kv.expire(rateLimitKey, 3600); // 1 hour window
  if (requests > 100) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Cache key
  const cacheKey = `widget:${params.category}:${params.widget}:${ticker}`;

  // Check cache (5 minute TTL)
  const cached = await kv.get(cacheKey);
  if (cached) {
    return Response.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // Build expanded query (ticker → company name)
  const expandedQuery = buildExpandedQuery(ticker);

  // Fetch from XPOZ via MCP proxy
  const result = await mcpProxy.getTwitterPosts(expandedQuery, [
    'id', 'text', 'authorUsername', 'createdAtDate', 'retweetCount'
  ]);

  // Process result based on widget type
  const data = processWidgetData(params.widget, result, ticker);

  // Cache result
  await kv.set(cacheKey, data, { ex: 300 }); // 5 minutes

  return Response.json(data, {
    headers: { 'X-Cache': 'MISS' }
  });
}
```

### 3. Embed Script

```javascript
// public/embed.js
(function() {
  const PLATFORM_URL = 'https://widgets.xpoz.io';

  // Find all widget containers
  document.querySelectorAll('[data-xpoz-widget]').forEach(container => {
    const widget = container.dataset.xpozWidget;
    const category = container.dataset.xpozCategory || 'finance';
    const ticker = container.dataset.xpozTicker;
    const autoRefresh = container.dataset.xpozAutoRefresh === 'true';
    const width = container.dataset.xpozWidth || '100%';
    const height = container.dataset.xpozHeight || '500px';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${PLATFORM_URL}/embed/${category}/${widget}?ticker=${ticker}&auto=${autoRefresh}`;
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';

    container.appendChild(iframe);
  });
})();
```

### 4. Embed Usage

```html
<!-- Simple embed -->
<div
  data-xpoz-widget="velocity-tracker"
  data-xpoz-ticker="TSLA"
  data-xpoz-auto-refresh="true"
></div>
<script src="https://widgets.xpoz.io/embed.js"></script>

<!-- Or iframe directly -->
<iframe
  src="https://widgets.xpoz.io/embed/finance/velocity-tracker?ticker=TSLA&auto=true"
  width="100%"
  height="500"
  style="border: none; border-radius: 12px;"
></iframe>
```

---

## Widget Categories

### Phase 1: Finance (15 widgets)

| # | Widget | Description | Input |
|---|--------|-------------|-------|
| 01 | velocity-tracker | Real-time mention velocity | ticker |
| 02 | acceleration-alerts | Spike detection | ticker |
| 03 | category-heatmap | Sector velocity heatmap | category |
| 04 | influencer-radar | Top voices on ticker | ticker |
| 05 | position-tracker | Bull/bear positions | ticker |
| 06 | rising-tickers | Emerging attention | category |
| 07 | sentiment-deep-dive | Multi-dimensional sentiment | ticker |
| 08 | portfolio-aggregator | Multi-asset analysis | tickers[] |
| 09 | correlation-radar | Sentiment correlations | ticker |
| 10 | quality-index | Bot/spam detection | ticker |
| 11 | sentiment-shift | Sentiment reversals | ticker |
| 12 | volume-anomaly | Unusual patterns | ticker |
| 13 | narrative-tracker | Bull/bear narratives | ticker |
| 14 | divergence-detector | Retail vs smart money | ticker |
| 15 | basket-builder | Thematic portfolios | theme |

### Future: Marketing, Travel, Healthcare

Same architecture, different data sources and widgets.

---

## Design System

Keep existing dark theme from skills:

```typescript
// src/lib/theme.ts
export const theme = {
  colors: {
    background: {
      primary: 'bg-slate-900',    // Main background
      secondary: 'bg-slate-800',  // Cards
      tertiary: 'bg-slate-700',   // Hover states
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-400',
      muted: 'text-slate-500',
    },
    accent: {
      blue: 'text-blue-400',
      green: 'text-green-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
    },
    signals: {
      veryHigh: 'bg-red-500',
      high: 'bg-orange-500',
      elevated: 'bg-yellow-500',
      normal: 'bg-green-500',
      low: 'bg-blue-500',
    },
    heatmap: {
      hot: ['bg-rose-600', 'bg-red-500', 'bg-orange-500', 'bg-amber-500'],
      cold: ['bg-emerald-500', 'bg-cyan-500', 'bg-blue-600'],
    }
  },
  charts: {
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    grid: '#334155',
    tooltip: '#1e293b',
  }
};
```

---

## Data Flow

1. **User requests widget** (page load or refresh click)
2. **API route checks cache** (5-min TTL)
3. **If miss, call XPOZ API:**
   - Build expanded query (ticker → company name)
   - Call `getTwitterPostsByKeywords`
   - Check operation status
   - Process results
4. **Return JSON to frontend**
5. **Widget renders with Recharts**
6. **Auto-refresh timer** (if enabled) triggers re-fetch at 30min intervals

---

## Implementation Steps

### Step 1: Project Setup
- Initialize Next.js 14 with App Router
- Configure Tailwind CSS with dark theme
- Install dependencies (recharts, lucide-react, tanstack-query)
- Set up TypeScript types

### Step 2: Core Infrastructure
- Create XPOZ API client (`lib/xpoz-client.ts`)
- Port ticker normalizer from Python
- Implement query expansion logic
- Set up caching layer (Vercel KV or in-memory)

### Step 3: Widget Components
- Create WidgetWrapper HOC with refresh/auto-update
- Port 15 finance widgets from SKILL.md templates
- Ensure same visual design and color schemes
- Add loading states and error handling

### Step 4: API Routes
- Create `/api/widgets/[category]/[widget]` endpoint
- Implement data transformation from XPOZ to widget format
- Add caching and rate limiting

### Step 5: Website Pages
- Landing page with category overview
- Finance category page with widget gallery
- Individual widget pages with configuration
- Embed pages (minimal chrome for iframes)

### Step 6: Embed System
- Create embed.js script
- Set up embed pages with query params
- Test cross-origin embedding
- Add responsive sizing

### Step 7: Polish & Deploy
- Add analytics/tracking
- Optimize bundle size
- Deploy to Vercel
- Configure custom domain

---

## Decisions Made

1. **XPOZ Data Access**: MCP Proxy
   - Build a proxy server that calls MCP tools
   - Next.js API routes will proxy to MCP client
   - Server-side only (MCP keys never exposed to browser)

2. **Authentication**: Freemium Model
   - Free tier: Public access, rate limited by IP
   - Premium tier (future): API key required above usage threshold
   - Track usage per IP for future monetization

3. **Hosting**: Vercel
   - Easy deployment, auto-scaling
   - Edge functions for low latency
   - Vercel KV for caching

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Data Fetching | TanStack Query |
| Caching | Vercel KV / Redis |
| Deployment | Vercel |
| API | XPOZ REST API |
