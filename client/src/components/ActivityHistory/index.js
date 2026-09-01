import Link from 'next/link';
import { Archive, Bot, History, Mail, MailOpen, Reply, Send, Star, Trash2 } from 'lucide-react';

const ACTION_META = {
  email_sent: { label: 'Email sent', Icon: Send },
  reply_sent: { label: 'Reply sent', Icon: Reply },
  summarized: { label: 'AI summary generated', Icon: Bot },
  explained: { label: 'AI explanation generated', Icon: Bot },
  classified: { label: 'AI classification', Icon: Bot },
  reply_generated: { label: 'AI reply drafted', Icon: Bot },
  archived: { label: 'Email archived', Icon: Archive },
  deleted: { label: 'Email moved to trash', Icon: Trash2 },
  marked_read: { label: 'Marked as read', Icon: MailOpen },
  marked_unread: { label: 'Marked as unread', Icon: Mail },
  starred: { label: 'Starred', Icon: Star },
  unstarred: { label: 'Unstarred', Icon: Star },
  other: { label: 'Activity', Icon: History }
};

export default function ActivityHistory({ activities, loading, error }) {
  return (
    <section aria-label="Activity history">
      {loading && <p className="text-slate-600 dark:text-slate-400">Loading activity history…</p>}

      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <History size={28} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">No activity yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Actions you take — sending emails, replying, archiving, or using the AI tools — will appear here.
          </p>
        </div>
      )}

      {!loading && !error && activities.length > 0 && (
        <ol className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800">
          {activities.map((activity) => {
            const meta = ACTION_META[activity.activityType] || ACTION_META.other;
            const Icon = meta.Icon;
            return (
              <li key={activity.id} className="flex items-start gap-3 border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-700">
                <span className="mt-0.5 rounded-md bg-blue-50 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meta.label}</p>
                  <p className="mt-0.5 break-words text-sm text-slate-600 dark:text-slate-400">{activity.description}</p>
                  {activity.emailId && (
                    <Link
                      href={`/email/${activity.emailId}`}
                      className="mt-1.5 inline-block text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
                    >
                      View source email →
                    </Link>
                  )}
                </div>
                <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}