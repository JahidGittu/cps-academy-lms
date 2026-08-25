'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { accessToken, api, clearTokens, setSignedOutHandler, storeTokens } from './api';
import type { RoleName, User } from './types';

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // populate=role is needed because the role is a relation. It only comes back at all thanks to
  // the server extension that puts it there; sanitizeOutput strips it otherwise.
  const loadUser = useCallback(async () => {
    if (!accessToken()) {
      setUser(null);
      setLoading(false);

      return;
    }

    try {
      const { data } = await api.get<User>('/users/me?populate=role');

      setUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Called when a refresh fails, which means the session is genuinely over rather than the
    // access token having merely expired.
    setSignedOutHandler(() => {
      setUser(null);
      router.push('/login');
    });
  }, [router]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/local', { identifier, password });

    storeTokens(data.jwt, data.refreshToken);

    await loadUser();
  };

  // No role is chosen here. Everyone who signs up is a Student, because letting a visitor pick
  // Admin would undo the whole permission matrix.
  const register = async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/local/register', { username, email, password });

    storeTokens(data.jwt, data.refreshToken);

    await loadUser();
  };

  const logout = async () => {
    // The server revokes the refresh token, so this is not just a local forget. Failing here
    // still has to clear the browser, or a signed-out user keeps a working token.
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) throw new Error('useAuth has to be called inside AuthProvider');

  return value;
};

export const hasRole = (user: User | null, ...names: RoleName[]) =>
  !!user?.role && names.includes(user.role.name);
