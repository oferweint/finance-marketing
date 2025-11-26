'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { getWidgetById, widgets } from '@/lib/widgets'
import { ArrowLeft, Play, Copy, Check } from 'lucide-react'

export default function WidgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const widget = getWidgetById(id)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<object | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'demo' | 'mcp' | 'api' | 'react'>('demo')

  if (!widget) {
    return (
      <div className="min-h-screen py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Widget not found</h1>
        <Link href="/widgets" className="text-blue-400 hover:text-blue-300">
          ← Back to widgets
        </Link>
      </div>
    )
  }

  const handleRun = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/widgets/${widget.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: input || JSON.stringify(widget.inputExample),
      })
      const data = await response.json()
      setOutput(data)
    } catch (error) {
      setOutput({ error: 'Failed to run widget. API not configured yet.' })
    }
    setLoading(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const mcpConfig = `{
  "mcpServers": {
    "finance": {
      "command": "uvx",
      "args": ["--from", "xpoz-finance-mcp", "finance-mcp"],
      "env": {
        "XPOZ_API_KEY": "\${XPOZ_API_KEY}"
      }
    }
  }
}`

  const apiExample = `curl -X POST https://api.xpoz.io/v1/widgets/${widget.id} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(widget.inputExample)}'`

  const reactExample = `import { ${widget.shortName}Widget } from '@xpoz/finance-react'

function MyComponent() {
  return (
    <${widget.shortName}Widget
      ${Object.entries(widget.inputExample).map(([k, v]) => `${k}="${v}"`).join('\n      ')}
      onData={(data) => console.log(data)}
    />
  )
}`

  // Find related widgets
  const relatedWidgets = widgets
    .filter(w => w.category === widget.category && w.id !== widget.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/widgets"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to widgets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {widget.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{widget.name}</h1>
          <p className="text-xl text-gray-400">{widget.description}</p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-8">
          {widget.features.map((feature, i) => (
            <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
              {feature}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex gap-1">
            {(['demo', 'mcp', 'api', 'react'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab === 'demo' ? 'Try It' : tab === 'mcp' ? 'MCP Config' : tab === 'api' ? 'REST API' : 'React'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {activeTab === 'demo' && (
            <>
              {/* Input Panel */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
                <textarea
                  className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder={JSON.stringify(widget.inputExample, null, 2)}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  onClick={handleRun}
                  disabled={loading}
                  className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Running...</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Widget
                    </>
                  )}
                </button>
              </div>

              {/* Output Panel */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Output</h3>
                  {output && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(output, null, 2), 'output')}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {copied === 'output' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <pre className="h-64 overflow-auto bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300">
                  {output ? JSON.stringify(output, null, 2) : '// Output will appear here after running the widget'}
                </pre>
              </div>
            </>
          )}

          {activeTab === 'mcp' && (
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Claude Desktop Configuration</h3>
                <button
                  onClick={() => copyToClipboard(mcpConfig, 'mcp')}
                  className="text-gray-400 hover:text-white transition flex items-center gap-2"
                >
                  {copied === 'mcp' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Add this to your <code className="text-blue-400">claude_desktop_config.json</code> to use this widget via Claude Desktop:
              </p>
              <pre className="overflow-auto bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300">
                {mcpConfig}
              </pre>
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Usage:</strong> Once configured, ask Claude: &quot;Use the {widget.shortName.toLowerCase()} widget to analyze TSLA&quot;
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">REST API</h3>
                <button
                  onClick={() => copyToClipboard(apiExample, 'api')}
                  className="text-gray-400 hover:text-white transition flex items-center gap-2"
                >
                  {copied === 'api' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <pre className="overflow-auto bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300">
                {apiExample}
              </pre>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Input Schema</h4>
                  <pre className="bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-xs text-gray-400 overflow-auto">
                    {JSON.stringify(widget.inputExample, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Preview</h4>
                  <pre className="bg-gray-800 border border-gray-700 rounded-lg p-3 font-mono text-xs text-gray-400">
                    {widget.outputPreview}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">React Component</h3>
                <button
                  onClick={() => copyToClipboard(reactExample, 'react')}
                  className="text-gray-400 hover:text-white transition flex items-center gap-2"
                >
                  {copied === 'react' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Install: <code className="text-purple-400">npm install @xpoz/finance-react</code>
              </p>
              <pre className="overflow-auto bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300">
                {reactExample}
              </pre>
            </div>
          )}
        </div>

        {/* Related Widgets */}
        {relatedWidgets.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Widgets</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedWidgets.map(w => (
                <Link
                  key={w.id}
                  href={`/widgets/${w.id}`}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition"
                >
                  <h3 className="font-medium mb-1">{w.shortName}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{w.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
