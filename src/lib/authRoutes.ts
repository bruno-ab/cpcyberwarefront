/** Routes reachable without `access_token` in localStorage */
export const AUTH_PUBLIC_PATHS = ['/login', '/register'] as const;

export type AuthPublicPath = (typeof AUTH_PUBLIC_PATHS)[number];

export const isAuthPublicPath = (pathname: string): boolean =>
  AUTH_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

/** Login URL that returns the user to an in-app path after jack-in. */
export const authLoginHref = (returnPath: string): string =>
  `/login?next=${encodeURIComponent(returnPath)}`;

export const authRegisterHref = (returnPath: string): string =>
  `/register?next=${encodeURIComponent(returnPath)}`;

/** Safe in-app redirect target after login (blocks open redirects). */
export const sanitizeAuthNext = (raw: string | null | undefined): string => {
  if (!raw || typeof raw !== 'string') return '/campaigns';
  const path = raw.split('?')[0] ?? '';
  if (!path.startsWith('/') || path.startsWith('//')) return '/campaigns';
  if (isAuthPublicPath(path)) return '/campaigns';
  return raw;
};
