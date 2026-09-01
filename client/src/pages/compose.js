import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ComposeEmail from '../components/ComposeEmail';

function ComposePage() {
  return (
    <Layout>
      <ComposeEmail />
    </Layout>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ComposePage />
    </ProtectedRoute>
  );
}
