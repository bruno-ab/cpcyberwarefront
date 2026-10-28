'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import {
  countN54Unread,
  markN54FeedSeen,
} from '../../lib/n54PhoneSeen';
import styles from './sheetPhone.module.css';

type Contact = { id: string; name: string; role?: string };
type Thread = {
  contact: Contact;
  lastMessage: { body: string; at: string; fromCharacterId: string } | null;
  unread: number;
};
type Message = {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  body: string;
  at: string;
  read: boolean;
};

type NewsItem = {
  id: number | string;
  headline: string;
  body: string;
  district?: string;
  source: string;
  severity: string;
  at: string;
};

type PhoneView = 'threads' | 'chat' | 'add' | 'n54';

type Props = {
  characterId: string;
  characterName: string;
};

export const SheetPhone = ({ characterId, characterName }: Props) => {
  const { campaignId } = useCampaign();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PhoneView>('threads');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [peer, setPeer] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directory, setDirectory] = useState<Contact[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [n54Feed, setN54Feed] = useState<NewsItem[]>([]);
  const [n54Unread, setN54Unread] = useState(0);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/phone/threads`),
        { headers: authHeaders() },
      );
      if (!res.ok) return;
      const data = (await res.json()) as Thread[];
      setThreads(data);
      setUnreadTotal(data.reduce((n, t) => n + (t.unread || 0), 0));
    } catch {
      /* ignore */
    }
  }, [characterId]);

  const loadN54 = useCallback(async () => {
    if (!campaignId) return;
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/news`), {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as NewsItem[];
      const feed = Array.isArray(data) ? data : [];
      setN54Feed(feed);
      setN54Unread(countN54Unread(characterId, feed));
    } catch {
      /* ignore */
    }
  }, [campaignId, characterId]);

  const openN54 = () => {
    setView('n54');
    markN54FeedSeen(characterId, n54Feed);
    setN54Unread(0);
  };

  const openChat = async (contact: Contact) => {
    setPeer(contact);
    setView('chat');
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/phone/messages/${contact.id}`),
        { headers: authHeaders() },
      );
      if (res.ok) setMessages(await res.json());
      loadThreads();
    } catch {
      setMessages([]);
    }
  };

  const loadDirectory = async () => {
    setView('add');
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/phone/directory`),
        { headers: authHeaders() },
      );
      if (res.ok) setDirectory(await res.json());
    } catch {
      setDirectory([]);
    }
  };

  const addContact = async (id: string) => {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/characters/${characterId}/phone/contacts`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ characterId: id }),
      });
      await loadThreads();
      setView('threads');
    } finally {
      setBusy(false);
    }
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!peer || !draft.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/characters/${characterId}/phone/messages`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ to: peer.id, body: draft }),
        },
      );
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setDraft('');
        loadThreads();
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadThreads();
    loadN54();
    const t = window.setInterval(() => {
      loadThreads();
      loadN54();
    }, 12000);
    return () => window.clearInterval(t);
  }, [loadThreads, loadN54]);

  const badgeTotal = unreadTotal + n54Unread;

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir telefone"
      >
        ☎
        {badgeTotal > 0 && (
          <span className={styles.fabBadge}>{badgeTotal}</span>
        )}
      </button>

      {open && (
        <div className={styles.phone} role="dialog" aria-label="Agent">
          <div className={styles.notch} />
          <header className={styles.top}>
            <div>
              <strong>Agent</strong>
              <span>{characterName}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
              ×
            </button>
          </header>

          <nav className={styles.nav}>
            <button
              type="button"
              data-active={view === 'threads' || view === 'chat'}
              onClick={() => {
                setView('threads');
                setPeer(null);
              }}
            >
              SMS
            </button>
            <button
              type="button"
              data-active={view === 'n54'}
              onClick={openN54}
            >
              N54{n54Unread > 0 ? ` (${n54Unread})` : ''}
            </button>
            <button type="button" data-active={view === 'add'} onClick={loadDirectory}>
              Contatos+
            </button>
          </nav>

          <div className={styles.body}>
            {view === 'threads' && (
              <>
                {threads.length === 0 && (
                  <p className={styles.empty}>
                    Sem threads. Adicione contatos pra jackar SMS.
                  </p>
                )}
                {threads.map((t) => (
                  <button
                    key={t.contact.id}
                    type="button"
                    className={styles.thread}
                    onClick={() => openChat(t.contact)}
                  >
                    <strong>{t.contact.name}</strong>
                    <span>{t.contact.role}</span>
                    <p>{t.lastMessage?.body || '— sem mensagens —'}</p>
                    {t.unread > 0 && (
                      <em className={styles.unread}>{t.unread}</em>
                    )}
                  </button>
                ))}
              </>
            )}

            {view === 'n54' && (
              <>
                <p className={styles.empty}>
                  Wire N54 · campanha #{campaignId}
                </p>
                {n54Feed.length === 0 && (
                  <p className={styles.empty}>Sem manchetes no feed ainda.</p>
                )}
                {n54Feed.map((item) => (
                  <article key={String(item.id)} className={styles.n54Item}>
                    <div className={styles.n54Meta}>
                      <span>{item.source || 'N54'}</span>
                      {item.district ? <span>{item.district}</span> : null}
                      <span>
                        {new Date(item.at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <strong>{item.headline}</strong>
                    <p>{item.body}</p>
                  </article>
                ))}
              </>
            )}

            {view === 'chat' && peer && (
              <>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => setView('threads')}
                >
                  ← {peer.name}
                </button>
                <div className={styles.chat}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={styles.bubble}
                      data-mine={String(m.fromCharacterId) === String(characterId)}
                    >
                      <p>{m.body}</p>
                      <small>
                        {new Date(m.at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                  ))}
                </div>
                <form className={styles.compose} onSubmit={send}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Digite uma mensagem…"
                    maxLength={1000}
                    disabled={busy}
                  />
                  <button type="submit" disabled={busy || !draft.trim()}>
                    →
                  </button>
                </form>
              </>
            )}

            {view === 'add' && (
              <>
                <p className={styles.empty}>Runners na rede (fora dos contatos)</p>
                {directory.length === 0 && (
                  <p className={styles.empty}>Ninguém disponível.</p>
                )}
                {directory.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.thread}
                    disabled={busy}
                    onClick={() => addContact(c.id)}
                  >
                    <strong>{c.name}</strong>
                    <span>{c.role}</span>
                    <p>Adicionar aos contatos</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SheetPhone;
