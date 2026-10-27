'use client';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { AuthToast } from '../../components/auth/AuthToast';
import { PasswordField } from '../../components/auth/PasswordField';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl } from '../../lib/api';
import { setAccessToken } from '../../lib/authSession';
import { sanitizeAuthNext } from '../../lib/authRoutes';
import ui from '../../components/auth/authUi.module.css';

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const LoginPageContent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => sanitizeAuthNext(searchParams.get('next')),
    [searchParams],
  );
  const nextRaw = searchParams.get('next');
  const registerHref = nextRaw
    ? `/register?next=${encodeURIComponent(nextRaw)}`
    : '/register';
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    let ok = true;
    setEmailError('');
    setPasswordError('');
    if (!email.trim()) {
      setEmailError('Informe seu email.');
      ok = false;
    } else if (!emailOk(email)) {
      setEmailError('Email inválido.');
      ok = false;
    }
    if (!password) {
      setPasswordError('Informe sua senha.');
      ok = false;
    }
    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setToast('');
    if (!validate()) return;
    setBusy(true);
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.ok) {
        setToast('Acesso negado. Confira email e senha.');
        return;
      }
      const data = await response.json();
      setAccessToken(data.access_token);
      window.location.assign(nextPath);
    } catch {
      setToast('Falha de rede. Tente de novo em instantes.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="Jack in"
      tagline="Sua mesa Night City — campanhas, fichas e VTT em um uplink."
      footer={
        <>
          Sem conta?{' '}
          <Link href={registerHref}>Criar conta na rede</Link>
        </>
      }
    >
      <AuthToast message={toast} onDismiss={() => setToast('')} />
      {nextPath !== '/campaigns' ? (
        <p className={ui.fieldHint} role="status">
          Destino após login:{' '}
          <strong className={ui.nextPath}>{nextPath}</strong>
        </p>
      ) : null}
      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <div className={ui.field}>
          <label htmlFor="login-email">Email</label>
          <input
            ref={emailRef}
            id="login-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={() => {
              if (email && !emailOk(email)) setEmailError('Email inválido.');
            }}
            className={`${ui.input} ${emailError ? ui.inputInvalid : ''}`.trim()}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'login-email-error' : undefined}
            disabled={busy}
            required
          />
          {emailError ? (
            <p id="login-email-error" className={ui.fieldError} role="alert">
              {emailError}
            </p>
          ) : null}
        </div>
        <PasswordField
          id="login-password"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
          }}
          error={passwordError}
          disabled={busy}
          required
        />
        <div className={ui.actions}>
          <HudButton type="submit" disabled={busy}>
            {busy ? 'Conectando…' : 'Entrar na rede'}
          </HudButton>
        </div>
      </form>
    </AuthScreen>
  );
};

const LoginPage = () => (
  <Suspense
    fallback={
      <AuthScreen
        title="Jack in"
        tagline="Sua mesa Night City — campanhas, fichas e VTT em um uplink."
        footer={<>Carregando…</>}
      >
        <p className={ui.fieldHint}>Carregando…</p>
      </AuthScreen>
    }
  >
    <LoginPageContent />
  </Suspense>
);

export default LoginPage;
