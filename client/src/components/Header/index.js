import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
export default function Header() {
  const router = useRouter(); const [query, setQuery] = useState('');
  function submit(event) { event.preventDefault(); const value = query.trim(); if (value) router.push(`/inbox?q=${encodeURIComponent(value)}`); }
  return <header className="border-b border-slate-200 bg-white px-5 py-3"><form onSubmit={submit} className="flex max-w-xl items-center gap-3 rounded-lg bg-slate-100 px-3 py-2"><Search size={18} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search mail" aria-label="Search mail" /></form></header>;
}
