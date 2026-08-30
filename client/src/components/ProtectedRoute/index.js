import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCurrentUser } from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { loading, user } = useCurrentUser();
  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]);
  if (loading || !user) return <main className="grid min-h-screen place-items-center text-slate-600">Loading your session…</main>;
  return children;
}
