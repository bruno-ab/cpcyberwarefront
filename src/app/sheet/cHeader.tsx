'use client';

import { useRef, useState } from 'react';
import styles from './cheader.module.css';
import { defaultHeader } from './defaultSheet';
import { characterImageSrc } from '../../lib/media';
import { apiUrl, authHeaders } from '../../lib/api';
import { HudButton } from '../../components/ui/HudButton';
import { IdCardBadge } from '../../components/characters/IdCardBadge';

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  age: 'Idade',
  city: 'Cidade',
  background: 'Background',
  concept: 'Conceito',
  filiation: 'Facção',
  origin: 'Origem',
  role: 'Role',
};

type Props = {
  characterData: {
    id?: string | number;
    name?: string;
    role?: string;
    image?: string | null;
    idCard?: string | null;
    sheet?: { header?: Record<string, string | number> };
  };
  onPortraitUpdated?: (imageUrl: string) => void;
};

const CHeader = ({ characterData, onPortraitUpdated }: Props) => {
  const header = {
    ...defaultHeader,
    ...(characterData?.sheet?.header || {}),
  };

  const fields = Object.entries(header).filter(([key]) => key !== 'name');
  const portrait = characterImageSrc(characterData);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const uploadPortrait = async (file: File) => {
    const id = characterData?.id;
    if (id == null || !file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const key = `characters/${String(id)}-${Date.now()}.${
        file.name.split('.').pop()?.toLowerCase() || 'jpg'
      }`;
      const up = await fetch(apiUrl('/api/media/upload'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          key,
          data: dataUrl,
          contentType: file.type || 'image/jpeg',
          credit: `character:${id}`,
        }),
      });
      const upJson = await up.json().catch(() => ({}));
      if (!up.ok) {
        setUploadErr(upJson.message || 'Falha no upload.');
        return;
      }
      const imageRef = upJson.url || `/api/media/object?key=${encodeURIComponent(key)}`;
      const patch = await fetch(apiUrl(`/api/characters/${id}/portrait`), {
        method: 'PATCH',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageRef }),
      });
      if (!patch.ok) {
        const body = await patch.json().catch(() => ({}));
        setUploadErr(body.message || 'Não foi possível salvar o retrato.');
        return;
      }
      onPortraitUpdated?.(imageRef);
    } catch {
      setUploadErr('Falha de rede ao enviar foto.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <header className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.portraitCol}>
          <div className={styles.portraitFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={characterData.name || 'Retrato'}
              className={styles.portrait}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.dataset.fallback === '1') return;
                el.dataset.fallback = '1';
                el.src = '/images/npcs/default.svg';
              }}
            />
          </div>
          {characterData.id != null ? (
            <>
              <HudButton
                type="button"
                variant="ghost"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? 'Enviando…' : 'Foto do runner'}
              </HudButton>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className={styles.hiddenFile}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadPortrait(f);
                }}
              />
              {uploadErr ? (
                <p className={styles.uploadErr} role="alert">
                  {uploadErr}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        <div className={styles.heroText}>
          <div className={styles.titleRow}>
            <h1 className={styles.name} data-text={characterData.name || '—'}>
              {characterData.name || '—'}
            </h1>
            {(characterData.role ||
              (header as Record<string, string | number>).role) && (
              <span className={styles.role}>
                {String(
                  characterData.role ||
                    (header as Record<string, string | number>).role,
                )}
              </span>
            )}
          </div>
          {characterData.idCard ? (
            <div className={styles.idCardRow}>
              <IdCardBadge code={characterData.idCard} />
            </div>
          ) : null}
          <dl className={styles.meta}>
            {fields.map(([key, value]) => (
              <div key={key} className={styles.metaItem}>
                <dt>{FIELD_LABELS[key] || key}</dt>
                <dd>{value === '' || value == null ? '—' : String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </header>
  );
};

export default CHeader;
