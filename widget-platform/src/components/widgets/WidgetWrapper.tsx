'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { formatDateTime } from '@/lib/theme';

interface WidgetWrapperProps {
  category: string;
  widget: string;
  ticker?: string;
  tickers?: string[];
  theme?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds, default 30 minutes
  children: (
    data: unknown,
    isLoading: boolean,
    isError: boolean,
    refresh: () => void
  ) => React.ReactNode;
}

async function fetchWidgetData(
  category: string,
  widget: string,
  params: Record<string, string | string[] | undefined>
) {
  const searchParams = new URLSearchParams();

  if (params.ticker) searchParams.set('ticker', params.ticker as string);
  if (params.tickers)
    searchParams.set('tickers', (params.tickers as string[]).join(','));
  if (params.theme) searchParams.set('theme', params.theme as string);

  const response = await fetch(
    `/api/widgets/${category}/${widget}?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Widget API error: ${response.status}`);
  }

  return response.json();
}

export function WidgetWrapper({
  category,
  widget,
  ticker,
  tickers,
  theme,
  autoRefresh: initialAutoRefresh = false,
  refreshInterval = 30 * 60 * 1000, // 30 minutes default
  children,
}: WidgetWrapperProps) {
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
    isFetching,
  } = useQuery({
    queryKey: ['widget', category, widget, ticker, tickers, theme],
    queryFn: () => fetchWidgetData(category, widget, { ticker, tickers, theme }),
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  return (
    <div className="widget-container relative">
      {/* Refresh Controls Header */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        {/* Last Updated */}
        {dataUpdatedAt > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(dataUpdatedAt)}</span>
          </div>
        )}

        {/* Auto-refresh toggle */}
        <button
          onClick={toggleAutoRefresh}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            autoRefresh
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-400 hover:text-white'
          }`}
          title={autoRefresh ? 'Auto-refresh ON (30min)' : 'Auto-refresh OFF'}
        >
          {autoRefresh ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {autoRefresh ? 'Auto' : 'Manual'}
          </span>
        </button>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors disabled:opacity-50"
          title="Refresh now"
        >
          <RefreshCw
            className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-xl z-20">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-slate-400 text-sm">Loading widget data...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-xl z-20">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <span className="text-red-400 font-medium">Failed to load data</span>
            <span className="text-slate-400 text-sm max-w-xs">
              {error instanceof Error ? error.message : 'Unknown error'}
            </span>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Widget content */}
      {children(data, isLoading, isError, handleRefresh)}

      {/* Fetching indicator (when auto-refreshing) */}
      {isFetching && !isLoading && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
}

export default WidgetWrapper;
