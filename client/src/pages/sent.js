import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PenSquare } from 'lucide-react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../services/api';

function Sent() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/emails?label=SENT')
      .then(({ data }) => {
        if (!cancelled) setResult(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message || 'Could not load your sent messages. Please verify your Gmail connection.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const emails = result?.emails || [];

  return (
    <Layout>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sent</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Messages sent from your connected Gmail account.</p>
        </div>
        <Link
          href="/compose"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <PenSquare size={16} />
          Compose
        </Link>
      </div>

      {error && <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
      {loading && !error && <p className="mt-8 text-slate-600 dark:text-slate-400">Loading sent messages…</p>}

      {!loading && !error && emails.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No sent messages yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Messages you send will appear here.</p>
          <Link href="/compose" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-400">
            Compose an email →
          </Link>
        </div>
      )}

      {!loading && !error && emails.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/email/${email.id}`}
              className="block border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
            >
              <div className="flex justify-between gap-4">
                <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  To: {email.recipients || '(no recipients)'}
                </span>
                <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {email.timestamp ? new Date(email.timestamp).toLocaleString() : ''}
                </time>
              </div>
              <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-300">{email.subject}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email.snippet}</p>
            </Link>
          ))}
        </section>
      )}
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <Sent />
    </ProtectedRoute>
  );
}