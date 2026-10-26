'use client';

import React, { useMemo, useState } from 'react';
import { defaultAttributes } from './defaultSheet';
import { apiUrl, authHeaders } from '../../lib/api';
import { StatPanel } from '../../components/sheet/StatPanel';
import { computeCharacterSpeed } from '../../lib/characterSpeed';
import styles from './attributes.module.css';

const toNumberMap = (obj: Record<string, unknown> | undefined) =>
  Object.entries(obj || {}).reduce<Record<string, number>>((acc, [k, v]) => {
    acc[k] = Number(v) || 0;
    return acc;
  }, {});

const saveDataToApi = (
  id: string | number,
  data: Record<string, unknown>,
  physicalValues: Record<string, number>,
  socialValues: Record<string, number>,
  mentalValues: Record<string, number>,
) => {
  const next = {
    ...data,
    physical: physicalValues,
    social: socialValues,
    mental: mentalValues,
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

const Attributes = ({ characterData }: Props) => {
  const data = characterData.sheet || defaultAttributes;
  const bonuses = characterData.statBonuses || {};

  const [physicalValues, setPhysicalValues] = useState(() =>
    toNumberMap(data.physical || defaultAttributes.physical),
  );
  const [socialValues, setSocialValues] = useState(() =>
    toNumberMap(data.social || defaultAttributes.social),
  );
  const [mentalValues, setMentalValues] = useState(() =>
    toNumberMap(data.mental || defaultAttributes.mental),
  );

  const speedInfo = useMemo(
    () =>
      computeCharacterSpeed(
        { physical: physicalValues },
        bonuses,
      ),
    [physicalValues, bonuses],
  );

  const columns = useMemo(
    () => [
      {
        id: 'physical',
        title: 'Physical',
        keys: Object.keys(data.physical || defaultAttributes.physical),
        values: physicalValues,
      },
      {
        id: 'social',
        title: 'Social',
        keys: Object.keys(data.social || defaultAttributes.social),
        values: socialValues,
      },
      {
        id: 'mental',
        title: 'Mental',
        keys: Object.keys(data.mental || defaultAttributes.mental),
        values: mentalValues,
      },
    ],
    [data.physical, data.social, data.mental, physicalValues, socialValues, mentalValues],
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

    if (columnId === 'physical') {
      const next = bump(physicalValues, setPhysicalValues);
      saveDataToApi(characterData.id, data, next, socialValues, mentalValues);
      return;
    }
    if (columnId === 'social') {
      const next = bump(socialValues, setSocialValues);
      saveDataToApi(characterData.id, data, physicalValues, next, mentalValues);
      return;
    }
    const next = bump(mentalValues, setMentalValues);
    saveDataToApi(characterData.id, data, physicalValues, socialValues, next);
  };

  return (
    <>
      <div className={styles.speedBlock} aria-label="Velocidade">
        <span className={styles.speedLabel}>Velocidade</span>
        <span className={styles.speedValue}>
          {speedInfo.speed}
          {speedInfo.speedBonus > 0 ? (
            <small className={styles.speedBonus}>
              {' '}
              ({speedInfo.speedBase}
              <span className={styles.speedBonusEm}>+{speedInfo.speedBonus}</span>)
            </small>
          ) : (
            <small className={styles.speedHint}> · 5 + Destreza</small>
          )}
        </span>
      </div>
      <StatPanel columns={columns} bonuses={bonuses} onDotClick={onDotClick} />
    </>
  );
};

export default Attributes;
