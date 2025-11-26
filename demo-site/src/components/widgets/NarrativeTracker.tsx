'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Narrative {
  theme: string
  share: number
  sentiment: number
  trending: boolean
}

const defaultNarratives: Narrative[] = [
  { theme: 'FSD Progress', share: 35, sentiment: 0.72, trending: true },
  { theme: 'Valuation Concerns', share: 25, sentiment: -0.45, trending: false },
  { theme: 'Energy Business', share: 20, sentiment: 0.68, trending: true },
  { theme: 'China Competition', share: 12, sentiment: -0.35, trending: false },
  { theme: 'Elon Leadership', share: 8, sentiment: 0.15, trending: false },
]

export function NarrativeTracker({
  narratives = defaultNarratives,
  asset = 'TSLA'
}: {
  narratives?: Narrative[],
  asset?: string
}) {
  const chartData = narratives.map(n => ({
    name: n.theme.length > 12 ? n.theme.slice(0, 12) + '...' : n.theme,
    fullName: n.theme,
    share: n.share,
    sentiment: n.sentiment,
    color: n.sentiment > 0 ? '#22c55e' : '#ef4444'
  }))

  const dominant = narratives.reduce((prev, current) =>
    prev.share > current.share ? prev : current
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{asset} Narratives</h3>
          <p className="text-sm text-gray-500">Competing stories driving sentiment</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Dominant</div>
          <div className="text-sm font-medium text-purple-400">{dominant.theme}</div>
        </div>
      </div>

      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" domain={[0, 40]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string, props: { payload: { fullName: string, sentiment: number } }) => [
                `${value}% share • ${props.payload.sentiment > 0 ? '+' : ''}${(props.payload.sentiment * 100).toFixed(0)}% sentiment`,
                props.payload.fullName
              ]}
            />
            <Bar dataKey="share" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {narratives.slice(0, 3).map((narrative) => (
          <div key={narrative.theme} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${narrative.sentiment > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-300">{narrative.theme}</span>
              {narrative.trending && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  🔥 trending
                </span>
              )}
            </div>
            <span className={narrative.sentiment > 0 ? 'text-green-400' : 'text-red-400'}>
              {narrative.sentiment > 0 ? '+' : ''}{(narrative.sentiment * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
