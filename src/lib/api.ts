const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

/** Em localhost sem env, aponta para API local; senão Heroku (prod). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocalHost
    ? 'http://localhost:4444'
    : 'https://cyberpunk-api-262d98a845d6.herokuapp.com');

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${
    typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''
  }`,
});
