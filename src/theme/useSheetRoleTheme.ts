'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  readSheetThemeVariant,
  resolveSheetRoleId,
  SheetThemeVariant,
  writeSheetThemeVariant,
} from './sheetRoleThemes';

export const useSheetRoleTheme = (
  characterId: string | undefined,
  roleName: string | undefined | null,
) => {
  const roleId = resolveSheetRoleId(roleName);
  const [variant, setVariantState] = useState<SheetThemeVariant>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!characterId) {
      setVariantState('default');
      setMounted(true);
      return;
    }
    setVariantState(readSheetThemeVariant(String(characterId), roleId));
    setMounted(true);
  }, [characterId, roleId]);

  const setVariant = useCallback(
    (next: SheetThemeVariant) => {
      setVariantState(next);
      if (characterId) {
        writeSheetThemeVariant(String(characterId), roleId, next);
      }
    },
    [characterId, roleId],
  );

  return { roleId, variant, setVariant, mounted };
};
