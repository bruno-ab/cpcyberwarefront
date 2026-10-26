export type JwtPayload = {
  id?: number;
  sub?: number;
  username?: string;
  name?: string;
};

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as JwtPayload;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
};

export const getPlayerIdFromToken = (): number => {
  const payload = parseJwt(getAccessToken());
  return Number(payload?.id || payload?.sub || 0) || 0;
};

export const AUTH_CHANGED_EVENT = 'nc-auth-changed';

export const notifyAuthChanged = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
  notifyAuthChanged();
};

export const clearAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  notifyAuthChanged();
};
