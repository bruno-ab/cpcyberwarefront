export type NotifyPref = 'on' | 'off';

const KEY = 'nc_notify_pref';

export const readStoredNotifyPref = (): NotifyPref => {
  if (typeof window === 'undefined') return 'on';
  try {
    const raw = localStorage.getItem(KEY);
    return raw === 'off' ? 'off' : 'on';
  } catch {
    return 'on';
  }
};

export const writeStoredNotifyPref = (pref: NotifyPref): void => {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* ignore */
  }
};
