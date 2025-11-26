import Link from 'next/link'
import { Widget } from '@/lib/widgets'
import {
  Activity, Zap, Grid3X3, Users, Target, TrendingUp,
  PieChart, Briefcase, GitBranch, ShieldCheck, RefreshCw,
  AlertTriangle, MessageSquare, GitCompare, Layers
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'activity': Activity,
  'zap': Zap,
  'grid-3x3': Grid3X3,
  'users': Users,
  'target': Target,
  'trending-up': TrendingUp,
  'pie-chart': PieChart,
  'briefcase': Briefcase,
  'git-branch': GitBranch,
  'shield-check': ShieldCheck,
  'refresh-cw': RefreshCw,
  'alert-triangle': AlertTriangle,
  'message-square': MessageSquare,
  'git-compare': GitCompare,
  'layers': Layers,
}

const categoryColors: Record<string, string> = {
  velocity: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  sentiment: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  discovery: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  portfolio: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

export function WidgetCard({ widget }: { widget: Widget }) {
  const Icon = iconMap[widget.icon] || Activity

  return (
    <Link href={`/widgets/${widget.id}`}>
      <div className="widget-card h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${categoryColors[widget.category]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[widget.category]}`}>
            {widget.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{widget.name}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{widget.description}</p>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {widget.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                {feature}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500 font-mono bg-gray-800/50 px-3 py-2 rounded">
            {widget.outputPreview}
          </div>
        </div>
      </div>
    </Link>
  )
}
