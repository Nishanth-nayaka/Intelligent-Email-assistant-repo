import { Menu, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
export default function Header({ sidebarOpen = false, onSidebarOpen }) {
  const router = useRouter(); const [query, setQuery] = useState('');
  function submit(event) { event.preventDefault(); const value = query.trim(); if (value) router.push(`/inbox?q=${encodeURIComponent(value)}`); }
  return <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900"><button type="button" onClick={onSidebarOpen} aria-expanded={sidebarOpen} aria-label="Open navigation menu" title="Open navigation menu" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 md:hidden"><Menu size={16} /></button><form onSubmit={submit} className="flex w-full max-w-xl items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"><Search size={18} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" placeholder="Search mail" aria-label="Search mail" /></form><ThemeToggle /></header>;
}
