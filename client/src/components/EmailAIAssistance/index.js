import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import api from '../../services/api';

export default function EmailAIAssistance({ emailId }) {
  const [error, setError] = useState(''); const [loading, setLoading] = useState('');
  const [summary, setSummary] = useState(''); const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState(''); const [reply, setReply] = useState('');
  async function run(action) {
    setError(''); setLoading(action);
    try { const { data } = await api.post(`/ai/${action}/${emailId}`); if (action === 'summarize') setSummary(data.summary); if (action === 'explain') setExplanation(data.explanation); if (action === 'classify') setCategory(data.category); if (action === 'reply') setReply(data.reply); }
    catch (requestError) { setError(requestError.response?.data?.message || 'AI generation failed. Please try again.'); }
    finally { setLoading(''); }
  }
  const labels = { summarize: 'Summarize', explain: 'Explain this email', classify: 'Classify', reply: reply ? 'Regenerate reply' : 'Generate reply' };
  return <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5"><div className="flex items-center gap-2"><Bot size={18} className="text-blue-700" /><h2 className="font-semibold">AI assistance</h2></div><p className="mt-1 text-sm text-slate-600">AI-generated content is for review and may be inaccurate.</p><div className="mt-4 flex flex-wrap gap-2">{Object.keys(labels).map((action) => <button key={action} onClick={() => run(action)} disabled={Boolean(loading)} className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 disabled:opacity-60">{loading === action ? 'Generating…' : labels[action]}</button>)}</div>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}{category && <p className="mt-4 rounded-md bg-white p-3 text-sm"><span className="font-medium">AI classification:</span> {category}</p>}{summary && <article className="mt-4 rounded-md bg-white p-4"><h3 className="text-sm font-semibold text-blue-900">AI summary</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{summary}</p></article>}{explanation && <article className="mt-4 rounded-md bg-white p-4"><h3 className="text-sm font-semibold text-blue-900">AI explanation</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{explanation}</p></article>}{reply && <article className="mt-4 rounded-md bg-white p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-blue-900">AI-generated reply — edit before sending</h3><button onClick={() => setReply('')} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Cancel generated reply"><X size={17} /></button></div><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={8} className="mt-3 w-full rounded-md border border-slate-300 p-3 text-sm leading-6" aria-label="Editable AI-generated reply" /><p className="mt-2 text-xs text-slate-500">Sending replies is intentionally not available until Phase 5.</p></article>}</section>;
}
