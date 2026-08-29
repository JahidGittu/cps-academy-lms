import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const rawHost = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1337';
const host = rawHost.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const strapiHost = host;

export const api = axios.create({ baseURL: `${host}/api` });


const ACCESS_KEY = 'lms.jwt';
const REFRESH_KEY = 'lms.refresh';

const read = (key: string) => (typeof window === 'undefined' ? null : localStorage.getItem(key));

export const accessToken = () => read(ACCESS_KEY);

export const storeTokens = (jwt: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_KEY, jwt);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

let onSignedOut: (() => void) | null = null;

export const setSignedOutHandler = (handler: () => void) => {
  onSignedOut = handler;
};

const rotate = async () => {
  const refreshToken = read(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${host}/api/auth/refresh`, { refreshToken });
    storeTokens(data.jwt, data.refreshToken);
    return data.jwt as string;
  } catch {
    clearTokens();
    onSignedOut?.();
    return null;
  }
};

let inFlight: Promise<string | null> | null = null;

const refresh = () => {
  inFlight ??= rotate().finally(() => {
    inFlight = null;
  });

  return inFlight;
};

api.interceptors.request.use((config) => {
  const jwt = accessToken();
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

type Retryable = InternalAxiosRequestConfig & { retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as Retryable | undefined;

    if (error.response?.status !== 401 || !request || request.retried) {
      return Promise.reject(error);
    }

    request.retried = true;
    const jwt = await refresh();

    if (!jwt) return Promise.reject(error);

    request.headers.Authorization = `Bearer ${jwt}`;
    return api(request);
  }
);

export const errorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (error instanceof AxiosError) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }
  return fallback;
};

export const errorStatus = (error: unknown) =>
  error instanceof AxiosError ? error.response?.status : undefined;
