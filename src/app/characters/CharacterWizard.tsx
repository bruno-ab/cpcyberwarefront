'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BACKGROUNDS,
  CHARACTER_ROLES,
  ORIGINS,
} from '../../data/characterRoles';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './CharacterWizard.module.css';

type FormState = {
  name: string;
  role: string;
  age: string;
  city: string;
  origin: string;
  background: string;
  concept: string;
  filiation: string;
  notes: string;
};

const STEPS = [
  { id: 0, label: 'Identidade' },
  { id: 1, label: 'Origem' },
  { id: 2, label: 'Conceito' },
  { id: 3, label: 'Revisão' },
] as const;

const initial: FormState = {
  name: '',
  role: '',
  age: '',
  city: 'Night City',
  origin: '',
  background: '',
  concept: '',
  filiation: '',
  notes: '',
};

type Props = {
  onCreated?: () => void;
};

export const CharacterWizard = ({ onCreated }: Props) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = useMemo(() => {
    if (step === 0) return form.name.trim().length >= 2 && !!form.role;
    if (step === 1) return !!form.origin || !!form.background;
    return true;
  }, [step, form]);

  const submit = async () => {
    if (!form.name.trim() || !form.role) return;
    setBusy(true);
    setMsg('');
    setOk(false);
    try {
      const res = await fetch(apiUrl('/api/characters'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role,
          notes: form.notes,
          header: {
            age: form.age,
            city: form.city || 'Night City',
            origin: form.origin,
            background: form.background,
            concept: form.concept || form.role,
            filiation: form.filiation,
          },
        }),
      });
      if (!res.ok) {
        throw new Error('Jack recusado — tente de novo.');
      }
      const created = await res.json().catch(() => null);
      setOk(true);
      setMsg('Runner registrado na rede.');
      onCreated?.();
      const id = created?.id;
      if (id) {
        setTimeout(() => router.push(`/sheet?id=${id}`), 600);
      } else {
        setForm(initial);
        setStep(0);
      }
    } catch (e: any) {
      setMsg(e.message || 'Falha de link com a API.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.wrap} aria-label="Wizard de criação">
      <header className={styles.head}>
        <h2>Novo runner · Wizard</h2>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles.step}
              data-active={step === s.id}
              data-done={step > s.id}
              onClick={() => setStep(s.id)}
            >
              {s.id + 1}. {s.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.body}>
        {step === 0 && (
          <>
            <div className={styles.field}>
              <label htmlFor="cw-name">Nome de rua</label>
              <input
                id="cw-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="ex.: V, David, Lucy"
                maxLength={40}
              />
            </div>
            <div className={styles.field}>
              <label>Role</label>
              <div className={styles.roleGrid}>
                {CHARACTER_ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={styles.roleCard}
                    data-active={form.role === r.name}
                    onClick={() => set('role', r.name)}
                  >
                    <strong>{r.name}</strong>
                    <span>{r.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className={styles.row2}>
            <div className={styles.field}>
              <label htmlFor="cw-age">Idade</label>
              <input
                id="cw-age"
                value={form.age}
                onChange={(e) => set('age', e.target.value)}
                placeholder="ex.: 24"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cw-city">Cidade</label>
              <input
                id="cw-city"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cw-origin">Origem</label>
              <select
                id="cw-origin"
                value={form.origin}
                onChange={(e) => set('origin', e.target.value)}
              >
                <option value="">— escolher —</option>
                {ORIGINS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="cw-bg">Background</label>
              <select
                id="cw-bg"
                value={form.background}
                onChange={(e) => set('background', e.target.value)}
              >
                <option value="">— escolher —</option>
                {BACKGROUNDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className={styles.field}>
              <label htmlFor="cw-concept">Conceito</label>
              <input
                id="cw-concept"
                value={form.concept}
                onChange={(e) => set('concept', e.target.value)}
                placeholder="Uma frase: o que te move em Night City?"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cw-filiation">Facção / filiação</label>
              <input
                id="cw-filiation"
                value={form.filiation}
                onChange={(e) => set('filiation', e.target.value)}
                placeholder="ex.: Mox, Valentinos, Arasaka, Solo"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="cw-notes">Notas do Narrador</label>
              <textarea
                id="cw-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Ganchos, inimigos, debts…"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <dl className={styles.review}>
            <div>
              <strong>Nome</strong> {form.name || '—'}
            </div>
            <div>
              <strong>Role</strong> {form.role || '—'}
            </div>
            <div>
              <strong>Idade / cidade</strong> {form.age || '—'} ·{' '}
              {form.city || 'Night City'}
            </div>
            <div>
              <strong>Origem</strong> {form.origin || '—'}
            </div>
            <div>
              <strong>Background</strong> {form.background || '—'}
            </div>
            <div>
              <strong>Conceito</strong> {form.concept || form.role || '—'}
            </div>
            <div>
              <strong>Facção</strong> {form.filiation || '—'}
            </div>
            <div>
              <strong>Notas</strong> {form.notes || '—'}
            </div>
            <div>
              <strong>Pacote inicial</strong> 3 Edges · 500 eddies · vitalidade 7
            </div>
          </dl>
        )}

        {msg && (
          <p className={styles.msg} data-ok={ok}>
            {msg}
          </p>
        )}

        <div className={styles.nav}>
          <button
            type="button"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Voltar
          </button>
          {step < 3 ? (
            <button
              type="button"
              data-primary="true"
              disabled={!canNext || busy}
              onClick={() => setStep((s) => Math.min(3, s + 1))}
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              data-primary="true"
              disabled={busy || !form.name || !form.role}
              onClick={submit}
            >
              {busy ? 'Jackando…' : 'Criar personagem'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CharacterWizard;
