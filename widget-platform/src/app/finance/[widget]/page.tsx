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
import { VelocityTracker } from '@/components/widgets/finance/VelocityTracker';

// Widget component registry - add more as they are implemented
const WIDGET_COMPONENTS: Record<string, React.ComponentType<{ ticker: string; autoRefresh?: boolean }>> = {
  'velocity-tracker': VelocityTracker,
  // Add more widgets here as they are implemented
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Widget Not Found</h1>
          <p className="text-slate-400 mb-6">
            The widget "{widgetId}" doesn't exist.
          </p>
          <Link
            href="/finance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/finance" className="hover:text-white transition-colors">
              Finance
            </Link>
            <span>/</span>
            <span className="text-white">{widgetConfig.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{widgetConfig.name}</h1>
              <p className="text-slate-400">{widgetConfig.description}</p>
            </div>

            {/* Ticker Input */}
            {widgetConfig.requiresTicker && (
              <form onSubmit={handleTickerSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  placeholder="Enter ticker..."
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-32 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Load
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Widget Display */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {WidgetComponent ? (
            <WidgetComponent ticker={ticker} autoRefresh={false} />
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <Code className="w-12 h-12 mb-4 text-slate-500" />
              <p className="text-lg font-medium mb-2">Widget Coming Soon</p>
              <p className="text-sm text-center max-w-md">
                The {widgetConfig.name} widget is being implemented. Check back soon
                or try the Velocity Tracker widget.
              </p>
              <Link
                href="/finance/velocity-tracker?ticker=TSLA"
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Try Velocity Tracker
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Embed Codes */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6">Embed This Widget</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* iframe */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">iframe Embed</h3>
              <button
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {copiedEmbed === 'iframe' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
              <code className="text-green-400">{iframeCode}</code>
            </pre>
          </div>

          {/* Script */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Script Tag Embed</h3>
              <button
                onClick={() => copyToClipboard(scriptCode, 'script')}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {copiedEmbed === 'script' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 rounded-lg p-4 text-sm overflow-x-auto">
              <code className="text-green-400">{scriptCode}</code>
            </pre>
          </div>
        </div>

        {/* Preview Link */}
        <div className="mt-6 flex items-center gap-4">
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open embed preview in new tab
          </a>
        </div>
      </section>
    </main>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading widget...</div>
      </main>
    }>
      <WidgetPageContent />
    </Suspense>
  );
}
