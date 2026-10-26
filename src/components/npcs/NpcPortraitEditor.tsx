'use client';

import { useEffect, useRef, useState } from 'react';
import { HudButton } from '../ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import { npcImageSrc } from '../../lib/media';
import {
  canEditNpcPortraits,
  patchNpcPortrait,
} from '../../lib/npcPortraitsApi';
import styles from '../../app/npcs/npcs.module.css';

type Props = {
  npcId: string;
  npcName: string;
  imageOverride?: string | null;
  portraitClassName?: string;
  large?: boolean;
  onPortraitUpdated?: (imageUrl: string) => void;
};

export const NpcPortraitEditor = ({
  npcId,
  npcName,
  imageOverride,
  portraitClassName,
  large,
  onPortraitUpdated,
}: Props) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [localImage, setLocalImage] = useState<string | null>(
    imageOverride ?? null,
  );

  useEffect(() => {
    setLocalImage(imageOverride ?? null);
  }, [imageOverride]);

  useEffect(() => {
    void canEditNpcPortraits().then(setCanEdit);
  }, []);

  const portrait = npcImageSrc({ id: npcId, image: localImage });

  const uploadPortrait = async (file: File) => {
    if (!file || !npcId) return;
    setUploading(true);
    setUploadErr('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const key = `npcs/${npcId}-${Date.now()}.${
        file.name.split('.').pop()?.toLowerCase() || 'jpg'
      }`;
      const up = await fetch(apiUrl('/api/media/upload'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          key,
          data: dataUrl,
          contentType: file.type || 'image/jpeg',
          credit: `npc:${npcId}`,
        }),
      });
      const upJson = await up.json().catch(() => ({}));
      if (!up.ok) {
        setUploadErr(upJson.message || 'Falha no upload.');
        return;
      }
      const imageRef =
        upJson.url || `/api/media/object?key=${encodeURIComponent(key)}`;
      const saved = await patchNpcPortrait(npcId, imageRef);
      if (!saved.ok) {
        setUploadErr(saved.message || 'Não foi possível salvar o retrato.');
        return;
      }
      setLocalImage(imageRef);
      onPortraitUpdated?.(imageRef);
    } catch {
      setUploadErr('Falha de rede ao enviar foto.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const frameClass = large ? styles.portraitLarge : styles.portrait;

  return (
    <div className={styles.portraitCol}>
      <div className={large ? undefined : styles.portraitFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait}
          alt={npcName}
          className={portraitClassName || frameClass}
          width={large ? 180 : 120}
          height={large ? 225 : 150}
          onError={(e) => {
            const el = e.currentTarget;
            if (el.dataset.fallback === '1') return;
            el.dataset.fallback = '1';
            el.src = `/images/npcs/${npcId}.svg`;
          }}
        />
      </div>
      {canEdit ? (
        <>
          <HudButton
            type="button"
            variant="ghost"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Enviando…' : 'Trocar foto do NPC'}
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
  );
};
