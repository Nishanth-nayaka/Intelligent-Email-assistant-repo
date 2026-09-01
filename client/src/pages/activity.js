import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ActivityHistory from '../components/ActivityHistory';
import api from '../services/api';

function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/activity')
      .then(({ data }) => {
        if (!cancelled) setActivities(data.activities || []);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              'Could not load your activity history. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Activity history</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          A chronological record of the emails and AI actions you have taken.
        </p>
        <div className="mt-6">
          <ActivityHistory activities={activities} loading={loading} error={error} />
        </div>
      </div>
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ActivityPage />
    </ProtectedRoute>
  );
}