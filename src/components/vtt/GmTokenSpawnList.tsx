'use client';

import { useTranslations } from '../../i18n/useTranslations';
import { characterImageSrc, npcImageSrc } from '../../lib/media';
import type { CampaignNpc } from '../../lib/campaignsApi';
import styles from './gmTokenSpawnList.module.css';

export const VTT_SPAWN_DRAG_MIME = 'application/x-cp-vtt-spawn';

export type SpawnDragPayload =
  | { kind: 'character'; id: string }
  | { kind: 'npc'; id: string };

export type GmRosterEntry = {
  id: string;
  name: string;
  role?: string;
  playerId?: number;
  image?: string | null;
  vitality?: number;
  vitalityMax?: number;
};

type GmTokenSpawnListProps = {
  roster: GmRosterEntry[];
  npcs: CampaignNpc[];
  onTableCharacterIds: Set<number>;
  placement: SpawnDragPayload | null;
  onSelectPlacement: (payload: SpawnDragPayload | null) => void;
};

export const parseSpawnDragPayload = (
  data: string | undefined,
): SpawnDragPayload | null => {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as SpawnDragPayload;
    if (parsed?.kind === 'character' && parsed.id) return parsed;
    if (parsed?.kind === 'npc' && parsed.id) return parsed;
  } catch {
    /* ignore */
  }
  return null;
};

export const GmTokenSpawnList = ({
  roster,
  npcs,
  onTableCharacterIds,
  placement,
  onSelectPlacement,
}: GmTokenSpawnListProps) => {
  const { t } = useTranslations('vtt.gmSpawn');

  const startDrag = (payload: SpawnDragPayload, e: React.DragEvent) => {
    e.dataTransfer.setData(VTT_SPAWN_DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    onSelectPlacement(null);
  };

  const togglePlacement = (payload: SpawnDragPayload) => {
    const same =
      placement?.kind === payload.kind && placement?.id === payload.id;
    onSelectPlacement(same ? null : payload);
  };

  const isPlacing = (payload: SpawnDragPayload) =>
    placement?.kind === payload.kind && placement?.id === payload.id;

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>{t('dragHint')}</p>

      <section className={styles.section} aria-label={t('charactersHeading')}>
        <h4 className={styles.heading}>{t('charactersHeading')}</h4>
        {roster.length === 0 ? (
          <p className={styles.empty}>{t('emptyCharacters')}</p>
        ) : (
          <ul className={styles.list}>
            {roster.map((c) => {
              const onTable = onTableCharacterIds.has(Number(c.id));
              const payload: SpawnDragPayload = {
                kind: 'character',
                id: c.id,
              };
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={styles.row}
                    data-on-table={onTable ? '1' : '0'}
                    data-placing={isPlacing(payload) ? '1' : '0'}
                    draggable={!onTable}
                    disabled={onTable}
                    title={
                      onTable
                        ? t('alreadyOnTable')
                        : t('dragOrClick')
                    }
                    onDragStart={(e) => startDrag(payload, e)}
                    onClick={() => {
                      if (onTable) return;
                      togglePlacement(payload);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={characterImageSrc(c)}
                      alt=""
                      className={styles.portrait}
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.src = '/images/npcs/default.svg';
                      }}
                    />
                    <span className={styles.meta}>
                      <span className={styles.name}>{c.name}</span>
                      {c.role ? (
                        <span className={styles.sub}>{c.role}</span>
                      ) : null}
                      {onTable ? (
                        <span className={styles.badge}>{t('onTable')}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-label={t('npcsHeading')}>
        <h4 className={styles.heading}>{t('npcsHeading')}</h4>
        {npcs.length === 0 ? (
          <p className={styles.empty}>{t('emptyNpcs')}</p>
        ) : (
          <ul className={styles.list}>
            {npcs.map((npc) => {
              const payload: SpawnDragPayload = { kind: 'npc', id: npc.id };
              return (
                <li key={npc.id}>
                  <button
                    type="button"
                    className={styles.row}
                    data-placing={isPlacing(payload) ? '1' : '0'}
                    draggable
                    title={t('dragOrClick')}
                    onDragStart={(e) => startDrag(payload, e)}
                    onClick={() => togglePlacement(payload)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={npcImageSrc(npc)}
                      alt=""
                      className={styles.portrait}
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.src = `/images/npcs/${npc.id}.svg`;
                      }}
                    />
                    <span className={styles.meta}>
                      <span className={styles.name}>{npc.name}</span>
                      <span className={styles.sub}>
                        {[npc.role, npc.affiliation].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
