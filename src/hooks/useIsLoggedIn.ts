'use client';

import { useEffect, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  getAccessToken,
} from '../lib/authSession';

export const useIsLoggedIn = (): boolean => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(!!getAccessToken());
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return loggedIn;
};
