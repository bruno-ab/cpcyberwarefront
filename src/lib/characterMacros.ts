import { apiUrl, authHeaders } from './api';

export type CharacterMacro = {
  id: string;
  name: string;
  attr: string;
  skill: string;
  label?: string;
};

const localKey = (characterId: string) => `cp-character-macros:${characterId}`;

export const loadCharacterMacros = async (
  characterId: string,
): Promise<CharacterMacro[]> => {
  try {
    const res = await fetch(apiUrl(`/api/characters/${characterId}/macros`), {
      headers: authHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.macros)) return json.macros;
    }
  } catch {
    /* fallback local */
  }
  try {
    const raw = localStorage.getItem(localKey(characterId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
};

export const saveCharacterMacros = async (
  characterId: string,
  macros: CharacterMacro[],
): Promise<void> => {
  try {
    localStorage.setItem(localKey(characterId), JSON.stringify(macros));
  } catch {
    /* ignore */
  }
  try {
    await fetch(apiUrl(`/api/characters/${characterId}/macros`), {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ macros }),
    });
  } catch {
    /* local only */
  }
};
