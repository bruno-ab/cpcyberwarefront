'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getAccessToken } from '../../lib/authSession';
import { isAuthPublicPath } from '../../lib/authRoutes';
import styles from './AuthGate.module.css';

type GatePhase = 'checking' | 'allowed' | 'redirecting';

const AuthGateLoading = () => (
  <div className={styles.shell} role="status" aria-live="polite" aria-busy="true">
    <div className={styles.panel}>
      <span className={styles.mark}>NC · UPLINK</span>
      <div className={styles.bar} aria-hidden>
        <div className={styles.barInner} />
      </div>
      <p className={styles.hint}>Verificando credencial…</p>
    </div>
  </div>
);

const initialPhase = (pathname: string): GatePhase => {
  if (typeof window === 'undefined') return 'checking';
  if (isAuthPublicPath(pathname)) return 'allowed';
  if (getAccessToken()) return 'allowed';
  return 'checking';
};

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname() || '/';
  const [phase, setPhase] = useState<GatePhase>(() => initialPhase(pathname));

  useEffect(() => {
    const publicRoute = isAuthPublicPath(pathname);
    const token = getAccessToken();

    if (publicRoute || token) {
      setPhase('allowed');
      return;
    }

    setPhase('redirecting');
    const search = window.location.search;
    const returnPath = `${pathname}${search}`;
    const next = encodeURIComponent(returnPath);
    window.location.replace(`/login?next=${next}`);
  }, [pathname]);

  if (phase === 'checking' || phase === 'redirecting') {
    return <AuthGateLoading />;
  }

  return <>{children}</>;
};

export default AuthGate;
