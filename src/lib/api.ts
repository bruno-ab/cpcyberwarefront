const DEFAULT_PROD_API = 'https://cyberpunk-api-262d98a845d6.herokuapp.com';

/** Resolve API origin at call time (SSR-safe, LAN-friendly). */
export const getApiBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return `${protocol}//${hostname}:4444`;
    }
  }

  return DEFAULT_PROD_API;
};

/** @deprecated Prefer getApiBaseUrl(); kept for socket.io init. */
export const API_BASE_URL = getApiBaseUrl();

export const apiUrl = (path: string) =>
  `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${
    typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''
  }`,
});

/** fetch to the API; returns null on network/CORS failure (never throws). */
export const apiFetch = async (
  path: string,
  init?: RequestInit,
): Promise<Response | null> => {
  try {
    return await fetch(apiUrl(path), init);
  } catch {
    return null;
  }
};
