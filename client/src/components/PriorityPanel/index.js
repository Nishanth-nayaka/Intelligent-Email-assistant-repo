import Link from 'next/link';
import { CalendarDays, ChevronRight, Clock3, ExternalLink, ListChecks } from 'lucide-react';

const priorityStyle = {
  high: 'border-red-200 bg-red-50 text-red-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  low: 'border-blue-200 bg-blue-50 text-blue-800'
};

const badgeStyle = {
  high: 'bg-red-100 text-red-800 border border-red-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  low: 'bg-blue-100 text-blue-800 border border-blue-200'
};

const relativeDate = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Date not specified';

export default function PriorityPanel({ priorities = [], priorityCounts = { high: 0, medium: 0, low: 0 } }) {
  const sections = [
    {
      key: 'high',
      title: 'Urgent / today',
      count: priorityCounts.high || 0,
      description: 'Urgent requests, security items, and deadlines needing attention now.'
    },
    {
      key: 'medium',
      title: 'Approaching',
      count: priorityCounts.medium || 0,
      description: 'Upcoming deadlines and activities that are getting close.'
    },
    {
      key: 'low',
      title: 'Future',
      count: priorityCounts.low || 0,
      description: 'Future or non-urgent items worth keeping visible.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Priority Summary Cards */}
      <section>
        <div className="flex items-center gap-2">
          <ListChecks size={19} className="text-blue-700" />
          <h2 className="text-lg font-semibold">Today&apos;s priorities</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Click a priority indicator to jump directly to the corresponding tasks.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {sections.map((section) => (
            <a
              key={section.key}
              href={`#priority-${section.key}`}
              className={`rounded-xl border p-4 transition hover:brightness-95 ${priorityStyle[section.key]}`}
            >
              <span className="text-3xl font-bold">{section.count}</span>
              <h3 className="mt-2 font-semibold">{section.title}</h3>
              <p className="mt-1 text-xs leading-5 opacity-80">{section.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Detected Tasks & Action Items */}
      <section>
        <h2 className="text-lg font-semibold">Detected tasks and activities</h2>
        <p className="mt-1 text-sm text-slate-600">
          AI-extracted details are traceable to the original email.
        </p>

        <div className="mt-4 space-y-3">
          {priorities.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              No actionable priorities were detected in the recent messages.
            </p>
          ) : (
            priorities.map((item) => (
              <article
                id={`priority-${item.priority}`}
                key={`${item.emailId}-${item.description}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStyle[item.priority]}`}
                    >
                      {item.priority} priority
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{item.description}</h3>
                    <p className="text-sm text-slate-600">{item.reason}</p>
                  </div>
                  <Link
                    href={`/email/${item.emailId}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    Open email <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <p className="flex gap-2">
                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">When:</strong>{' '}
                      {item.dateLabel || relativeDate(item.date)}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      <strong className="text-slate-900">Source:</strong> {item.sender} — {item.subject}
                    </span>
                  </p>
                </div>

                {item.actionItems?.length > 0 && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Required Actions
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-slate-700">
                      {item.actionItems.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.sourceLinks?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {item.sourceLinks.map((link) => (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 break-all text-xs font-medium text-blue-700 hover:underline"
                      >
                        <ExternalLink size={13} /> Source link
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

