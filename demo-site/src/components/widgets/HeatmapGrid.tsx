'use client'

interface SectorData {
  name: string
  heat: number
  trend: 'up' | 'down' | 'stable'
  topTicker: string
}

const defaultSectors: SectorData[] = [
  { name: 'Technology', heat: 0.85, trend: 'up', topTicker: 'NVDA' },
  { name: 'Energy', heat: 0.62, trend: 'stable', topTicker: 'XOM' },
  { name: 'Finance', heat: 0.48, trend: 'down', topTicker: 'JPM' },
  { name: 'Healthcare', heat: 0.55, trend: 'up', topTicker: 'UNH' },
  { name: 'Consumer', heat: 0.41, trend: 'stable', topTicker: 'AMZN' },
  { name: 'Industrial', heat: 0.58, trend: 'up', topTicker: 'CAT' },
  { name: 'Crypto', heat: 0.92, trend: 'up', topTicker: 'BTC' },
  { name: 'Real Estate', heat: 0.35, trend: 'down', topTicker: 'AMT' },
]

function getHeatColor(heat: number): string {
  if (heat > 0.8) return 'bg-red-500'
  if (heat > 0.6) return 'bg-orange-500'
  if (heat > 0.4) return 'bg-yellow-500'
  if (heat > 0.2) return 'bg-green-500'
  return 'bg-blue-500'
}

function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return 'text-green-400'
  if (trend === 'down') return 'text-red-400'
  return 'text-gray-400'
}

export function HeatmapGrid({ sectors = defaultSectors }: { sectors?: SectorData[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Sector Heatmap</h3>
          <p className="text-sm text-gray-500">Discussion velocity by sector</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Activity:</span>
          <div className="flex gap-1">
            <div className="w-4 h-3 rounded bg-blue-500" title="Low" />
            <div className="w-4 h-3 rounded bg-green-500" title="Medium" />
            <div className="w-4 h-3 rounded bg-yellow-500" title="Elevated" />
            <div className="w-4 h-3 rounded bg-orange-500" title="High" />
            <div className="w-4 h-3 rounded bg-red-500" title="Very High" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {sectors.map((sector) => (
          <div
            key={sector.name}
            className={`${getHeatColor(sector.heat)} rounded-lg p-3 transition-transform hover:scale-105 cursor-pointer`}
            style={{ opacity: 0.7 + sector.heat * 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white truncate">{sector.name}</span>
              <span className={`text-sm ${getTrendColor(sector.trend)}`}>
                {getTrendIcon(sector.trend)}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">{(sector.heat * 100).toFixed(0)}%</span>
              <span className="text-xs text-white/70">{sector.topTicker}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-500">
          Hottest: <span className="text-red-400 font-medium">Crypto (92%)</span>
        </div>
        <div className="text-gray-500">
          Updated: <span className="text-gray-400">2 min ago</span>
        </div>
      </div>
    </div>
  )
}
