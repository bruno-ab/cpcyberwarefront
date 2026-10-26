'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { HudPanel } from '../../components/ui/HudPanel';
import { ShardConsole } from '../../components/secrets/ShardConsole';
import { useTranslations } from '../../i18n/useTranslations';
import { useMotion } from '../../motion/useMotion';
import { useSound } from '../../lib/sound/useSound';
import {
  readStoredNotifyPref,
  writeStoredNotifyPref,
  type NotifyPref,
} from '../../lib/accountNotifyPrefs';
import {
  changeAccountPassword,
  deleteAccount,
  fetchAccountMe,
  type AccountProfile,
} from '../../lib/accountApi';
import { authLoginHref, authRegisterHref } from '../../lib/authRoutes';
import { clearAccessToken, getAccessToken } from '../../lib/authSession';
import styles from './account.module.css';
import authStyles from '../login/auth.module.css';

const AccountPage = () => {
  const router = useRouter();
  const { t, locale, changeLocale } = useTranslations('account');
  const { t: tc } = useTranslations('common');
  const { animationsOn, toggleMotion, mounted: motionMounted } = useMotion();
  const { soundOn, toggleSound, mounted: soundMounted } = useSound();

  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [notifyPref, setNotifyPref] = useState<NotifyPref>('on');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = getAccessToken();
    setHasToken(!!token);
    if (!token) {
      setProfile(null);
      return;
    }
    setProfileError('');
    try {
      const me = await fetchAccountMe();
      if (!me) {
        clearAccessToken();
        setHasToken(false);
        setProfile(null);
        return;
      }
      setProfile(me);
    } catch {
      setProfileError(t('profileLoadError'));
    }
  }, [t]);

  useEffect(() => {
    setMounted(true);
    setNotifyPref(readStoredNotifyPref());
    void loadProfile();
  }, [loadProfile]);

  const logout = () => {
    clearAccessToken();
    setHasToken(false);
    setProfile(null);
    router.push('/login');
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordOk(false);
    if (newPassword.length < 8) {
      setPasswordMsg(t('passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg(t('passwordMismatch'));
      return;
    }
    setPasswordBusy(true);
    try {
      const result = await changeAccountPassword({
        currentPassword,
        newPassword,
      });
      if (result.ok) {
        setPasswordOk(true);
        setPasswordMsg(t('passwordChanged'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg(result.error || t('passwordChangeFailed'));
      }
    } catch {
      setPasswordMsg(t('passwordChangeFailed'));
    } finally {
      setPasswordBusy(false);
    }
  };

  const onToggleNotify = () => {
    const next: NotifyPref = notifyPref === 'on' ? 'off' : 'on';
    setNotifyPref(next);
    writeStoredNotifyPref(next);
  };

  const deletePhrase = profile?.email || 'DELETAR';
  const deleteConfirmed =
    deleteConfirm.trim().toLowerCase() === deletePhrase.toLowerCase() ||
    deleteConfirm.trim().toUpperCase() === 'DELETAR';

  const onDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteMsg('');
    if (!deleteConfirmed) {
      setDeleteMsg(`${t('deleteConfirmHint')} (${deletePhrase})`);
      return;
    }
    setDeleteBusy(true);
    try {
      const result = await deleteAccount(deletePassword);
      if (result.ok) {
        clearAccessToken();
        router.push('/login');
        return;
      }
      setDeleteMsg(result.error || t('deleteFailed'));
    } catch {
      setDeleteMsg(t('deleteFailed'));
    } finally {
      setDeleteBusy(false);
    }
  };

  if (!mounted) {
    return (
      <PageFrame>
        <p className={styles.status}>{tc('loading')}</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>{t('title')}</h1>
            <p>{t('sub')}</p>
          </div>
        </header>

        {!hasToken ? (
          <HudPanel title={t('sessionTitle')}>
            <p className={styles.meta}>
              {t('statusLabel')}{' '}
              <strong data-ok={false}>{t('statusOffline')}</strong>
            </p>
            <div className={styles.actions}>
              <Link href={authLoginHref('/account')}>
                <HudButton>{t('jackIn')}</HudButton>
              </Link>
              <Link href={authRegisterHref('/account')}>
                <HudButton variant="ghost">{t('register')}</HudButton>
              </Link>
            </div>
          </HudPanel>
        ) : (
          <>
            <HudPanel title={t('profileTitle')}>
              {profileError ? (
                <p className={styles.error}>{profileError}</p>
              ) : profile ? (
                <dl className={styles.profileGrid}>
                  <div>
                    <dt>{t('emailLabel')}</dt>
                    <dd>{profile.email}</dd>
                  </div>
                  {profile.name ? (
                    <div>
                      <dt>{t('nameLabel')}</dt>
                      <dd>{profile.name}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>{t('idLabel')}</dt>
                    <dd>#{profile.id}</dd>
                  </div>
                </dl>
              ) : (
                <p className={styles.status}>{tc('loading')}</p>
              )}
              <div className={styles.actions}>
                <Link href="/characters">
                  <HudButton>{t('characters')}</HudButton>
                </Link>
                <HudButton variant="ghost" type="button" onClick={logout}>
                  {t('logout')}
                </HudButton>
              </div>
            </HudPanel>

            <HudPanel title={t('passwordTitle')}>
              <form
                className={`${authStyles.form} ${styles.sectionForm}`}
                onSubmit={onChangePassword}
              >
                <div className={authStyles.field}>
                  <label htmlFor="current-password">{t('currentPassword')}</label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={authStyles.field}>
                  <label htmlFor="new-password">{t('newPassword')}</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className={authStyles.field}>
                  <label htmlFor="confirm-password">{t('confirmPassword')}</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                {passwordMsg ? (
                  <p
                    className={authStyles.msg}
                    data-ok={passwordOk}
                    role="alert"
                    aria-live="polite"
                  >
                    {passwordMsg}
                  </p>
                ) : null}
                <div className={styles.actions}>
                  <HudButton type="submit" disabled={passwordBusy}>
                    {passwordBusy ? t('saving') : t('changePassword')}
                  </HudButton>
                </div>
              </form>
            </HudPanel>

            <HudPanel title={t('optionsTitle')}>
              <p className={styles.optionsHint}>{t('optionsSub')}</p>
              <ul className={styles.optionList}>
                {motionMounted ? (
                  <li>
                    <span>{t('optionMotion')}</span>
                    <HudButton
                      type="button"
                      variant="ghost"
                      onClick={toggleMotion}
                    >
                      {animationsOn ? tc('motion.on') : tc('motion.off')}
                    </HudButton>
                  </li>
                ) : null}
                {soundMounted ? (
                  <li>
                    <span>{t('optionSound')}</span>
                    <HudButton type="button" variant="ghost" onClick={toggleSound}>
                      {soundOn ? tc('sound.on') : tc('sound.off')}
                    </HudButton>
                  </li>
                ) : null}
                <li>
                  <span>{t('optionLanguage')}</span>
                  <div className={styles.localeRow}>
                    <HudButton
                      type="button"
                      variant={locale === 'pt-BR' ? 'primary' : 'ghost'}
                      onClick={() => changeLocale('pt-BR')}
                    >
                      PT
                    </HudButton>
                    <HudButton
                      type="button"
                      variant={locale === 'en' ? 'primary' : 'ghost'}
                      onClick={() => changeLocale('en')}
                    >
                      EN
                    </HudButton>
                  </div>
                </li>
                <li>
                  <span>{t('optionNotify')}</span>
                  <HudButton type="button" variant="ghost" onClick={onToggleNotify}>
                    {notifyPref === 'on' ? t('notifyOn') : t('notifyOff')}
                  </HudButton>
                  <small className={styles.stubNote}>{t('notifyStub')}</small>
                </li>
              </ul>
            </HudPanel>

            <HudPanel title={t('deleteTitle')} data-danger>
              <p className={styles.dangerText}>{t('deleteWarning')}</p>
              {!deleteOpen ? (
                <HudButton
                  type="button"
                  variant="ghost"
                  onClick={() => setDeleteOpen(true)}
                >
                  {t('deleteOpen')}
                </HudButton>
              ) : (
                <form
                  className={`${authStyles.form} ${styles.sectionForm}`}
                  onSubmit={onDeleteAccount}
                >
                  <div className={authStyles.field}>
                    <label htmlFor="delete-confirm">{t('deleteConfirmLabel')}</label>
                    <input
                      id="delete-confirm"
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={deletePhrase}
                      autoComplete="off"
                    />
                  </div>
                  <div className={authStyles.field}>
                    <label htmlFor="delete-password">{t('deletePassword')}</label>
                    <input
                      id="delete-password"
                      type="password"
                      autoComplete="current-password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                  </div>
                  {deleteMsg ? (
                    <p className={authStyles.msg} data-ok={false}>
                      {deleteMsg}
                    </p>
                  ) : null}
                  <div className={styles.actions}>
                    <HudButton type="submit" disabled={deleteBusy || !deleteConfirmed}>
                      {deleteBusy ? t('deleting') : t('deleteSubmit')}
                    </HudButton>
                    <HudButton
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setDeleteOpen(false);
                        setDeleteConfirm('');
                        setDeletePassword('');
                        setDeleteMsg('');
                      }}
                    >
                      {t('deleteCancel')}
                    </HudButton>
                  </div>
                </form>
              )}
            </HudPanel>
          </>
        )}

        <ShardConsole />
      </div>
    </PageFrame>
  );
};

export default AccountPage;
