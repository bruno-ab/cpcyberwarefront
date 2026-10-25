'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { useTranslations } from '../../i18n/useTranslations';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import styles from './memorial.module.css';

type NotableRoll = {
  id: string;
  label?: string;
  pool: number;
  difficulty: number;
  dice: number[];
  successes: number;
  botch: boolean;
  highlight?: string;
  context?: string;
  at: string;
  source: 'auto' | 'manual';
};

type MemorialEntry = {
  id: number | string;
  campaignId: number;
  characterId: string;
  name: string;
  role: string;
  concept?: string;
  epitaph: string;
  deathAt: string;
  sessionLabel?: string;
  notableRolls: NotableRoll[];
  cause?: string;
};

type RosterRow = { id: string; name: string; role?: string };

const formatDate = (iso: string, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const MemorialPage = () => {
  const { t, locale } = useTranslations('memorial');
  const { campaignId } = useCampaign();
  const [entries, setEntries] = useState<MemorialEntry[]>([]);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editEpitaph, setEditEpitaph] = useState('');
  const [registerCharId, setRegisterCharId] = useState('');
  const [registerEpitaph, setRegisterEpitaph] = useState('');
  const [registerSession, setRegisterSession] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [mem, ros] = await Promise.all([
        fetch(apiUrl(`/api/campaigns/${campaignId}/memorial`), {
          headers: authHeaders(),
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch(apiUrl(`/api/campaigns/${campaignId}/roster`), {
          headers: authHeaders(),
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ]);
      setEntries(Array.isArray(mem) ? mem : []);
      setRoster(Array.isArray(ros) ? ros : []);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const highlightLabel = (h?: string) => {
    if (h === 'botch') return t('highlight.botch');
    if (h === 'critical') return t('highlight.critical');
    if (h === 'legendary') return t('highlight.legendary');
    if (h === 'pool') return t('highlight.pool');
    return t('highlight.roll');
  };

  const startEdit = (entry: MemorialEntry) => {
    setEditId(String(entry.id));
    setEditEpitaph(entry.epitaph);
  };

  const saveEdit = async () => {
    if (!editId) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(
        apiUrl(`/api/campaigns/${campaignId}/memorial/${editId}`),
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ epitaph: editEpitaph.trim() }),
        },
      );
      if (!res.ok) throw new Error('save-failed');
      setEditId(null);
      setMsg(t('saved'));
      await reload();
    } catch {
      setMsg(t('error'));
    } finally {
      setBusy(false);
    }
  };

  const registerDeath = async (e: FormEvent) => {
    e.preventDefault();
    if (!registerCharId) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/memorial`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          characterId: registerCharId,
          epitaph: registerEpitaph.trim() || undefined,
          sessionLabel: registerSession.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('register-failed');
      setRegisterEpitaph('');
      setRegisterSession('');
      setMsg(t('registered'));
      await reload();
    } catch {
      setMsg(t('error'));
    } finally {
      setBusy(false);
    }
  };

  const onMemorialIds = new Set(entries.map((e) => String(e.characterId)));
  const registerOptions = roster.filter((r) => !onMemorialIds.has(String(r.id)));

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </header>

        <HudPanel title={t('gmPanelTitle')}>
          <form className={styles.gmPanel} onSubmit={registerDeath}>
            <label>
              <span className={styles.meta}>{t('pickCharacter')}</span>
              <select
                value={registerCharId}
                onChange={(ev) => setRegisterCharId(ev.target.value)}
              >
                <option value="">{t('selectPlaceholder')}</option>
                {registerOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.role ? ` · ${r.role}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={styles.meta}>{t('sessionLabel')}</span>
              <input
                value={registerSession}
                onChange={(ev) => setRegisterSession(ev.target.value)}
                placeholder={t('sessionPlaceholder')}
              />
            </label>
            <label>
              <span className={styles.meta}>{t('epitaphLabel')}</span>
              <textarea
                value={registerEpitaph}
                onChange={(ev) => setRegisterEpitaph(ev.target.value)}
                placeholder={t('epitaphPlaceholder')}
              />
            </label>
            <div className={styles.actions}>
              <HudButton type="submit" disabled={busy || !registerCharId}>
                {t('register')}
              </HudButton>
              {msg ? <span className={styles.msg}>{msg}</span> : null}
            </div>
          </form>
        </HudPanel>

        {loading ? (
          <p className={styles.empty}>{t('loading')}</p>
        ) : entries.length === 0 ? (
          <HudPanel title={t('emptyTitle')}>
            <p className={styles.empty}>{t('empty')}</p>
          </HudPanel>
        ) : (
          <div className={styles.grid}>
            {entries.map((entry) => (
              <article key={entry.id} className={styles.plaque}>
                <div className={styles.head}>
                  <h2 className={styles.name}>{entry.name}</h2>
                  <p className={styles.meta}>
                    {entry.role}
                    {entry.concept ? ` · ${entry.concept}` : ''}
                  </p>
                </div>
                <p className={styles.meta}>
                  {t('fallen')}{' '}
                  {formatDate(entry.deathAt, locale)}
                  {entry.sessionLabel ? ` · ${entry.sessionLabel}` : ''}
                  {entry.cause ? ` · ${entry.cause}` : ''}
                </p>
                {editId === String(entry.id) ? (
                  <div className={styles.editBlock}>
                    <textarea
                      value={editEpitaph}
                      onChange={(ev) => setEditEpitaph(ev.target.value)}
                      aria-label={t('epitaphLabel')}
                    />
                    <div className={styles.actions}>
                      <HudButton
                        type="button"
                        disabled={busy}
                        onClick={() => saveEdit()}
                      >
                        {t('saveEpitaph')}
                      </HudButton>
                      <HudButton
                        type="button"
                        disabled={busy}
                        onClick={() => setEditId(null)}
                      >
                        {t('cancel')}
                      </HudButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <blockquote className={styles.epitaph}>
                      {entry.epitaph}
                    </blockquote>
                    <HudButton type="button" onClick={() => startEdit(entry)}>
                      {t('editEpitaph')}
                    </HudButton>
                  </>
                )}
                {entry.notableRolls?.length ? (
                  <>
                    <h3 className={styles.rollsTitle}>{t('notableRolls')}</h3>
                    <ul className={styles.rolls}>
                      {entry.notableRolls.map((roll) => (
                        <li
                          key={roll.id}
                          className={styles.roll}
                          data-highlight={roll.highlight || (roll.botch ? 'botch' : undefined)}
                        >
                          <span className={styles.badge}>
                            {highlightLabel(roll.highlight)}
                          </span>
                          <div className={styles.rollBody}>
                            {roll.label ? (
                              <>
                                <strong>{roll.label}</strong>
                                {' · '}
                              </>
                            ) : null}
                            [{roll.dice.join(', ')}] →{' '}
                            <strong>{roll.successes}</strong> {t('successes')}
                            {roll.botch ? ` · ${t('botch')}` : ''}
                            <br />
                            {t('pool')} {roll.pool} · diff {roll.difficulty} ·{' '}
                            {formatDate(roll.at, locale)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className={styles.empty}>{t('noRolls')}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
};

export default MemorialPage;
