import { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useRouter } from 'next/router';
import EmailAIAssistance from '../EmailAIAssistance';

export default function Layout({ children }) {
  const router = useRouter();
  const emailId = router.pathname === '/email/[id]' && typeof router.query.id === 'string' ? router.query.id : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setSidebarOpen(false); }, [router.asPath]);

  // Lock body scroll while the drawer is open; restore on close/unmount.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // If the viewport grows past md while the drawer is open, reset its state.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    function handleChange(event) { if (event.matches) setSidebarOpen(false); }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <Header sidebarOpen={sidebarOpen} onSidebarOpen={() => setSidebarOpen(true)} />
        <main className="p-5 sm:p-8">
          {children}
          {emailId && <EmailAIAssistance emailId={emailId} />}
        </main>
      </div>
    </div>
  );
}
