import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const host = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1337';

export const api = axios.create({ baseURL: `${host}/api` });

const ACCESS_KEY = 'lms.jwt';
const REFRESH_KEY = 'lms.refresh';

// Next renders client components on the server for the first response, where there is no
// localStorage, so every read has to survive window being undefined.
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

// Set by the auth provider. Keeps the redirect in the React layer rather than having this file
// reach for window.location.
let onSignedOut: (() => void) | null = null;

export const setSignedOutHandler = (handler: () => void) => {
  onSignedOut = handler;
};

const rotate = async () => {
  const refreshToken = read(REFRESH_KEY);

  if (!refreshToken) return null;

  try {
    // Plain axios rather than the instance above: the instance would attach the access token
    // that just expired, and its own 401 handler would call this again.
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

// One refresh at a time. The server revokes the old refresh token the moment the first call
// rotates it, so ten parallel 401s must not become ten refresh calls: nine would fail against a
// revoked token and sign the user out for no reason.
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

    // Access tokens last ten minutes, so a 401 on a request that carried one usually means it
    // expired rather than that the user is signed out. The retried flag stops a request that
    // fails again after a fresh token from looping.
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

// Strapi answers errors as { data: null, error: { status, name, message } }, which axios buries.
export const errorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (error instanceof AxiosError) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }

  return fallback;
};

// Some pages have something better to say about one particular status than the message the server
// sent, so the code travels alongside the message rather than only the text.
export const errorStatus = (error: unknown) =>
  error instanceof AxiosError ? error.response?.status : undefined;
