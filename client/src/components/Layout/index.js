import Sidebar from '../Sidebar';
import Header from '../Header';
import { useRouter } from 'next/router';
import EmailAIAssistance from '../EmailAIAssistance';
export default function Layout({ children }) { const router = useRouter(); const emailId = router.pathname === '/email/[id]' && typeof router.query.id === 'string' ? router.query.id : null; return <div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header /><main className="p-5 sm:p-8">{children}{emailId && <EmailAIAssistance emailId={emailId} />}</main></div></div>; }
