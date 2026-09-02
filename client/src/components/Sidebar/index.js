import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
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

/**
 * Static sidebar on md+ screens; slide-in drawer with backdrop below md.
 * Visibility (rather than display) is toggled so the close transition still
 * animates: CSS keeps visibility=visible for the whole transform transition.
 */
export default function Sidebar({ open = false, onClose }) {
  const router = useRouter();

  // Close the mobile drawer with the Escape key.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event) { if (event.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop behind the mobile drawer; never rendered on md+ screens. */}
      {open && <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" />}
      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-xl transition-[transform,visibility] duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:static md:w-60 md:translate-x-0 md:shadow-none ${open ? 'visible translate-x-0' : 'invisible -translate-x-full md:visible'}`}
      >
        <Link href="/dashboard" onClick={onClose} className="mb-8 block text-lg font-bold text-blue-700 dark:text-blue-400">
          Intelligent Email
        </Link>
        <nav className="space-y-1">
          {links.map(({ href, label, Icon }) => {
            const active = router.pathname === href || (href !== '/dashboard' && router.pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
    </>
  );
}
