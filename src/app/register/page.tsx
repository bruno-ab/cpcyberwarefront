'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl } from '../../lib/api';
import styles from '../login/auth.module.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
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
      const response = await fetch(apiUrl('/api/players'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (!response.ok) {
        setMessage('Registro recusado. Tente outro email.');
        return;
      }
      setOk(true);
      setMessage('Conta criada. Vá para o jack-in.');
      setTimeout(() => router.push('/login'), 700);
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
          <h1 className={styles.brand}>Novo link</h1>
          <p className={styles.sub}>Registrar player · Night City</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone (opcional)</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
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
                {busy ? 'Gravando…' : 'Registrar'}
              </HudButton>
            </div>
          </form>
          <p className={styles.foot}>
            Já tem link? <Link href="/login">Fazer login</Link>
          </p>
        </section>
      </div>
    </PageFrame>
  );
};

export default RegisterPage;
