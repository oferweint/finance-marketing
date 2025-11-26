'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface VelocityData {
  hour: string
  velocity: number
  mentions: number
}

const sampleData: VelocityData[] = [
  { hour: '12h ago', velocity: 4.2, mentions: 85 },
  { hour: '10h ago', velocity: 4.8, mentions: 92 },
  { hour: '8h ago', velocity: 5.5, mentions: 110 },
  { hour: '6h ago', velocity: 6.2, mentions: 145 },
  { hour: '4h ago', velocity: 7.8, mentions: 189 },
  { hour: '2h ago', velocity: 8.2, mentions: 210 },
  { hour: 'Now', velocity: 8.5, mentions: 225 },
]

export function VelocityChart({ data = sampleData, asset = 'TSLA' }: { data?: VelocityData[], asset?: string }) {
  const currentVelocity = data[data.length - 1]?.velocity || 8.5
  const signal = currentVelocity > 7 ? 'HIGH_ACTIVITY' : currentVelocity > 5 ? 'ELEVATED' : 'NORMAL'
  const signalColor = signal === 'HIGH_ACTIVITY' ? 'text-orange-400' : signal === 'ELEVATED' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{asset} Velocity</h3>
          <p className="text-sm text-gray-500">Discussion rate over time</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-400">{currentVelocity.toFixed(1)}</div>
          <div className={`text-sm font-medium ${signalColor}`}>{signal}</div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="#4b5563"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#4b5563"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area
              type="monotone"
              dataKey="velocity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#velocityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500">Trend:</span>
            <span className="ml-2 text-green-400">↑ Accelerating</span>
          </div>
          <div>
            <span className="text-gray-500">vs Baseline:</span>
            <span className="ml-2 text-orange-400">+247%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
