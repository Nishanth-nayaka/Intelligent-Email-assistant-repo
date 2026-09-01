import Link from 'next/link';
import { Clock, ExternalLink, History } from 'lucide-react';

const relativeDate = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';

export default function DailySummary({ items = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <History size={18} className="text-blue-700 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Yesterday&apos;s email summary</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        AI-generated summary of meaningful events and updates from yesterday&apos;s messages.
      </p>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
            No meaningful events or updates were found in yesterday&apos;s messages.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.emailId}
              className="rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.sender}</p>
                <Link
                  href={`/email/${item.emailId}`}
                  className="shrink-0 text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
                >
                  View email →
                </Link>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.description}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={13} className="text-slate-400" />
                <span>{relativeDate(item.timestamp)}</span>
                <span>•</span>
                <span className="truncate">{item.subject}</span>
              </p>

              {item.sourceLinks?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.sourceLinks.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink size={12} /> Source link
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

