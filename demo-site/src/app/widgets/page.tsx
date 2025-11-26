'use client'

import { useState } from 'react'
import { widgets, categories } from '@/lib/widgets'
import { WidgetCard } from '@/components/WidgetCard'

export default function WidgetsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredWidgets = activeCategory === 'all'
    ? widgets
    : widgets.filter(w => w.category === activeCategory)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Finance Widgets</h1>
          <p className="text-gray-400 max-w-2xl">
            15 AI-powered widgets that transform social data into actionable insights.
            Each widget can be used standalone or chained together for deeper analysis.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.name}
              <span className="ml-2 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Widget Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWidgets.map(widget => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>

        {/* Integration CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Integrate?</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            All widgets are available via MCP, REST API, or React components.
            Choose the integration method that works best for your use case.
          </p>
          <a
            href="/integrate"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
          >
            View Integration Guide
          </a>
        </div>
      </div>
    </div>
  )
}
