'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { api, errorMessage, errorStatus } from './api';

// Every page reads from the API the same way: ask on mount, say so while it is in flight, then show
// what came back or why it did not. Written once here instead of as the same useEffect on ten pages.
// A null path means there is nothing to ask for yet, which is how a page waits on something it
// needs before it can build the request.
export const useApi = <T>(path: string | null) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<number>();
  const [loading, setLoading] = useState(true);

  // The path goes through a ref so that reload is the same function for the life of the component.
  // It used to close over the path it was made with, which meant a caller holding on to a reload
  // from before the path was known was holding a function that did nothing: the course page signs
  // somebody up, and the reload it had captured still thought there was no student to ask about.
  const latest = useRef(path);

  latest.current = path;

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

  useEffect(() => {
    void reload();
  }, [path, reload]);

  return { data, error, status, loading, reload };
};
