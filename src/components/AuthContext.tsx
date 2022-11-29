import { createContext, useContext, useState, useEffect, useMemo } from 'react';

import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';

type AuthContextType = {
  user?: User;
  loading: boolean;
  logout: () => void;
  checkRole: (role: User['role'] | User['role'][]) => boolean;
  login: (val: LoginInput) => Promise<User>;
};

type LoginInput = {
  username: string;
  password: string;
  remember: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, mutate } = useSWR<Res<User>>('/api/auth', fetcher, { errorRetryInterval: 10000 });
  const [loading, setLoading] = useState(true);
  const { pathname, replace } = useRouter();

  const user = useMemo(() => (error ? undefined : data?.result), [data, error]);

  useEffect(() => {
    if (!(!user && !error)) setLoading(false);

    if (error) {
      const _pathname = window.location.pathname;
      const message = data ? 'Session expired, please re-login' : '';
      if (pathname.includes('dashboard')) replace(`/login?redirect=${_pathname}&message=${message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, user, pathname]);

  async function login(val: LoginInput) {
    const res = await fetcher<Res<{ user: User; token: string }>>('/api/auth', {
      method: 'POST',
      body: {
        username: val.username,
        password: val.password,
        remember: val.remember,
      },
    });

    await mutate({ result: res.result.user } as Res<User>);
    return res.result.user;
  }

  async function logout() {
    await fetcher<Res<User>>('/api/auth', { method: 'DELETE' });
    replace('/login');
    mutate();
  }

  const checkRole = (role: User['role'] | User['role'][]) => {
    if (user!.role === 'ADMIN') return true;
    if (Array.isArray(role)) return role.includes(user!.role);
    return user!.role === role;
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      loading,
      checkRole,
    }),
    // eslint-disable-next-line
    [user, loading]
  );

  if (loading) return null;

  if (pathname.includes('dashboard') && !user) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
