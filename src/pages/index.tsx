import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

export default function Index() {
  const { replace } = useRouter();
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) replace('/dashboard');

  if (!user) replace('/login');

  return null;
}
