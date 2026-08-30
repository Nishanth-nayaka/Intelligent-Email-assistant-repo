import Link from 'next/link';
import { ChevronRight, Clock, KeyRound, ShieldAlert, Sparkles } from 'lucide-react';

const relativeDate = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';

export default function OTPSection({ emails = [], loading = false, error = '' }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound size={24} className="text-blue-700" />
            <h1 className="text-2xl font-bold text-slate-900">OTP & Verification Codes</h1>
          </div>
          <p className="mt-1 text-slate-600">
            Quickly locate security codes and verification messages detected from your Gmail.
          </p>
        </div>
      </div>

      {/* Security Advisory */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold text-amber-950">Security & Privacy Reminder</p>
          <p className="mt-0.5 text-xs leading-5 text-amber-800">
            Verification codes are sensitive and time-limited. Never share one-time passwords or security credentials with anyone.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Failed to load verification messages</p>
          <p className="mt-1">{error}</p>
          {error.includes('Connect Gmail') && (
            <Link href="/integrations" className="mt-3 inline-block font-medium underline">
              Connect Gmail
            </Link>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          <Sparkles size={24} className="mx-auto animate-pulse text-blue-600" />
          <p className="mt-3 font-medium text-slate-900">Scanning recent emails for verification codes...</p>
          <p className="mt-1 text-xs text-slate-500">AI is identifying authentication and OTP messages.</p>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <KeyRound size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 font-medium text-slate-800">No verification emails detected</p>
              <p className="mt-1 text-sm text-slate-500">
                Recent emails do not contain any detected one-time passwords or authentication codes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {emails.map((email) => (
                <article
                  key={email.emailId}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          <KeyRound size={12} /> Verification
                        </span>
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {email.sender}
                        </span>
                      </div>
                      <h2 className="mt-2 text-base font-medium text-slate-900">
                        {email.subject}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {email.description || email.reason || email.snippet}
                      </p>
                      {email.snippet && email.snippet !== email.description && (
                        <p className="mt-2 rounded bg-slate-50 p-2.5 font-mono text-xs text-slate-700">
                          {email.snippet}
                        </p>
                      )}
                      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={13} />
                        <span>{relativeDate(email.timestamp)}</span>
                      </p>
                    </div>

                    <Link
                      href={`/email/${email.emailId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                      Open Email <ChevronRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

