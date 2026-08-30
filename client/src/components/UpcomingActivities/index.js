import Link from 'next/link';
import { Calendar, ChevronRight, ExternalLink } from 'lucide-react';

const relativeDate = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';

export default function UpcomingActivities({ items = [] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-blue-700" />
        <h2 className="text-lg font-semibold text-slate-900">Upcoming activities</h2>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Time-sensitive deadlines and events detected for tomorrow and the day after.
      </p>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            No upcoming deadlines or meetings were detected for the next two days.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={`${item.emailId}-${item.description}`}
              className="rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      item.daysAway === 1
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.daysAway === 1 ? 'Tomorrow' : 'In 2 days'}
                  </span>
                  <h3 className="mt-1.5 font-medium text-slate-900">{item.description}</h3>
                </div>
                <Link
                  href={`/email/${item.emailId}`}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  Details <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                <span>{item.dateLabel || relativeDate(item.date)}</span>
                <span className="mx-1.5">•</span>
                <span className="truncate">{item.sender}</span>
              </div>

              {item.sourceLinks?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.sourceLinks.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
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

