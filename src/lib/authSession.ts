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
