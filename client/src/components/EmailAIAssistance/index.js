import { useState } from 'react';
import { Bot } from 'lucide-react';
import api from '../../services/api';

export default function EmailAIAssistance({ emailId }) {
  const [error, setError] = useState(''); const [loading, setLoading] = useState('');
  const [summary, setSummary] = useState(''); const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState(''); const [warning, setWarning] = useState('');
  async function run(action) {
    setError(''); setWarning(''); setLoading(action);
    try { const { data } = await api.post(`/ai/${action}/${emailId}`); if (action === 'summarize') setSummary(data.summary); if (action === 'explain') setExplanation(data.explanation); if (action === 'classify') setCategory(data.category); setWarning(typeof data.warning === 'string' ? data.warning : ''); }
    catch (requestError) { setError(requestError.response?.data?.message || 'AI generation failed. Please try again.'); }
    finally { setLoading(''); }
  }
  const labels = { summarize: 'Summarize', explain: 'Explain this email', classify: 'Classify' };
  return <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/60 dark:bg-blue-950/40"><div className="flex items-center gap-2"><Bot size={18} className="text-blue-700 dark:text-blue-400" /><h2 className="font-semibold">AI assistance</h2></div><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">AI-generated content is for review and may be inaccurate. Reply drafting and sending live in the reply composer above.</p><div className="mt-4 flex flex-wrap gap-2">{Object.keys(labels).map((action) => <button key={action} onClick={() => run(action)} disabled={Boolean(loading)} className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 disabled:opacity-60 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300">{loading === action ? 'Generating…' : labels[action]}</button>)}</div>{error && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}{category && <p className="mt-4 rounded-md bg-white p-3 text-sm dark:bg-slate-800/70"><span className="font-medium">AI classification:</span> {category}</p>}{summary && <article className="mt-4 rounded-md bg-white p-4 dark:bg-slate-800/70"><h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">AI summary</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{summary}</p></article>}{explanation && <article className="mt-4 rounded-md bg-white p-4 dark:bg-slate-800/70"><h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">AI explanation</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{explanation}</p></article>}{warning && <p className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{warning}</p>}</section>;
}
