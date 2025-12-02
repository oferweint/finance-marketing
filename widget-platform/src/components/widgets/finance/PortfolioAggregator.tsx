'use client';

import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Briefcase, TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react';
import { chartConfig, CHART_COLORS } from '@/lib/theme';

interface PortfolioAggregatorProps {
  autoRefresh?: boolean;
}

interface TickerSentiment {
  ticker: string;
  sentiment: number;
  velocity: number;
  mentions: number;
  trend: 'up' | 'down' | 'neutral';
}

interface PortfolioData {
  portfolioName: string;
  tickers: TickerSentiment[];
  overallSentiment: number;
  averageVelocity: number;
  totalMentions: number;
  generatedAt: string;
}

// Predefined portfolios
const PORTFOLIOS: Record<string, { name: string; tickers: string[] }> = {
  'magnificent-7': {
    name: 'Magnificent 7',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'],
  },
  'sp-top-10': {
    name: 'S&P Top 10',
    tickers: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM', 'UNH', 'V'],
  },
  'ai-leaders': {
    name: 'AI Leaders',
    tickers: ['NVDA', 'MSFT', 'GOOGL', 'AMD', 'META', 'PLTR', 'AMZN', 'CRM'],
  },
  'crypto-plays': {
    name: 'Crypto Plays',
    tickers: ['BTC', 'ETH', 'SOL', 'COIN', 'MSTR', 'RIOT'],
  },
  'ev-revolution': {
    name: 'EV Revolution',
    tickers: ['TSLA', 'RIVN', 'LCID', 'NIO', 'F', 'GM'],
  },
  'big-tech': {
    name: 'Big Tech',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
  },
  'fintech': {
    name: 'Fintech',
    tickers: ['SQ', 'PYPL', 'COIN', 'SOFI', 'V', 'MA'],
  },
  'semiconductors': {
    name: 'Semiconductors',
    tickers: ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO', 'QCOM'],
  },
};

function getSentimentColor(sentiment: number): string {
  if (sentiment >= 60) return 'text-green-400';
  if (sentiment >= 50) return 'text-emerald-400';
  if (sentiment >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function PortfolioAggregatorContent({
  data,
  isLoading,
}: {
  data: PortfolioData | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const { tickers = [], overallSentiment = 50, averageVelocity = 0, totalMentions = 0 } = data;

  const radarData = (tickers || []).map(t => ({
    ticker: t.ticker,
    sentiment: t.sentiment,
    velocity: t.velocity * 10,
  }));

  const barData = tickers.map((t, i) => ({
    ticker: t.ticker,
    sentiment: t.sentiment,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <span suppressHydrationWarning><TrendingUp className="w-4 h-4 text-green-400" /></span>;
    if (trend === 'down') return <span suppressHydrationWarning><TrendingDown className="w-4 h-4 text-red-400" /></span>;
    return <span suppressHydrationWarning><Activity className="w-4 h-4 text-gray-400" /></span>;
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400" suppressHydrationWarning>{averageVelocity.toFixed(1)}</div>
          <div className="text-slate-400 text-xs">Avg Velocity</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400" suppressHydrationWarning>{totalMentions}</div>
          <div className="text-slate-400 text-xs">Total Mentions</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-violet-400">{tickers.length}</div>
          <div className="text-slate-400 text-xs">Holdings</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Radar */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Portfolio Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Sentiment"
                dataKey="sentiment"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Sentiment by Ticker</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={chartConfig.tooltip.contentStyle}
                labelStyle={chartConfig.tooltip.labelStyle}
              />
              <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ticker Breakdown */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-4">Individual Holdings</h3>
        <div className="space-y-3">
          {tickers.map((ticker) => (
            <div key={ticker.ticker} className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
              <div className="w-16 font-bold">{ticker.ticker}</div>
              <div className="flex-1">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden" suppressHydrationWarning>
                  <div
                    className={`h-full ${ticker.sentiment >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${ticker.sentiment}%` }}
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className={`w-12 text-right font-bold ${getSentimentColor(ticker.sentiment)}`} suppressHydrationWarning>
                {ticker.sentiment}
              </div>
              <div className="w-16 text-right text-sm text-slate-400" suppressHydrationWarning>
                {ticker.velocity.toFixed(1)} vel
              </div>
              <div className="w-20 text-right text-sm text-slate-400" suppressHydrationWarning>
                <span suppressHydrationWarning>{ticker.mentions}</span> mentions
              </div>
              <TrendIcon trend={ticker.trend} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PortfolioAggregator({ autoRefresh }: PortfolioAggregatorProps) {
  const [selectedPortfolio, setSelectedPortfolio] = useState('magnificent-7');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentPortfolio = PORTFOLIOS[selectedPortfolio];

  // Fetch data when portfolio changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tickers = currentPortfolio.tickers.join(',');
        const response = await fetch(
          `/api/widgets/finance/portfolio-aggregator?portfolio=${selectedPortfolio}&tickers=${tickers}`
        );
        const result = await response.json();
        if (result.success) {
          setData({
            ...result.data,
            portfolioName: currentPortfolio.name,
          });
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedPortfolio, currentPortfolio, autoRefresh]);

  const overallSentiment = data?.overallSentiment ?? 50;

  return (
    <div className="pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">Portfolio Monitor</h1>
            <p className="text-slate-400 text-sm">
              Social sentiment across holdings
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${getSentimentColor(overallSentiment)}`} suppressHydrationWarning>
            {overallSentiment}
          </div>
          <div className="text-slate-400 text-sm">Overall Sentiment</div>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="mb-6 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
        >
          <div>
            <div className="text-xs text-slate-400 mb-1">Selected Portfolio</div>
            <div className="text-lg font-medium">{currentPortfolio.name}</div>
            <div className="text-xs text-slate-500 mt-1">
              {currentPortfolio.tickers.join(', ')}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-h-80 overflow-y-auto">
            {Object.entries(PORTFOLIOS).map(([key, portfolio]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedPortfolio(key);
                  setIsDropdownOpen(false);
                }}
                className={`w-full p-4 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0 ${
                  selectedPortfolio === key ? 'bg-slate-700' : ''
                }`}
              >
                <div className="font-medium">{portfolio.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {portfolio.tickers.join(', ')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <PortfolioAggregatorContent data={data} isLoading={isLoading} />
    </div>
  );
}

export default PortfolioAggregator;
