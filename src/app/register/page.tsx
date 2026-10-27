'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { AuthToast } from '../../components/auth/AuthToast';
import { PasswordField } from '../../components/auth/PasswordField';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl } from '../../lib/api';
import { sanitizeAuthNext } from '../../lib/authRoutes';
import {
  scorePassword,
  strengthLabelPt,
} from '../../lib/passwordStrength';
import ui from '../../components/auth/authUi.module.css';

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [toast, setToast] = useState('');
  const [toastOk, setToastOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => sanitizeAuthNext(searchParams.get('next')),
    [searchParams],
  );

  const strength = scorePassword(password);
  const strengthLabel = password ? strengthLabelPt(strength) : undefined;

  const validate = (): boolean => {
    let ok = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    if (!name.trim()) {
      setNameError('Informe seu nome ou handle.');
      ok = false;
    }
    if (!email.trim()) {
      setEmailError('Informe seu email.');
      ok = false;
    } else if (!emailOk(email)) {
      setEmailError('Email inválido.');
      ok = false;
    }
    if (!password || password.length < 6) {
      setPasswordError('Senha com pelo menos 6 caracteres.');
      ok = false;
    }
    if (password !== confirm) {
      setConfirmError('As senhas não coincidem.');
      ok = false;
    }
    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setToast('');
    setToastOk(false);
    if (!validate()) return;
    setBusy(true);
    try {
      const response = await fetch(apiUrl('/api/players'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      if (!response.ok) {
        setToast('Registro recusado. Tente outro email ou nome.');
        return;
      }
      setToastOk(true);
      setToast('Conta criada. Redirecionando para jack-in…');
      const loginNext = encodeURIComponent(nextPath);
      window.setTimeout(() => {
        window.location.assign(`/login?next=${loginNext}`);
      }, 900);
    } catch {
      setToast('Falha de rede. Tente de novo em instantes.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AuthToast
        message={toast}
        variant={toastOk ? 'ok' : 'error'}
        onDismiss={toastOk ? undefined : () => setToast('')}
      />
      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <div className={ui.field}>
          <label htmlFor="reg-name">Nome</label>
          <input
            id="reg-name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`${ui.input} ${nameError ? ui.inputInvalid : ''}`.trim()}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'reg-name-error' : undefined}
            disabled={busy}
            required
          />
          {nameError ? (
            <p id="reg-name-error" className={ui.fieldError} role="alert">
              {nameError}
            </p>
          ) : null}
        </div>
        <div className={ui.field}>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
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
            aria-describedby={emailError ? 'reg-email-error' : undefined}
            disabled={busy}
            required
          />
          {emailError ? (
            <p id="reg-email-error" className={ui.fieldError} role="alert">
              {emailError}
            </p>
          ) : null}
        </div>
        <PasswordField
          id="reg-password"
          label="Senha"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
          }}
          error={passwordError}
          strength={password ? strength : undefined}
          strengthLabel={strengthLabel}
          disabled={busy}
          required
        />
        <PasswordField
          id="reg-confirm"
          label="Confirmar senha"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) setConfirmError('');
          }}
          error={confirmError}
          disabled={busy}
          required
        />
        <div className={ui.actions}>
          <HudButton type="submit" disabled={busy}>
            {busy ? 'Gravando…' : 'Registrar na rede'}
          </HudButton>
        </div>
      </form>
    </>
  );
};

const RegisterPageContent = () => {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const loginHref = nextRaw
    ? `/login?next=${encodeURIComponent(nextRaw)}`
    : '/login';

  return (
    <AuthScreen
      title="Novo link"
      tagline="Crie seu player — depois faça jack-in e entre nas campanhas."
      footer={
        <>
          Já tem conta? <Link href={loginHref}>Fazer login</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthScreen>
  );
};

const RegisterPage = () => (
  <Suspense
    fallback={
      <AuthScreen
        title="Novo link"
        tagline="Crie seu player — depois faça jack-in e entre nas campanhas."
        footer={<>Carregando…</>}
      >
        <p className={ui.fieldHint}>Carregando…</p>
      </AuthScreen>
    }
  >
    <RegisterPageContent />
  </Suspense>
);

export default RegisterPage;
