'use client';

import { useState } from 'react';
import { HudButton } from '../ui/HudButton';
import styles from './sceneBar.module.css';

export type VttSceneSummary = {
  id: string;
  name: string;
  description?: string;
  sessionId: string;
  active: boolean;
  backgroundUrl?: string | null;
  tokenCount?: number;
  mapName?: string;
};

type SceneBarProps = {
  scenes: VttSceneSummary[];
  activeSceneId: string | null;
  currentSceneId: string | null;
  isGm: boolean;
  busy?: boolean;
  onSelect: (sceneId: string) => void;
  onCreate: (name: string, copyFrom?: boolean) => void;
  onRename: (sceneId: string, name: string) => void;
  onActivate: (sceneId: string) => void;
  onDelete: (sceneId: string) => void;
};

export const SceneBar = ({
  scenes,
  activeSceneId,
  currentSceneId,
  isGm,
  busy,
  onSelect,
  onCreate,
  onRename,
  onActivate,
  onDelete,
}: SceneBarProps) => {
  const [draftName, setDraftName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.label}>Cenas</span>
        {isGm && (
          <div className={styles.createRow}>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Nova cena…"
              aria-label="Nome da nova cena"
              disabled={busy}
            />
            <HudButton
              disabled={busy}
              onClick={() => {
                const name = draftName.trim() || undefined;
                onCreate(name || 'Nova cena', false);
                setDraftName('');
              }}
            >
              Criar
            </HudButton>
            <HudButton
              variant="ghost"
              disabled={busy || !currentSceneId}
              onClick={() => {
                onCreate(draftName.trim() || 'Cópia de cena', true);
                setDraftName('');
              }}
            >
              Duplicar
            </HudButton>
          </div>
        )}
      </div>

      <ul className={styles.list}>
        {scenes.map((scene) => {
          const viewing = scene.id === currentSceneId;
          const live = scene.id === activeSceneId;
          return (
            <li
              key={scene.id}
              className={styles.item}
              data-viewing={viewing ? '1' : '0'}
              data-live={live ? '1' : '0'}
            >
              {renamingId === scene.id ? (
                <form
                  className={styles.renameForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = renameValue.trim();
                    if (name) onRename(scene.id, name);
                    setRenamingId(null);
                  }}
                >
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    aria-label="Renomear cena"
                  />
                  <HudButton type="submit">OK</HudButton>
                  <HudButton
                    variant="ghost"
                    type="button"
                    onClick={() => setRenamingId(null)}
                  >
                    X
                  </HudButton>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.sceneBtn}
                    onClick={() => onSelect(scene.id)}
                  >
                    <span className={styles.sceneName}>{scene.name}</span>
                    <span className={styles.meta}>
                      {live ? 'AO VIVO' : 'mesa'}
                      {typeof scene.tokenCount === 'number'
                        ? ` · ${scene.tokenCount} tok`
                        : ''}
                    </span>
                  </button>
                  {isGm && (
                    <div className={styles.actions}>
                      {!live && (
                        <HudButton
                          variant="ghost"
                          disabled={busy}
                          onClick={() => onActivate(scene.id)}
                        >
                          Ativar
                        </HudButton>
                      )}
                      <HudButton
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          setRenamingId(scene.id);
                          setRenameValue(scene.name);
                        }}
                      >
                        Renomear
                      </HudButton>
                      <HudButton
                        variant="ghost"
                        disabled={busy || scenes.length <= 1}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Apagar cena “${scene.name}”? Tokens e fog dela serão removidos.`,
                            )
                          ) {
                            onDelete(scene.id);
                          }
                        }}
                      >
                        Apagar
                      </HudButton>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
