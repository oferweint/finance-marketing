'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface SentimentData {
  overall: number
  bullish: number
  bearish: number
  neutral: number
  dimensions: {
    fundamental: number
    technical: number
    news: number
    speculative: number
  }
}

const defaultData: SentimentData = {
  overall: 0.65,
  bullish: 65,
  bearish: 20,
  neutral: 15,
  dimensions: {
    fundamental: 0.72,
    technical: 0.45,
    news: 0.78,
    speculative: 0.55
  }
}

export function SentimentGauge({ data = defaultData, asset = 'TSLA' }: { data?: SentimentData, asset?: string }) {
  const pieData = [
    { name: 'Bullish', value: data.bullish, color: '#22c55e' },
    { name: 'Bearish', value: data.bearish, color: '#ef4444' },
    { name: 'Neutral', value: data.neutral, color: '#6b7280' },
  ]

  const overallLabel = data.overall > 0.6 ? 'Bullish' : data.overall < 0.4 ? 'Bearish' : 'Neutral'
  const overallColor = data.overall > 0.6 ? 'text-green-400' : data.overall < 0.4 ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{asset} Sentiment</h3>
          <p className="text-sm text-gray-500">Multi-dimensional analysis</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${overallColor}`}>{overallLabel}</div>
          <div className="text-sm text-gray-500">{(data.overall * 100).toFixed(0)}% confidence</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Bars */}
        <div className="space-y-3">
          {Object.entries(data.dimensions).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 capitalize">{key}</span>
                <span className={value > 0.5 ? 'text-green-400' : 'text-red-400'}>
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${value > 0.5 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
