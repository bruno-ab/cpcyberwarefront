'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl } from '../../lib/api';
import styles from './auth.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setOk(false);
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setMessage('Acesso negado. Confira as credenciais.');
        return;
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      setOk(true);
      setMessage('Link estabelecido.');
      router.push('/characters');
    } catch {
      setMessage('Falha de rede. Damn Arasaka.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <section className={styles.panel}>
          <h1 className={styles.brand}>Jack in</h1>
          <p className={styles.sub}>Night City uplink · autenticação</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className={styles.msg} data-ok={ok}>
                {message}
              </p>
            )}
            <div className={styles.actions}>
              <HudButton type="submit" disabled={busy}>
                {busy ? 'Conectando…' : 'Entrar'}
              </HudButton>
            </div>
          </form>
          <p className={styles.foot}>
            Sem conta? <Link href="/register">Registrar na rede</Link>
          </p>
        </section>
      </div>
    </PageFrame>
  );
};

export default LoginPage;
