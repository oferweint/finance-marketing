'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function IntegratePage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const mcpFullConfig = `{
  "mcpServers": {
    "xpoz-finance": {
      "command": "uvx",
      "args": ["--from", "xpoz-finance-mcp", "finance-mcp"],
      "env": {
        "XPOZ_API_KEY": "your-api-key-here"
      }
    }
  }
}`

  const pythonExample = `from xpoz_finance import FinanceClient

# Initialize client
client = FinanceClient(api_key="your-api-key")

# Run velocity tracker
result = await client.velocity_tracker(
    asset="TSLA",
    hours_back=168
)

print(f"Velocity Score: {result['velocity_score']}")
print(f"Signal: {result['signal']}")

# Chain widgets for deeper analysis
sentiment = await client.sentiment_deep_dive(asset="TSLA")
narratives = await client.narrative_tracker(asset="TSLA")`

  const embedExample = `<iframe
  src="https://widgets.xpoz.io/embed/velocity-tracker?asset=TSLA"
  width="600"
  height="400"
  frameborder="0"
  allow="clipboard-write"
></iframe>`

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Integration Guide</h1>
          <p className="text-xl text-gray-400">
            Multiple ways to integrate XPOZ Finance widgets into your applications.
          </p>
        </div>

        {/* Method 1: MCP */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔌</span>
            <h2 className="text-2xl font-bold">MCP Integration (Recommended)</h2>
          </div>
          <p className="text-gray-400 mb-6">
            The Model Context Protocol (MCP) allows AI assistants like Claude to use widgets as tools.
            This is the most powerful integration - AI can automatically chain widgets together for comprehensive analysis.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <h3 className="font-semibold mb-4">Step 1: Install the MCP Server</h3>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-500">$</span> pip install xpoz-finance-mcp
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Step 2: Configure Claude Desktop</h3>
              <button
                onClick={() => copyToClipboard(mcpFullConfig, 'mcp')}
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                {copied === 'mcp' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Add to <code className="text-blue-400">~/Library/Application Support/Claude/claude_desktop_config.json</code>:
            </p>
            <pre className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto">
              {mcpFullConfig}
            </pre>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Step 3: Use with Claude</h3>
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <p className="text-sm text-blue-300 mb-2"><strong>Example prompts:</strong></p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>&quot;Analyze social velocity for TSLA over the past week&quot;</li>
                  <li>&quot;What&apos;s the sentiment breakdown for Bitcoin?&quot;</li>
                  <li>&quot;Find rising tickers in the crypto space&quot;</li>
                  <li>&quot;Do a deep analysis on NVDA - velocity, sentiment, and narratives&quot;</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Method 2: Python SDK */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🐍</span>
            <h2 className="text-2xl font-bold">Python SDK</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Direct Python integration for data pipelines, notebooks, and backend services.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <h3 className="font-semibold mb-4">Installation</h3>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-500">$</span> pip install xpoz-finance
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Usage Example</h3>
              <button
                onClick={() => copyToClipboard(pythonExample, 'python')}
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                {copied === 'python' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            </div>
            <pre className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto">
              {pythonExample}
            </pre>
          </div>
        </section>

        {/* Method 3: REST API */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌐</span>
            <h2 className="text-2xl font-bold">REST API</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Language-agnostic HTTP API. Works with any programming language or tool.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Endpoints</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <code className="text-sm">POST /api/widgets/velocity-tracker</code>
                <span className="text-xs text-gray-500">Track discussion velocity</span>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <code className="text-sm">POST /api/widgets/sentiment-deep-dive</code>
                <span className="text-xs text-gray-500">Analyze sentiment</span>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <code className="text-sm">POST /api/widgets/narrative-tracker</code>
                <span className="text-xs text-gray-500">Track narratives</span>
              </div>
              <div className="text-center text-gray-500 text-sm py-2">
                ... and 12 more widget endpoints
              </div>
            </div>
          </div>
        </section>

        {/* Method 4: Embed */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold">Embed Widgets</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Drop widgets into any website with a simple iframe or web component.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Embed Code</h3>
              <button
                onClick={() => copyToClipboard(embedExample, 'embed')}
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                {copied === 'embed' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                Copy
              </button>
            </div>
            <pre className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto">
              {embedExample}
            </pre>
          </div>
        </section>

        {/* Available Widgets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Widgets</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'velocity-tracker', desc: 'Track discussion velocity' },
              { name: 'acceleration-alerts', desc: 'Detect velocity spikes' },
              { name: 'category-heatmap', desc: 'Sector velocity comparison' },
              { name: 'influencer-radar', desc: 'Find key voices' },
              { name: 'position-tracker', desc: 'Track influencer positions' },
              { name: 'rising-tickers', desc: 'Discover emerging assets' },
              { name: 'sentiment-deep-dive', desc: 'Multi-dimensional sentiment' },
              { name: 'portfolio-aggregator', desc: 'Portfolio-wide analysis' },
              { name: 'correlation-radar', desc: 'Cross-asset correlations' },
              { name: 'quality-index', desc: 'Mention quality scoring' },
              { name: 'sentiment-shift', desc: 'Detect sentiment changes' },
              { name: 'volume-anomaly', desc: 'Find volume anomalies' },
              { name: 'narrative-tracker', desc: 'Track competing narratives' },
              { name: 'divergence-detector', desc: 'Retail vs smart money' },
              { name: 'basket-builder', desc: 'Build thematic baskets' },
            ].map(w => (
              <a
                key={w.name}
                href={`/widgets/${w.name}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-blue-500/50 transition"
              >
                <code className="text-sm text-blue-400">{w.name}</code>
                <span className="text-xs text-gray-500">{w.desc}</span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
          <p className="text-gray-400 mb-6">
            Check out individual widget pages for detailed examples and live demos.
          </p>
          <a
            href="/widgets"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
          >
            Explore Widgets
          </a>
        </section>
      </div>
    </div>
  )
}
