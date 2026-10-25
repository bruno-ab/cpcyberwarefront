'use client';

import { useCallback, useState } from 'react';
import type { ShardId } from '../../theme/secrets';
import { tryShardAssembly } from '../../theme/secrets';
import { collectShard } from '../../theme/unlocks';
import styles from './ShardGlyph.module.css';

type Props = {
  shardId: ShardId;
  glyph: string;
  /** Screen-reader only hint */
  ariaHint?: string;
};

export const ShardGlyph = ({ shardId, glyph, ariaHint }: Props) => {
  const [flash, setFlash] = useState(false);

  const onActivate = useCallback(() => {
    const added = collectShard(shardId);
    tryShardAssembly();
    if (added) {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1200);
    }
  }, [shardId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <button
      type="button"
      className={styles.glyph}
      data-flash={flash || undefined}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      aria-label={ariaHint || 'Data fragment'}
      title=""
    >
      {glyph}
    </button>
  );
};

export default ShardGlyph;
