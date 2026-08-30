import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';


// strip any trailing /api from the env var so we can compose URLs cleanly
const rawHost =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cps-academy-lms-production.up.railway.app';
const host = rawHost.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const strapiHost = host;

// single axios instance — all requests go through this
export const api = axios.create({ baseURL: `${host}/api` });


const ACCESS_KEY  = 'lms.jwt';
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


// callback invoked when a refresh attempt fails — used by AuthProvider to redirect to /login
let onSignedOut: (() => void) | null = null;

export const setSignedOutHandler = (handler: () => void) => {
  onSignedOut = handler;
};


// silently swaps in a new JWT when the refresh token is still valid
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


// single-flight guard — concurrent 401s only trigger one refresh call
let inFlight: Promise<string | null> | null = null;

const refresh = () => {
  inFlight ??= rotate().finally(() => { inFlight = null; });
  return inFlight;
};


// attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const jwt = accessToken();
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});


type Retryable = InternalAxiosRequestConfig & { retried?: boolean };

// on 401, try to refresh once and retry the original request
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


// pull a readable message out of any Axios error response
export const errorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (error instanceof AxiosError) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }
  return fallback;
};

export const errorStatus = (error: unknown) =>
  error instanceof AxiosError ? error.response?.status : undefined;
