'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  readLoreUnlocks,
  readShardCollection,
  readThemeUnlocks,
  SECRETS_UPDATED_EVENT,
} from './unlocks';
import { SHARD_DEFS } from './secrets';
import type { SecretThemeId } from './secretThemes';

export const useSecrets = () => {
  const [themeUnlocks, setThemeUnlocks] = useState<SecretThemeId[]>([]);
  const [loreUnlocks, setLoreUnlocks] = useState<string[]>([]);
  const [shards, setShards] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setThemeUnlocks(readThemeUnlocks());
    setLoreUnlocks(readLoreUnlocks());
    setShards(readShardCollection());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(SECRETS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SECRETS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const shardProgress = SHARD_DEFS.map((def) => ({
    ...def,
    collected: shards.includes(def.id),
  }));

  return {
    themeUnlocks,
    loreUnlocks,
    shards,
    shardProgress,
    refresh,
  };
};
