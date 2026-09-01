import { useState } from 'react';
import { AlertCircle, Bot, CheckCircle2, RefreshCw, Send, Sparkles, X } from 'lucide-react';
import api from '../../services/api';

export default function ReplyComposer({ emailId, onReplySuccess }) {
  const [replyText, setReplyText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  async function handleGenerate() {
    setError('');
    setWarning('');
    setGenerating(true);
    setIsOpen(true);
    try {
      const { data } = await api.post(`/ai/reply/${emailId}`);
      if (data.reply) {
        setReplyText(data.reply);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to generate AI reply. You can still type your response manually below.'
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!replyText.trim()) {
      setError('Reply message body cannot be empty.');
      return;
    }

    setError('');
    setSending(true);
    try {
      const { data } = await api.post(`/emails/${emailId}/reply`, {
        body: replyText.trim()
      });
      setSuccess(true);
      setWarning(data.activityLogged === false && typeof data.warning === 'string' ? data.warning : '');
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Failed to send reply. Please verify your Gmail authorization.'
      );
    } finally {
      setSending(false);
    }
  }

  function handleCancel() {
    setReplyText('');
    setError('');
    setWarning('');
    setSuccess(false);
    setIsOpen(false);
  }

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-700 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Reply to conversation</h2>
        </div>

        {!isOpen && !success && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-blue-950/50"
            >
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              {generating ? 'Generating AI draft…' : 'Generate AI Reply'}
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Write Manually
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {success && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-green-950 dark:text-green-100">
              <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
              <span>Reply sent successfully!</span>
            </div>
            <button
              onClick={handleCancel}
              className="rounded p-1 text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
          {warning ? (
            <p className="mt-2 rounded-md bg-amber-100 p-2 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">{warning}</p>
          ) : (
            <p className="mt-1 text-xs text-green-800 dark:text-green-300">
              Your reply has been delivered through Gmail and recorded in your activity history.
            </p>
          )}
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Generating Indicator */}
      {generating && (
        <div className="mt-4 rounded-lg bg-white p-6 text-center text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Sparkles size={22} className="mx-auto animate-pulse text-blue-600 dark:text-blue-400" />
          <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
            Analyzing email & thread context to draft reply...
          </p>
        </div>
      )}

      {/* Reply Composer Form */}
      {isOpen && !generating && !success && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Review and edit your reply before sending:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-1 text-blue-700 hover:underline dark:text-blue-400"
              >
                <RefreshCw size={12} /> Regenerate AI Draft
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here, or click 'Regenerate AI Draft' to let AI write a draft..."
            disabled={sending}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3.5 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            aria-label="Editable email reply"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleSend}
              disabled={sending || !replyText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? 'Sending reply…' : 'Send Reply'}
            </button>

            <button
              onClick={handleCancel}
              disabled={sending}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
