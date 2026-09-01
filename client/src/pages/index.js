import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Bot,
  Inbox,
  LockKeyhole,
  PenSquare,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Secure Gmail connection',
    description: 'Authorize through official Google OAuth 2.0 — this app never sees your Gmail password, and tokens are encrypted at rest.'
  },
  {
    Icon: Sparkles,
    title: 'AI that explains your mail',
    description: 'Summaries, plain-language explanations, category classifications, and editable draft replies, always reviewed by you before sending.'
  },
  {
    Icon: Inbox,
    title: 'Intelligent dashboard',
    description: "Today's priorities with dynamic urgency, detected deadlines, yesterday's summary, and upcoming activities — extracted automatically."
  },
  {
    Icon: Bell,
    title: 'OTP & code detection',
    description: 'Verification codes are detected the moment they arrive, gathered in one place so you never dig through your inbox again.'
  },
  {
    Icon: PenSquare,
    title: 'Compose with confidence',
    description: 'Write, reply, and send through Gmail with hardened outgoing validation that protects every message you send.'
  },
  {
    Icon: Bot,
    title: 'Activity you can audit',
    description: 'Every email and AI action is recorded in a chronological history with traceable links back to the source email.'
  }
];

const STEPS = [
  {
    title: 'Create your account',
    description: 'Register with your email and password — your workspace is protected by JWT-based sessions.'
  },
  {
    title: 'Connect Gmail securely',
    description: "Authorize through Google's own OAuth consent screen in a couple of clicks."
  },
  {
    title: 'Let the assistant work',
    description: 'Open the dashboard each morning and let AI surface what matters across your mail.'
  }
];

export default function Home() {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    setHasSession(Boolean(window.localStorage.getItem('auth_token')));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">Intelligent Email</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {hasSession ? (
              <Link href="/dashboard" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800">
                Open dashboard
              </Link>
            ) : (
              <Link href="/login" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles size={14} /> AI-assisted email, powered by your own Gmail
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              A familiar inbox, with help understanding{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                what matters
              </span>
              .
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Intelligent Email Assistant connects to Gmail through official Google OAuth, then uses AI to surface
              priorities, deadlines, verification codes, and summaries — so you spend your time responding instead of
              sorting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hasSession ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800"
              >
                {hasSession ? 'Go to your dashboard' : 'Create your account'}
                <ArrowRight size={18} />
              </Link>
              {!hasSession && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Log in
                </Link>
              )}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <LockKeyhole size={14} /> Authorized through Google OAuth 2.0 — we never ask for your Gmail password.
            </p>
          </div>
        </section>
        {/* Product preview (decorative mock of the intelligent dashboard) */}
        <section aria-hidden="true" className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
              <span className="flex items-center gap-2 font-semibold">
                <Inbox size={18} className="text-blue-700 dark:text-blue-400" />
                Dashboard
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles size={13} className="text-blue-600 dark:text-blue-400" /> AI-generated just now
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                <span className="text-3xl font-bold text-red-800 dark:text-red-300">3</span>
                <h3 className="mt-1 text-sm font-semibold text-red-800 dark:text-red-300">Urgent / today</h3>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                <span className="text-3xl font-bold text-amber-800 dark:text-amber-300">5</span>
                <h3 className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-300">Approaching</h3>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                <span className="text-3xl font-bold text-blue-800 dark:text-blue-300">2</span>
                <h3 className="mt-1 text-sm font-semibold text-blue-800 dark:text-blue-300">Future</h3>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">Finance Team — Invoice #4821 due</p>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Tomorrow
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  AI-detected deadline with a traceable link to the source email.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">Your sign-in code is 824193</p>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    In 2 days
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Verification codes are gathered automatically in the OTP section.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-2xl font-bold sm:text-3xl">Everything the assistant does for you</h2>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              Phases 1–5 are implemented and operational — from secure Gmail retrieval to AI understanding,
              composition, and a full activity trail.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <span className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Up and running in three steps</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white dark:bg-blue-500">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security band */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40 sm:flex-row sm:items-center">
            <ShieldCheck size={28} className="shrink-0 text-blue-700 dark:text-blue-300" />
            <div>
              <h2 className="font-semibold text-blue-900 dark:text-blue-200">Security by design</h2>
              <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-300">
                Gmail access is authorized exclusively through Google&apos;s OAuth consent screen, and OAuth tokens are
                encrypted at rest with AES-256-GCM. All API keys and credentials stay isolated server-side.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Intelligent Email Assistant</p>
          <p>Gmail via OAuth 2.0 · Google Gemini AI · Light &amp; dark mode</p>
        </div>
      </footer>
    </div>
  );
}
