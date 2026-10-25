'use client';

import styles from './gmNotesPanel.module.css';

type GmNotesPanelProps = {
  sceneNotes: string;
  tokenName?: string | null;
  tokenNotes?: string;
  onSceneNotesChange: (text: string) => void;
  onTokenNotesChange: (text: string) => void;
  onSceneNotesCommit: (text: string) => void;
  onTokenNotesCommit: (text: string) => void;
};

export const GmNotesPanel = ({
  sceneNotes,
  tokenName,
  tokenNotes = '',
  onSceneNotesChange,
  onTokenNotesChange,
  onSceneNotesCommit,
  onTokenNotesCommit,
}: GmNotesPanelProps) => (
  <div className={styles.wrap}>
    <p className={styles.banner}>Só o Mestre vê estas anotações</p>
    <label className={styles.field}>
      Cena — segredos / gatilhos
      <textarea
        value={sceneNotes}
        onChange={(e) => onSceneNotesChange(e.target.value)}
        onBlur={(e) => onSceneNotesCommit(e.target.value)}
        rows={3}
        placeholder="Ex.: ICE acordada se alguém hackear o terminal…"
        aria-label="Anotações da cena (GM)"
      />
    </label>
    <label className={styles.field}>
      Token {tokenName ? `· ${tokenName}` : '· (selecione um token)'}
      <textarea
        value={tokenNotes}
        onChange={(e) => onTokenNotesChange(e.target.value)}
        onBlur={(e) => onTokenNotesCommit(e.target.value)}
        disabled={!tokenName}
        rows={3}
        placeholder={
          tokenName
            ? 'Segredo deste token, loot, gatilho de diálogo…'
            : 'Clique num token no mapa para anotar'
        }
        aria-label="Anotações do token (GM)"
      />
    </label>
  </div>
);
