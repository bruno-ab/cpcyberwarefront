'use client';

import { useState, type DragEvent } from 'react';
import type { InitiativeEntry } from './CombatHud';
import styles from './initiativeReorderList.module.css';

export type InitiativeReorderListProps = {
  initiative: InitiativeEntry[];
  turnIndex: number;
  draggable?: boolean;
  onReorder?: (order: string[]) => void;
};

export const InitiativeReorderList = ({
  initiative,
  turnIndex,
  draggable = false,
  onReorder,
}: InitiativeReorderListProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    if (!onReorder || from === to || from < 0 || to < 0) return;
    const order = initiative.map((i) => i.tokenId);
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    onReorder(order);
  };

  const onDragStart = (index: number) => (e: DragEvent) => {
    if (!draggable) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const onDragOver = (index: number) => (e: DragEvent) => {
    if (!draggable || dragIndex == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex == null) return;
    reorder(dragIndex, index);
    setDragIndex(null);
  };

  const onDragEnd = () => setDragIndex(null);

  return (
    <>
      {draggable && initiative.length > 1 ? (
        <p className={styles.hint}>Arraste para reordenar a fila (GM).</p>
      ) : null}
      <ol className={styles.list}>
        {initiative.map((ini, i) => (
          <li
            key={ini.tokenId}
            data-current={i === turnIndex ? '1' : '0'}
            data-dragging={dragIndex === i ? '1' : '0'}
            draggable={draggable && !!onReorder}
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            onDrop={onDrop(i)}
            onDragEnd={onDragEnd}
          >
            <span className={styles.grip} aria-hidden={!draggable}>
              {draggable ? '⋮⋮' : null}
            </span>
            <span className={styles.name}>
              {ini.name}
              {ini.delayed ? ' (delay)' : ''}
              {ini.holding ? ' (hold)' : ''}
              {(ini.extraTurns || 0) > 0 ? ` +${ini.extraTurns}` : ''}
            </span>
            <span className={styles.score}>{ini.score}</span>
          </li>
        ))}
      </ol>
    </>
  );
};
