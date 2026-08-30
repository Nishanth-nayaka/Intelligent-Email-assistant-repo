import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import OTPSection from '../components/OTPSection';
import api from '../services/api';

function OTPPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/emails/otp')
      .then(({ data }) => {
        setEmails(data.emails || []);
      })
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            'Could not load verification emails. Please check your Gmail connection.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <OTPSection emails={emails} loading={loading} error={error} />
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <OTPPage />
    </ProtectedRoute>
  );
}

