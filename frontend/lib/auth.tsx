'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { accessToken, api, clearTokens, setSignedOutHandler, storeTokens } from './api';
import type { RoleName, User } from './types';

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User | null>;
  register: (username: string, email: string, password: string) => Promise<User | null>;
  reloadUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    if (!accessToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get<User>('/users/me?populate=role');
      setUser(data);
      return data;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
    return loadUser();
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/local/register', { username, email, password });
    storeTokens(data.jwt, data.refreshToken);
    return loadUser();
  };

  const reloadUser = async () => {
    return loadUser();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, reloadUser, logout }}>
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
