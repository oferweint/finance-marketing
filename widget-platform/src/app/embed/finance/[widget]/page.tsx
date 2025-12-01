'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getFinanceWidgetConfig } from '@/types/widgets';
import {
  VelocityTracker,
  AccelerationAlerts,
  CategoryHeatmap,
  InfluencerRadar,
  PositionTracker,
  RisingTickers,
  SentimentDeepDive,
  PortfolioAggregator,
  CorrelationRadar,
  QualityIndex,
  SentimentShift,
  VolumeAnomaly,
  NarrativeTracker,
  DivergenceDetector,
  BasketBuilder,
} from '@/components/widgets/finance';

// Widget component registry - all 15 finance widgets
const WIDGET_COMPONENTS: Record<string, React.ComponentType<{ ticker?: string; tickers?: string; theme?: string; autoRefresh?: boolean }>> = {
  'velocity-tracker': VelocityTracker,
  'acceleration-alerts': AccelerationAlerts,
  'category-heatmap': CategoryHeatmap,
  'influencer-radar': InfluencerRadar,
  'position-tracker': PositionTracker,
  'rising-tickers': RisingTickers,
  'sentiment-deep-dive': SentimentDeepDive,
  'portfolio-aggregator': PortfolioAggregator,
  'correlation-radar': CorrelationRadar,
  'quality-index': QualityIndex,
  'sentiment-shift': SentimentShift,
  'volume-anomaly': VolumeAnomaly,
  'narrative-tracker': NarrativeTracker,
  'divergence-detector': DivergenceDetector,
  'basket-builder': BasketBuilder,
};

function EmbedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const widgetId = params.widget as string;
  const ticker = searchParams.get('ticker') || 'TSLA';
  const autoRefresh = searchParams.get('autoRefresh') === 'true';

  const widgetConfig = getFinanceWidgetConfig(widgetId);
  const WidgetComponent = WIDGET_COMPONENTS[widgetId];

  if (!widgetConfig) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold mb-2">Widget Not Found</h1>
          <p className="text-slate-400 text-sm">
            The widget "{widgetId}" doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (!WidgetComponent) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold mb-2">Coming Soon</h1>
          <p className="text-slate-400 text-sm">
            {widgetConfig.name} is being implemented.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <WidgetComponent ticker={ticker} autoRefresh={autoRefresh} />

      {/* XPOZ Branding */}
      <div className="mt-4 text-center">
        <a
          href="https://xpoz.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Powered by XPOZ
        </a>
      </div>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <EmbedContent />
    </Suspense>
  );
}
