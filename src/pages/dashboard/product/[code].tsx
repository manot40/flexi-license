import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

export default function ProductDetail() {
  const { checkRole } = useAuth();
  const { replace, query } = useRouter();

  const isAdmin = checkRole('ADMIN');

  useEffect(() => {
    if (!isAdmin) replace('/dashboard');
  }, [isAdmin, replace]);

  if (!isAdmin) return null;

  return query.code;
}
