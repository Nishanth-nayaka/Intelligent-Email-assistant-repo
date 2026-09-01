import Link from 'next/link';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import PriorityPanel from '../PriorityPanel';
import DailySummary from '../DailySummary';
import UpcomingActivities from '../UpcomingActivities';

export default function Dashboard({ data, loading, error, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Header with Title and Generation Meta */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            AI-extracted priorities, deadlines, and activity from your connected Gmail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span>AI-generated {new Date(data.generatedAt).toLocaleTimeString()}</span>
            </p>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle size={17} /> Dashboard unavailable
          </div>
          <p className="mt-1">{error}</p>
          {error.includes('Connect Gmail') && (
            <Link href="/integrations" className="mt-3 inline-block font-medium underline">
              Connect Gmail
            </Link>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
          <Sparkles size={28} className="mx-auto animate-pulse text-blue-600 dark:text-blue-400" />
          <p className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
            Analyzing your recent email activity...
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Extracting priorities, actionable items, and yesterday&apos;s summary.
          </p>
        </div>
      )}

      {/* Main Dashboard Content */}
      {data && (
        <>
          {/* Priority Panel (Today's Priorities + Detected Tasks) */}
          <PriorityPanel
            priorities={data.priorities}
            priorityCounts={data.priorityCounts}
          />

          {/* Side-by-side Insights: Yesterday's Summary & Upcoming Activities */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DailySummary items={data.yesterdaySummary} />
            <UpcomingActivities items={data.upcoming} />
          </div>
        </>
      )}
    </div>
  );
}

