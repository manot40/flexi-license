import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import fetcher from 'libs/fetcher';

import { LoadingOverlay } from '@mantine/core';

type AuthContextType = {
  user?: User;
  loading: boolean;
  logout: () => void;
  checkRole: (role: string) => boolean;
  login: (val: LoginInput) => Promise<User>;
};

type LoginInput = {
  username: string;
  password: string;
  remember: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  const { pathname, replace } = useRouter();

  useEffect(() => {
    if (loading)
      fetcher<Res<User>>('/api/auth')
        .then((res) => {
          setUser(res.result);
          if (res.result && pathname.includes('login')) replace('/dashboard');
          if (!res.result && pathname.includes('dashboard')) replace('/login');
        })
        .catch(() => {
          replace('/login');
        })
        .finally(() => setLoading(false));
  }, [pathname, replace, loading]);

  async function login(val: LoginInput) {
    const res = await fetcher<Res<{ user: User; token: string }>>('/api/auth', {
      method: 'POST',
      body: {
        username: val.username,
        password: val.password,
        remember: val.remember,
      },
    });

    setUser(res.result.user);
    replace('/dashboard');
    return res.result.user;
  }

  function logout() {
    fetcher<Res<User>>('/api/auth', { method: 'DELETE' });
    setUser(undefined);
    replace('/login');
  }

  const checkRole = (role: string) => role === user?.role;

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

  if (loading) return <LoadingOverlay visible={true} />;

  if (pathname.includes('login') && user) return null;

  if (pathname.includes('dashboard') && !user) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
