import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, CheckCircle2, Send, Sparkles, X } from 'lucide-react';
import api from '../../services/api';

export default function ComposeEmail() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState('');

  function resetForm() {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setError('');
    setWarning('');
    setSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!to.trim()) {
      setError('Please provide at least one recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide a subject for your email.');
      return;
    }
    if (!body.trim()) {
      setError('Message body cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/emails/send', {
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim(),
        body: body.trim()
      });
      setSuccess(true);
      setWarning(data.activityLogged === false && typeof data.warning === 'string' ? data.warning : '');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to send email. Please verify your Gmail connection and recipient address.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Compose Email</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Compose and send messages through your connected Gmail account.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900 shadow-sm dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          <div className="flex items-center gap-2.5 font-semibold text-green-950 dark:text-green-100">
            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
            <span>Email sent successfully!</span>
          </div>
          {warning ? (
            <p className="mt-2 rounded-md bg-amber-100 p-2.5 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">{warning}</p>
          ) : (
            <p className="mt-1.5 text-sm text-green-800 dark:text-green-300">
              Your email was transmitted through Gmail and recorded in your activity history.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={resetForm}
              className="rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-800"
            >
              Compose Another Message
            </button>
            <Link
              href="/sent"
              className="rounded-lg border border-green-300 bg-white px-4 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100 dark:border-green-800 dark:bg-slate-800 dark:text-green-300 dark:hover:bg-green-950/40"
            >
              View in Sent Mail →
            </Link>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-medium">Could not send email</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Compose Form */}
      {!success && (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800"
        >
          {/* Recipients / To */}
          <div className="flex items-center border-b border-slate-100 px-5 py-3 dark:border-slate-700">
            <label htmlFor="compose-to" className="w-16 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
              To
            </label>
            <input
              id="compose-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              disabled={loading}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              required
            />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {/* Optional CC */}
          {showCc && (
            <div className="flex items-center border-b border-slate-100 px-5 py-2.5 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/40">
              <label htmlFor="compose-cc" className="w-16 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                Cc
              </label>
              <input
                id="compose-cc"
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                disabled={loading}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Remove Cc"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Optional BCC */}
          {showBcc && (
            <div className="flex items-center border-b border-slate-100 px-5 py-2.5 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/40">
              <label htmlFor="compose-bcc" className="w-16 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                Bcc
              </label>
              <input
                id="compose-bcc"
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                disabled={loading}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => {
                  setShowBcc(false);
                  setBcc('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Remove Bcc"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center border-b border-slate-100 px-5 py-3 dark:border-slate-700">
            <label htmlFor="compose-subject" className="w-16 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
              Subject
            </label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              disabled={loading}
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              required
            />
          </div>

          {/* Body */}
          <div className="p-5">
            <textarea
              id="compose-body"
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              disabled={loading}
              className="w-full resize-y bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              required
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900/60">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
            >
              <Send size={16} />
              {loading ? 'Sending message…' : 'Send'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/inbox')}
              disabled={loading}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Discard
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
