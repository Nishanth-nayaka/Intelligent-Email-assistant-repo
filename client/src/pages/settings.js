import { useRouter } from 'next/router';
import Link from 'next/link';
import { LogOut, Plug, ShieldCheck, User } from 'lucide-react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { clearSession, useCurrentUser } from '../store/authStore';

function Settings() {
  const router = useRouter();
  const { user } = useCurrentUser();

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your account and preferences.</p>
        </div>

        {/* User Profile */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || 'Loading email...'}</p>
            </div>
          </div>
        </section>

        {/* Quick Integrations Link */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plug size={20} className="text-blue-700 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Gmail Integration</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage Google OAuth connection</p>
              </div>
            </div>
            <Link
              href="/integrations"
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-950/50"
            >
              Configure →
            </Link>
          </div>
        </section>

        {/* Security & OTP */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-green-700 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Security & OTP Detection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quick access to verification codes</p>
              </div>
            </div>
            <Link
              href="/otp"
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              View OTPs →
            </Link>
          </div>
        </section>

        {/* Session Management */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut size={16} /> Sign out of your account
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}

