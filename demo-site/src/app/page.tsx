import Link from 'next/link'
import { VelocityChart } from '@/components/widgets/VelocityChart'
import { SentimentGauge } from '@/components/widgets/SentimentGauge'
import { HeatmapGrid } from '@/components/widgets/HeatmapGrid'
import { NarrativeTracker } from '@/components/widgets/NarrativeTracker'
import { InfluencerRadar } from '@/components/widgets/InfluencerRadar'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Social Intelligence
            </span>
            <br />
            <span className="text-white">for Finance</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            15 AI-powered widgets that transform social media data into actionable financial insights.
            Track sentiment, detect signals, and discover opportunities.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/widgets"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
            >
              Explore Widgets
            </Link>
            <Link
              href="/integrate"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
            >
              Integration Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Live Widget Preview - Hero Widgets */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <VelocityChart asset="TSLA" />
            <SentimentGauge asset="TSLA" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400">15</div>
              <div className="text-gray-500">Widgets</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400">4</div>
              <div className="text-gray-500">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">MCP</div>
              <div className="text-gray-500">Native</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400">Real-time</div>
              <div className="text-gray-500">Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* More Widget Previews */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Live Widget Gallery</h2>
              <p className="text-gray-400 mt-2">Real-time insights from social data</p>
            </div>
            <Link href="/widgets" className="text-blue-400 hover:text-blue-300 transition">
              View all 15 widgets →
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <HeatmapGrid />
            <NarrativeTracker asset="TSLA" />
          </div>

          <div className="grid lg:grid-cols-1 gap-6">
            <InfluencerRadar asset="TSLA" />
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Layered Architecture</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Built on XPOZ infrastructure. Level 1 provides raw data access, Level 2 delivers smart aggregations.
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-6">
              <div className="text-sm text-blue-400 font-medium mb-2">Level 2: Finance MCP</div>
              <div className="text-lg font-medium mb-2">Smart Aggregation Layer</div>
              <p className="text-gray-400 text-sm">
                15 widget tools • AI-driven trajectories • Structured outputs (scores, signals, narratives)
              </p>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-600 text-2xl">↓</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-500 font-medium mb-2">Level 1: XPOZ Infrastructure MCP</div>
              <div className="text-lg font-medium mb-2">Raw Data Access</div>
              <p className="text-gray-400 text-sm">
                Twitter data • Instagram data • Real-time social feeds • Historical archives
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Widget Categories</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Specialized tools for every aspect of social-driven market analysis
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/widgets?category=velocity" className="group">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500/60 transition">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Velocity</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Track discussion rates, detect spikes, and monitor acceleration
                </p>
                <div className="text-xs text-gray-500">4 widgets</div>
              </div>
            </Link>
            <Link href="/widgets?category=sentiment" className="group">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Sentiment</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Multi-dimensional sentiment analysis, shifts, and quality scoring
                </p>
                <div className="text-xs text-gray-500">4 widgets</div>
              </div>
            </Link>
            <Link href="/widgets?category=discovery" className="group">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-500/60 transition">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Discovery</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Find influencers, track positions, and discover rising assets
                </p>
                <div className="text-xs text-gray-500">3 widgets</div>
              </div>
            </Link>
            <Link href="/widgets?category=portfolio" className="group">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Portfolio</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Aggregate analysis, correlations, divergence, and basket building
                </p>
                <div className="text-xs text-gray-500">4 widgets</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Integration Methods */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Multiple Integration Paths</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Use widgets your way - via MCP, REST API, or embedded React components.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-2xl mb-3">🔌</div>
              <h3 className="text-lg font-semibold mb-2">MCP Integration</h3>
              <p className="text-gray-400 text-sm mb-4">
                Add to Claude Desktop or any MCP-compatible client. AI orchestrates widget chains automatically.
              </p>
              <code className="text-xs bg-gray-900 px-2 py-1 rounded text-blue-400 block overflow-x-auto">
                {`"finance": { "command": "uvx", "args": ["finance-mcp"] }`}
              </code>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-2xl mb-3">🌐</div>
              <h3 className="text-lg font-semibold mb-2">REST API</h3>
              <p className="text-gray-400 text-sm mb-4">
                Simple HTTP endpoints for any language. JSON in, JSON out. Rate limited and authenticated.
              </p>
              <code className="text-xs bg-gray-900 px-2 py-1 rounded text-emerald-400 block">
                POST /api/widgets/velocity-tracker
              </code>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="text-2xl mb-3">⚛️</div>
              <h3 className="text-lg font-semibold mb-2">React Components</h3>
              <p className="text-gray-400 text-sm mb-4">
                Drop-in React components with rich visualizations. Charts, tables, and dashboards included.
              </p>
              <code className="text-xs bg-gray-900 px-2 py-1 rounded text-purple-400 block">
                npm install @xpoz/finance-react
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">
            Explore all 15 widgets, try them with live data, and integrate into your workflows.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/widgets"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition"
            >
              Explore All Widgets
            </Link>
            <Link
              href="/integrate"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
            >
              Integration Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
