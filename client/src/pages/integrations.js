import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../services/api';

function Integrations() {
  const [status, setStatus] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/integrations/gmail/status').then(({ data }) => setStatus(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Could not load Gmail status.')); }, []);
  async function connect() { setBusy(true); setError(''); try { const { data } = await api.get('/integrations/gmail/oauth/start'); window.location.assign(data.authorizationUrl); } catch (requestError) { setError(requestError.response?.data?.message || 'Could not start Gmail connection.'); setBusy(false); } }
  return <Layout><h1 className="text-2xl font-bold">Integrations</h1><section className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Gmail</h2>{status ? <p className="mt-2 text-sm text-slate-600">{status.connected ? `Connected${status.connectedAt ? ` on ${new Date(status.connectedAt).toLocaleDateString()}` : ''}` : 'No Gmail account connected.'}</p> : <p className="mt-2 text-sm text-slate-600">Checking connection status…</p>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<button disabled={busy || !status} onClick={connect} className="mt-5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Opening Google…' : status?.connected ? 'Reconnect Gmail' : 'Connect Gmail'}</button><p className="mt-4 text-xs leading-5 text-slate-500">You will authenticate on Google&apos;s consent screen. This app never asks for your Gmail password.</p></section></Layout>;
}
export default function Page() { return <ProtectedRoute><Integrations /></ProtectedRoute>; }
