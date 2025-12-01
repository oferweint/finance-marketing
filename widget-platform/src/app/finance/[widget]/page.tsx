'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Code,
  ExternalLink,
} from 'lucide-react';
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

function WidgetPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const widgetId = params.widget as string;
  const tickerParam = searchParams.get('ticker') || '';

  const [ticker, setTicker] = useState(tickerParam || 'TSLA');
  const [copiedEmbed, setCopiedEmbed] = useState<'iframe' | 'script' | null>(null);

  const widgetConfig = getFinanceWidgetConfig(widgetId);
  const WidgetComponent = WIDGET_COMPONENTS[widgetId];

  if (!widgetConfig) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Widget Not Found</h1>
          <p className="text-slate-500 mb-6">
            The widget &quot;{widgetId}&quot; doesn&apos;t exist.
          </p>
          <Link
            href="/finance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Finance Widgets
          </Link>
        </div>
      </main>
    );
  }

  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker.toUpperCase());
  };

  const handleTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/finance/${widgetId}?ticker=${ticker}`);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://widgets.xpoz.io';
  const embedUrl = `${baseUrl}/embed/finance/${widgetId}${ticker ? `?ticker=${ticker}` : ''}`;

  const iframeCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  style="border: none; border-radius: 12px;"
></iframe>`;

  const scriptCode = `<div
  data-xpoz-widget="${widgetId}"
  ${ticker ? `data-xpoz-ticker="${ticker}"` : ''}
  data-xpoz-auto-refresh="true"
></div>
<script src="${baseUrl}/embed.js"></script>`;

  const copyToClipboard = (code: string, type: 'iframe' | 'script') => {
    navigator.clipboard.writeText(code);
    setCopiedEmbed(type);
    setTimeout(() => setCopiedEmbed(null), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-800">XPOZ</span>
            <span className="text-sm text-slate-500">Widgets</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/finance" className="text-blue-600 text-sm font-medium">
              Finance
            </Link>
            <a href="/#embed" className="text-slate-600 hover:text-slate-800 text-sm font-medium">
              Embed
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
            <Link href="/" className="hover:text-slate-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/finance" className="hover:text-slate-700 transition-colors">
              Finance
            </Link>
            <span>/</span>
            <span className="text-slate-800">{widgetConfig.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{widgetConfig.name}</h1>
              <p className="text-slate-500">{widgetConfig.description}</p>
            </div>

            {/* Ticker Input */}
            {widgetConfig.inputs.some(i => i.type === 'ticker') && (
              <form onSubmit={handleTickerSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  placeholder="Enter ticker..."
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-32 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Load
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Widget Display - Keep dark theme for the widget itself */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-xl overflow-hidden shadow-lg">
          {WidgetComponent ? (
            <WidgetComponent ticker={ticker} autoRefresh={false} />
          ) : (
            <div className="h-96 flex flex-col items-center justify-center bg-slate-900 text-slate-400 rounded-xl">
              <Code className="w-12 h-12 mb-4 text-slate-500" />
              <p className="text-lg font-medium text-white mb-2">Widget Coming Soon</p>
              <p className="text-sm text-center max-w-md">
                The {widgetConfig.name} widget is being implemented. Check back soon
                or try the Velocity Tracker widget.
              </p>
              <Link
                href="/finance/velocity-tracker?ticker=TSLA"
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Velocity Tracker
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Embed Codes */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Embed This Widget</h2>

        {/* Embed Method Guidance */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">Which embed method should I use?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium mb-1">✓ Use iframe for:</p>
              <ul className="text-blue-600 space-y-1">
                <li>• Static websites & landing pages</li>
                <li>• CMS platforms (WordPress, Webflow)</li>
                <li>• Email campaigns (supported clients)</li>
                <li>• Quick integration with isolation</li>
              </ul>
            </div>
            <div>
              <p className="text-blue-700 font-medium mb-1">✓ Use script tag for:</p>
              <ul className="text-blue-600 space-y-1">
                <li>• Dynamic web apps (React, Vue, etc.)</li>
                <li>• Multiple widgets on same page</li>
                <li>• Better SEO & accessibility</li>
                <li>• Programmatic ticker changes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* iframe */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-800">iframe Embed</h3>
              <button
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {copiedEmbed === 'iframe' ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="code-block">
              <code className="text-green-400">{iframeCode}</code>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Paste this code anywhere in your HTML. Adjust height as needed.
            </p>
          </div>

          {/* Script */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-800">Script Tag Embed</h3>
              <button
                onClick={() => copyToClipboard(scriptCode, 'script')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {copiedEmbed === 'script' ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="code-block">
              <code className="text-green-400">{scriptCode}</code>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              The script auto-renders widgets based on data attributes. Include once per page.
            </p>
          </div>
        </div>

        {/* Preview Link */}
        <div className="mt-6 flex items-center gap-4">
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open embed preview in new tab
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 XPOZ. Built with ❤️ for the AI community.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://xpoz.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                XPOZ.ai
              </a>
              <a
                href="https://help.xpoz.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-500">Loading widget...</div>
      </main>
    }>
      <WidgetPageContent />
    </Suspense>
  );
}
