'use client';

import { useCallback, useEffect, useState } from 'react';

import { api, errorMessage } from './api';

// Every page reads from the API the same way: ask on mount, say so while it is in flight, then show
// what came back or why it did not. Written once here instead of as the same useEffect on ten pages.
// A null path means there is nothing to ask for yet, which is how a page waits on something it
// needs before it can build the request.
export const useApi = <T>(path: string | null) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!path) {
      setLoading(false);

      return;
    }

    setLoading(true);

    try {
      const response = await api.get<T>(path);

      setData(response.data);
      setError('');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
};
