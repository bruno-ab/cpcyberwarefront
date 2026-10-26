import { apiUrl, authHeaders } from './api';

export type AccountProfile = {
  id: number;
  email: string;
  name: string;
};

export const fetchAccountMe = async (): Promise<AccountProfile | null> => {
  const res = await fetch(apiUrl('/api/auth/me'), {
    headers: authHeaders(),
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('me_failed');
  return res.json();
};

export const changeAccountPassword = async (body: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok?: boolean; error?: string }> => {
  const res = await fetch(apiUrl('/api/auth/change-password'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  const msg =
    typeof data?.message === 'string'
      ? data.message
      : Array.isArray(data?.message)
        ? data.message.join(', ')
        : 'change_password_failed';
  return { error: msg };
};

export const deleteAccount = async (password: string): Promise<{
  ok?: boolean;
  error?: string;
}> => {
  const res = await fetch(apiUrl('/api/auth/account'), {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  const msg =
    typeof data?.message === 'string'
      ? data.message
      : Array.isArray(data?.message)
        ? data.message.join(', ')
        : 'delete_failed';
  return { error: msg };
};
