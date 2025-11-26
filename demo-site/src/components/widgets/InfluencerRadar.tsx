'use client'

interface Influencer {
  username: string
  tier: 'ELITE' | 'HIGH' | 'MEDIUM'
  followers: number
  engagement: number
  accuracy: number
  position: 'bullish' | 'bearish' | 'neutral'
}

const defaultInfluencers: Influencer[] = [
  { username: '@evanalyst', tier: 'ELITE', followers: 250000, engagement: 4.2, accuracy: 78, position: 'bullish' },
  { username: '@teslainvestor', tier: 'HIGH', followers: 125000, engagement: 3.8, accuracy: 72, position: 'bullish' },
  { username: '@stockpicker99', tier: 'MEDIUM', followers: 45000, engagement: 5.1, accuracy: 65, position: 'neutral' },
  { username: '@marketwatch_j', tier: 'HIGH', followers: 89000, engagement: 3.2, accuracy: 70, position: 'bearish' },
]

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
  return count.toString()
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'ELITE': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'HIGH': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

function getPositionColor(position: string): string {
  switch (position) {
    case 'bullish': return 'text-green-400'
    case 'bearish': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function InfluencerRadar({
  influencers = defaultInfluencers,
  asset = 'TSLA'
}: {
  influencers?: Influencer[],
  asset?: string
}) {
  const bullCount = influencers.filter(i => i.position === 'bullish').length
  const bearCount = influencers.filter(i => i.position === 'bearish').length

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{asset} Influencers</h3>
          <p className="text-sm text-gray-500">Key voices and their positions</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-400">🐂 {bullCount}</span>
          <span className="text-red-400">🐻 {bearCount}</span>
        </div>
      </div>

      <div className="space-y-3">
        {influencers.map((influencer) => (
          <div
            key={influencer.username}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {influencer.username.slice(1, 3).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-200">{influencer.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getTierColor(influencer.tier)}`}>
                    {influencer.tier}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatFollowers(influencer.followers)} followers • {influencer.engagement}% eng
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${getPositionColor(influencer.position)}`}>
                {influencer.position === 'bullish' ? '🐂 Bullish' : influencer.position === 'bearish' ? '🐻 Bearish' : '⚖️ Neutral'}
              </div>
              <div className="text-xs text-gray-500">{influencer.accuracy}% accuracy</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm text-gray-500">
        <span>47 influencers tracked</span>
        <span className="text-blue-400 cursor-pointer hover:text-blue-300">View all →</span>
      </div>
    </div>
  )
}
