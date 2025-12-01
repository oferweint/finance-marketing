/**
 * Theme configuration for XPOZ Widget Platform
 *
 * Consistent styling across all widgets.
 */

// Chart colors for multiple data series
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

// Signal colors
export const SIGNAL_COLORS = {
  VERY_HIGH: '#ef4444', // red-500
  HIGH_ACTIVITY: '#f97316', // orange-500
  ELEVATED: '#eab308', // yellow-500
  NORMAL: '#22c55e', // green-500
  LOW: '#3b82f6', // blue-500
};

// Heatmap colors (7-tier scale)
export const HEATMAP_COLORS = {
  veryHot: '#e11d48', // rose-600
  hot: '#ef4444', // red-500
  warm: '#f97316', // orange-500
  elevated: '#f59e0b', // amber-500
  normal: '#10b981', // emerald-500
  cool: '#06b6d4', // cyan-500
  cold: '#2563eb', // blue-600
};

// Get heatmap color based on velocity
export function getHeatColor(velocity: number): string {
  if (velocity >= 8.5) return HEATMAP_COLORS.veryHot;
  if (velocity >= 7.5) return HEATMAP_COLORS.hot;
  if (velocity >= 6.5) return HEATMAP_COLORS.warm;
  if (velocity >= 5.5) return HEATMAP_COLORS.elevated;
  if (velocity >= 4.5) return HEATMAP_COLORS.normal;
  if (velocity >= 3.5) return HEATMAP_COLORS.cool;
  return HEATMAP_COLORS.cold;
}

// Get heatmap Tailwind class based on velocity
export function getHeatClass(velocity: number): string {
  if (velocity >= 8.5) return 'bg-rose-600';
  if (velocity >= 7.5) return 'bg-red-500';
  if (velocity >= 6.5) return 'bg-orange-500';
  if (velocity >= 5.5) return 'bg-amber-500';
  if (velocity >= 4.5) return 'bg-emerald-500';
  if (velocity >= 3.5) return 'bg-cyan-500';
  return 'bg-blue-600';
}

// Get signal color
export function getSignalColor(signal: string): string {
  return SIGNAL_COLORS[signal as keyof typeof SIGNAL_COLORS] || SIGNAL_COLORS.NORMAL;
}

// Get signal Tailwind class
export function getSignalClass(signal: string): string {
  const classes: Record<string, string> = {
    VERY_HIGH: 'bg-red-500',
    HIGH_ACTIVITY: 'bg-orange-500',
    ELEVATED: 'bg-yellow-500',
    NORMAL: 'bg-green-500',
    LOW: 'bg-blue-500',
  };
  return classes[signal] || classes.NORMAL;
}

// Trend colors
export const TREND_COLORS = {
  accelerating: '#22c55e', // green-500
  decelerating: '#ef4444', // red-500
  stable: '#6b7280', // gray-500
};

// Get trend color
export function getTrendColor(trend: string): string {
  return TREND_COLORS[trend as keyof typeof TREND_COLORS] || TREND_COLORS.stable;
}

// Chart configuration
export const chartConfig = {
  grid: {
    stroke: '#334155', // slate-700
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#475569', // slate-600
    tick: { fill: '#94a3b8' }, // slate-400
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#1e293b', // slate-800
      border: '1px solid #334155', // slate-700
      borderRadius: '8px',
      padding: '12px',
    },
    labelStyle: {
      color: '#f8fafc', // slate-50
      fontWeight: 600,
    },
    itemStyle: {
      color: '#cbd5e1', // slate-300
    },
  },
  area: {
    gradientId: 'velocityGradient',
    fill: 'url(#velocityGradient)',
    stroke: '#3b82f6', // blue-500
  },
};

// Format timestamp to display time
export function formatTime(timestamp: string | Date | number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format timestamp to display date/time
export function formatDateTime(timestamp: string | Date | number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate velocity from actual and baseline
export function calculateVelocity(actual: number, baseline: number): number {
  const ratio = actual / Math.max(baseline, 1);
  // Formula: velocity = 2.5 + (ratio * 2.5), clamped to 0-10
  return Math.min(10, Math.max(0, 2.5 + ratio * 2.5));
}

// Get velocity description
export function getVelocityDescription(velocity: number): string {
  if (velocity >= 8.5) return '2.5x+ baseline (Very Hot)';
  if (velocity >= 7.5) return '2x+ baseline (Hot)';
  if (velocity >= 6.5) return '1.5x+ baseline (Elevated)';
  if (velocity >= 5.5) return '1.2x baseline (Above Normal)';
  if (velocity >= 4.5) return '~1x baseline (Normal)';
  if (velocity >= 3.5) return 'Below baseline';
  return '<0.6x baseline (Cold)';
}
