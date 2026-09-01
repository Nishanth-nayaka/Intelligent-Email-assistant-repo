import Link from 'next/link';
import { useRouter } from 'next/router';
import { History, Inbox, LayoutDashboard, PenSquare, Plug, Send, Settings, ShieldCheck } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', Icon: Inbox },
  { href: '/compose', label: 'Compose', Icon: PenSquare },
  { href: '/sent', label: 'Sent', Icon: Send },
  { href: '/otp', label: 'OTP & Codes', Icon: ShieldCheck },
  { href: '/activity', label: 'Activity', Icon: History },
  { href: '/integrations', label: 'Integrations', Icon: Plug },
  { href: '/settings', label: 'Settings', Icon: Settings }
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:block">
      <Link href="/dashboard" className="mb-8 block text-lg font-bold text-blue-700 dark:text-blue-400">
        Intelligent Email
      </Link>
      <nav className="space-y-1">
        {links.map(({ href, label, Icon }) => {
          const active = router.pathname === href || (href !== '/dashboard' && router.pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
