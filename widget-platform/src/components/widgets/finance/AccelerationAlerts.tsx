'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Zap, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { WidgetWrapper } from '../WidgetWrapper';
import { AccelerationAlertsData, AccelerationAlert, Trend } from '@/types/widgets';
import { chartConfig } from '@/lib/theme';

interface AccelerationAlertsProps {
  ticker?: string;
  autoRefresh?: boolean;
}

const generateMockData = (ticker: string): AccelerationAlertsData => {
  const now = new Date();
  const alerts: AccelerationAlert[] = [];

  for (let i = 0; i < 8; i++) {
    const magnitude = Math.random() * 5 + 1;
    const previousVelocity = 4 + Math.random() * 2;
    const isSpike = Math.random() > 0.3;
    const currentVelocity = isSpike
      ? previousVelocity + magnitude
      : previousVelocity - magnitude * 0.5;

    alerts.push({
      time: new Date(now.getTime() - i * 3600000).toISOString(),
      magnitude: Math.abs(magnitude),
      type: isSpike ? (magnitude > 3 ? 'surge' : 'spike') : 'drop',
      previousVelocity,
      currentVelocity: Math.max(0, currentVelocity),
    });
  }

  const latestAlert = alerts[0];
  const trend: Trend = latestAlert.type === 'drop' ? 'decelerating' : 'accelerating';

  return {
    ticker,
    alerts: alerts.reverse(),
    currentAcceleration: latestAlert.currentVelocity - latestAlert.previousVelocity,
    trend,
    generatedAt: now.toISOString(),
  };
};

function AccelerationAlertsContent({
  data,
  isLoading,
}: {
  data: AccelerationAlertsData | null;
  isLoading: boolean;
}) {
  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { ticker, alerts = [], currentAcceleration = 0, trend = 'accelerating' } = data;

  const TrendIcon = trend === 'accelerating' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'accelerating' ? 'text-green-400' : 'text-red-400';

  const chartData = (alerts || []).map((alert, i) => ({
    time: new Date(alert.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    magnitude: alert.type === 'drop' ? -alert.magnitude : alert.magnitude,
    type: alert.type,
  }));

  const getBarColor = (type: string) => {
    switch (type) {
      case 'surge': return '#ef4444';
      case 'spike': return '#f97316';
      case 'drop': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">{ticker} Acceleration Alerts</h1>
            <p className="text-slate-400 text-sm">
              Sudden velocity changes in the last 8 hours
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${currentAcceleration > 0 ? 'text-green-400' : 'text-red-400'}`} suppressHydrationWarning>
            {currentAcceleration > 0 ? '+' : ''}{currentAcceleration.toFixed(1)}
          </div>
          <div className={`flex items-center gap-1 justify-end ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm capitalize">{trend}</span>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-red-400 text-2xl font-bold">
            {alerts.filter(a => a.type === 'surge').length}
          </div>
          <div className="text-slate-400 text-xs">Surges</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-orange-400 text-2xl font-bold">
            {alerts.filter(a => a.type === 'spike').length}
          </div>
          <div className="text-slate-400 text-xs">Spikes</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-blue-400 text-2xl font-bold">
            {alerts.filter(a => a.type === 'drop').length}
          </div>
          <div className="text-slate-400 text-xs">Drops</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium mb-4">Acceleration Events</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis
              dataKey="time"
              {...chartConfig.axis}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              {...chartConfig.axis}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={chartConfig.tooltip.contentStyle}
              labelStyle={chartConfig.tooltip.labelStyle}
              formatter={(value: number) => [Math.abs(value).toFixed(2), 'Magnitude']}
            />
            <Bar dataKey="magnitude" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Recent Alerts</h3>
        <div className="space-y-2">
          {alerts.slice().reverse().slice(0, 5).map((alert, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-4 h-4 ${
                  alert.type === 'surge' ? 'text-red-400' :
                  alert.type === 'spike' ? 'text-orange-400' : 'text-blue-400'
                }`} />
                <div>
                  <div className="text-sm font-medium capitalize">{alert.type}</div>
                  <div className="text-xs text-slate-400" suppressHydrationWarning>
                    {new Date(alert.time).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${alert.type === 'drop' ? 'text-blue-400' : 'text-orange-400'}`} suppressHydrationWarning>
                  {alert.type === 'drop' ? '-' : '+'}{alert.magnitude.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400" suppressHydrationWarning>
                  {alert.previousVelocity.toFixed(1)} → {alert.currentVelocity.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccelerationAlerts({ ticker = 'NVDA', autoRefresh }: AccelerationAlertsProps) {
  return (
    <WidgetWrapper
      category="finance"
      widget="acceleration-alerts"
      ticker={ticker}
      autoRefresh={autoRefresh}
    >
      {(rawData, isLoading) => {
        // Don't use generateMockData() - causes hydration errors due to new Date()
        const apiResponse = rawData as { success: boolean; data: AccelerationAlertsData } | null;
        const data = apiResponse?.data || null;
        return <AccelerationAlertsContent data={data} isLoading={isLoading} />;
      }}
    </WidgetWrapper>
  );
}

export default AccelerationAlerts;
