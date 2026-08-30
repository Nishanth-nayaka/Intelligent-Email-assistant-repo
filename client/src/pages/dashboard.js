import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import api from '../services/api';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: response } = await api.get('/dashboard');
      setData(response);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not generate your intelligent dashboard. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <Layout>
      <Dashboard
        data={data}
        loading={loading}
        error={error}
        onRefresh={fetchDashboard}
      />
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
