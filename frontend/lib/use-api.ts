'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { api, errorMessage, errorStatus } from './api';


// lightweight data-fetching hook — re-fetches whenever path changes, exposes reload for manual refresh
export const useApi = <T>(path: string | null) => {
  const [data,    setData]    = useState<T | null>(null);
  const [error,   setError]   = useState('');
  const [status,  setStatus]  = useState<number>();
  const [loading, setLoading] = useState(true);

  // keep a ref to the latest path so the reload callback is stable across renders
  const latest       = useRef(path);
  latest.current     = path;

  const reload = useCallback(async () => {
    const target = latest.current;

    if (!target) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get<T>(target);
      setData(response.data);
      setError('');
      setStatus(response.status);
    } catch (caught) {
      setError(errorMessage(caught));
      setStatus(errorStatus(caught));
    } finally {
      setLoading(false);
    }
  }, []);


  // fetch on mount and again whenever the path changes
  useEffect(() => {
    void reload();
  }, [path, reload]);


  return { data, error, status, loading, reload };
};
