'use client';

import React, { useMemo, useState } from 'react';
import { defaultAbilities } from './defaultSheet';
import { apiUrl, authHeaders } from '../../lib/api';
import { StatPanel } from '../../components/sheet/StatPanel';

const toNumberMap = (obj: Record<string, unknown> | undefined) =>
  Object.entries(obj || {}).reduce<Record<string, number>>((acc, [k, v]) => {
    acc[k] = Number(v) || 0;
    return acc;
  }, {});

const saveDataToApi = (
  id: string | number,
  data: Record<string, unknown>,
  talentValues: Record<string, number>,
  skillValues: Record<string, number>,
  knowledgeValues: Record<string, number>,
) => {
  const next = {
    ...data,
    talents: talentValues,
    skills: skillValues,
    knowledges: knowledgeValues,
  };

  fetch(apiUrl(`/api/characters/${id}/sheet`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(next),
  }).catch((error) => {
    console.error('Erro:', error.message);
  });
};

type Props = {
  characterData: {
    id: string | number;
    sheet?: Record<string, any>;
    statBonuses?: Record<string, number>;
  };
};

const Abilities = ({ characterData }: Props) => {
  const data = characterData.sheet || defaultAbilities;
  const bonuses = characterData.statBonuses || {};

  const [talentValues, setTalentValues] = useState(() =>
    toNumberMap(data.talents || defaultAbilities.talents),
  );
  const [skillValues, setSkillValues] = useState(() =>
    toNumberMap(data.skills || defaultAbilities.skills),
  );
  const [knowledgeValues, setKnowledgeValues] = useState(() =>
    toNumberMap(data.knowledges || defaultAbilities.knowledges),
  );

  const columns = useMemo(
    () => [
      {
        id: 'talents',
        title: 'Talents',
        keys: Object.keys(data.talents || defaultAbilities.talents),
        values: talentValues,
      },
      {
        id: 'skills',
        title: 'Skills',
        keys: Object.keys(data.skills || defaultAbilities.skills),
        values: skillValues,
      },
      {
        id: 'knowledges',
        title: 'Knowledges',
        keys: Object.keys(data.knowledges || defaultAbilities.knowledges),
        values: knowledgeValues,
      },
    ],
    [
      data.talents,
      data.skills,
      data.knowledges,
      talentValues,
      skillValues,
      knowledgeValues,
    ],
  );

  const onDotClick = (columnId: string, key: string, index: number) => {
    const bump = (
      current: Record<string, number>,
      set: (v: Record<string, number>) => void,
    ) => {
      const cur = Number(current[key]) || 0;
      let nextVal = cur;
      if (index < cur) nextVal -= 1;
      else nextVal += 1;
      nextVal = Math.max(0, Math.min(5, nextVal));
      const next = { ...current, [key]: nextVal };
      set(next);
      return next;
    };

    if (columnId === 'talents') {
      const next = bump(talentValues, setTalentValues);
      saveDataToApi(
        characterData.id,
        data,
        next,
        skillValues,
        knowledgeValues,
      );
      return;
    }
    if (columnId === 'skills') {
      const next = bump(skillValues, setSkillValues);
      saveDataToApi(
        characterData.id,
        data,
        talentValues,
        next,
        knowledgeValues,
      );
      return;
    }
    const next = bump(knowledgeValues, setKnowledgeValues);
    saveDataToApi(characterData.id, data, talentValues, skillValues, next);
  };

  return <StatPanel columns={columns} bonuses={bonuses} onDotClick={onDotClick} />;
};

export default Abilities;
