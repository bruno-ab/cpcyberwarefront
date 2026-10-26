'use client';

import React, { useState } from 'react';
import styles from './resources.module.css';
import { defaultResources } from './defaultSheet';
import { apiUrl, authHeaders } from '../../lib/api';

const labelOf = (name: string) => name.replace(/_/g, ' ');

const saveDataToApi = (
  id: string | number,
  data: Record<string, unknown>,
  backgroundsValues: Record<string, number>,
  virtuesValues: Record<string, number>,
  otherTraitsValues: Record<string, number>,
  meritsValues: Record<string, string>,
  flawsValues: Record<string, string>,
) => {
  const next = {
    ...data,
    backgrounds: backgroundsValues,
    virtues: virtuesValues,
    other_traits: otherTraitsValues,
    merits: meritsValues,
    flaws: flawsValues,
  };

  fetch(apiUrl(`/api/characters/${id}/sheet`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(next),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao enviar dados para a API');
      }
    })
    .catch((error) => {
      console.error('Erro:', error.message);
    });
};

const toNumberMap = (obj: Record<string, unknown> | undefined) =>
  Object.entries(obj || {}).reduce<Record<string, number>>((acc, [name, value]) => {
    acc[name] = Number(value) || 0;
    return acc;
  }, {});

const toStringMap = (obj: Record<string, unknown> | undefined) =>
  Object.entries(obj || {}).reduce<Record<string, string>>((acc, [name, value]) => {
    acc[name] = value == null ? '' : String(value);
    return acc;
  }, {});

type ResourcesProps = {
  characterData: {
    id: string | number;
    sheet?: Record<string, any>;
  };
};

const Resources = ({ characterData }: ResourcesProps) => {
  const data = characterData.sheet || defaultResources;
  const [maxBolinhas] = useState(10);
  const [newMerits, setNewMerits] = useState('');
  const [newFlaws, setNewFlaws] = useState('');
  const [backgroundsValues, setBackgroundsValues] = useState(
    toNumberMap(data.backgrounds),
  );
  const [newBackground, setNewBackground] = useState({ name: '', value: 1 });
  const [virtuesValues, setVirtuesValues] = useState(toNumberMap(data.virtues));
  const [otherTraitsValues, setOtherTraitsValues] = useState(
    toNumberMap(data.other_traits),
  );
  const [meritsValues, setMeritsValues] = useState(toStringMap(data.merits));
  const [flawsValues, setFlawsValues] = useState(toStringMap(data.flaws));

  const persist = (patch: {
    backgrounds?: Record<string, number>;
    virtues?: Record<string, number>;
    other?: Record<string, number>;
    merits?: Record<string, string>;
    flaws?: Record<string, string>;
  } = {}) => {
    saveDataToApi(
      characterData.id,
      data,
      patch.backgrounds ?? backgroundsValues,
      patch.virtues ?? virtuesValues,
      patch.other ?? otherTraitsValues,
      patch.merits ?? meritsValues,
      patch.flaws ?? flawsValues,
    );
  };

  const handleAddBackground = () => {
    if (newBackground.name.trim() === '') return;
    const newValue = Math.max(1, Math.min(5, newBackground.value));
    const next = {
      ...backgroundsValues,
      [newBackground.name.trim()]: newValue,
    };
    setBackgroundsValues(next);
    setNewBackground({ name: '', value: 1 });
    persist({ backgrounds: next });
  };

  const handleAddMerits = () => {
    if (newMerits.trim() === '') return;
    const key = newMerits.trim();
    const next = { ...meritsValues, [key]: '' };
    setMeritsValues(next);
    setNewMerits('');
    persist({ merits: next });
  };

  const handleAddFlaws = () => {
    if (newFlaws.trim() === '') return;
    const key = newFlaws.trim();
    const next = { ...flawsValues, [key]: '' };
    setFlawsValues(next);
    setNewFlaws('');
    persist({ flaws: next });
  };

  const handleBolinhaClick = (
    category: 'backgrounds' | 'virtues' | 'other' | 'merits' | 'flaws',
    attributeName: string,
    currentIndex: number,
  ) => {
    if (category === 'merits' || category === 'flaws') return;

    const source =
      category === 'backgrounds'
        ? backgroundsValues
        : category === 'virtues'
          ? virtuesValues
          : otherTraitsValues;

    let nextVal = Number(source[attributeName]) || 0;
    if (currentIndex < nextVal) nextVal -= 1;
    else nextVal += 1;
    nextVal = Math.min(maxBolinhas, Math.max(0, nextVal));

    if (category === 'backgrounds') {
      const next = { ...backgroundsValues, [attributeName]: nextVal };
      setBackgroundsValues(next);
      persist({ backgrounds: next });
      return;
    }
    if (category === 'virtues') {
      const next = { ...virtuesValues, [attributeName]: nextVal };
      setVirtuesValues(next);
      persist({ virtues: next });
      return;
    }
    const next = { ...otherTraitsValues, [attributeName]: nextVal };
    setOtherTraitsValues(next);
    persist({ other: next });
  };

  const renderDots = (
    category: 'backgrounds' | 'virtues' | 'other',
    attributeName: string,
    values: Record<string, number>,
  ) =>
    Array.from({ length: maxBolinhas }, (_, index) => (
      <button
        key={index}
        type="button"
        className={styles.dot}
        data-on={index < (values[attributeName] || 0) ? '1' : '0'}
        aria-label={`Nível ${index + 1}`}
        onClick={() => handleBolinhaClick(category, attributeName, index)}
      >
        ●
      </button>
    ));

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <section className={styles.col}>
          <h4 className={styles.colTitle}>Backgrounds</h4>
          {Object.keys(backgroundsValues).length === 0 && (
            <p className={styles.empty}>nenhum background</p>
          )}
          {Object.entries(backgroundsValues).map(([name]) => (
            <div key={name} className={styles.row}>
              <span className={styles.dots}>
                {renderDots('backgrounds', name, backgroundsValues)}
              </span>
              <span className={styles.label}>{labelOf(name)}</span>
            </div>
          ))}
          <div className={styles.addBlock}>
            <input
              type="text"
              className={styles.input}
              placeholder="Novo Background"
              value={newBackground.name}
              onChange={(e) =>
                setNewBackground({ ...newBackground, name: e.target.value })
              }
            />
            <div className={styles.rangeRow}>
              <input
                type="range"
                className={styles.range}
                min={1}
                max={5}
                step={1}
                value={newBackground.value}
                onChange={(e) =>
                  setNewBackground({
                    ...newBackground,
                    value: parseInt(e.target.value, 10),
                  })
                }
              />
              <span className={styles.rangeValue}>
                {newBackground.value} dots
              </span>
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={handleAddBackground}
            >
              Adicionar
            </button>
          </div>
        </section>

        <section className={styles.col}>
          <h4 className={styles.colTitle}>Resources</h4>
          {Object.entries(otherTraitsValues)
            .filter(
              ([name]) =>
                name !== 'edges' &&
                name !== 'reputation' &&
                name !== 'implant_capacity' &&
                name !== 'max_cyberware',
            )
            .map(([name]) => (
              <div key={name} className={styles.row}>
                <span className={styles.dots}>
                  {renderDots('other', name, otherTraitsValues)}
                </span>
                <span className={styles.label}>{labelOf(name)}</span>
              </div>
            ))}
          <div className={styles.row}>
            <label className={styles.numberField}>
              <span className={styles.label}>Reputação</span>
              <input
                type="number"
                min={0}
                className={styles.input}
                value={otherTraitsValues.reputation ?? 0}
                onChange={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    reputation: Math.max(0, Number(e.target.value) || 0),
                  };
                  setOtherTraitsValues(next);
                }}
                onBlur={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    reputation: Math.max(0, Number(e.target.value) || 0),
                  };
                  setOtherTraitsValues(next);
                  persist({ other: next });
                }}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label className={styles.numberField}>
              <span className={styles.label}>Edges (E)</span>
              <input
                type="number"
                min={0}
                className={styles.input}
                value={otherTraitsValues.edges ?? 0}
                onChange={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    edges: Math.max(0, Number(e.target.value) || 0),
                  };
                  setOtherTraitsValues(next);
                }}
                onBlur={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    edges: Math.max(0, Number(e.target.value) || 0),
                  };
                  setOtherTraitsValues(next);
                  persist({ other: next });
                }}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label className={styles.numberField}>
              <span className={styles.label}>Implant capacity</span>
              <input
                type="number"
                min={0}
                className={styles.input}
                value={otherTraitsValues.implant_capacity ?? 10}
                onChange={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    implant_capacity: Math.max(
                      0,
                      Number(e.target.value) || 0,
                    ),
                  };
                  setOtherTraitsValues(next);
                }}
                onBlur={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    implant_capacity: Math.max(
                      0,
                      Number(e.target.value) || 0,
                    ),
                  };
                  setOtherTraitsValues(next);
                  persist({ other: next });
                }}
              />
            </label>
          </div>
          <div className={styles.row}>
            <label className={styles.numberField}>
              <span className={styles.label}>Max chrome (peças)</span>
              <input
                type="number"
                min={1}
                className={styles.input}
                value={otherTraitsValues.max_cyberware ?? 8}
                onChange={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    max_cyberware: Math.max(1, Number(e.target.value) || 1),
                  };
                  setOtherTraitsValues(next);
                }}
                onBlur={(e) => {
                  const next = {
                    ...otherTraitsValues,
                    max_cyberware: Math.max(1, Number(e.target.value) || 1),
                  };
                  setOtherTraitsValues(next);
                  persist({ other: next });
                }}
              />
            </label>
          </div>
        </section>

        <section className={styles.col}>
          <h4 className={styles.colTitle}>Merits</h4>
          {Object.keys(meritsValues).length === 0 && (
            <p className={styles.empty}>nenhum merit</p>
          )}
          {Object.entries(meritsValues).map(([name, value]) => (
            <div key={name} className={styles.row}>
              <input
                type="text"
                className={styles.input}
                placeholder={labelOf(name)}
                value={value}
                onChange={(e) => {
                  setMeritsValues({
                    ...meritsValues,
                    [name]: e.target.value,
                  });
                }}
                onBlur={(e) =>
                  persist({
                    merits: { ...meritsValues, [name]: e.target.value },
                  })
                }
              />
            </div>
          ))}
          <div className={styles.addBlock}>
            <input
              type="text"
              className={styles.input}
              placeholder="Novo Merit"
              value={newMerits}
              onChange={(e) => setNewMerits(e.target.value)}
            />
            <button
              type="button"
              className={styles.btn}
              onClick={handleAddMerits}
            >
              Adicionar
            </button>
          </div>
        </section>

        <section className={styles.col}>
          <h4 className={styles.colTitle}>Flaws</h4>
          {Object.keys(flawsValues).length === 0 && (
            <p className={styles.empty}>nenhum flaw</p>
          )}
          {Object.entries(flawsValues).map(([name, value]) => (
            <div key={name} className={styles.row}>
              <input
                type="text"
                className={styles.input}
                placeholder={labelOf(name)}
                value={value}
                onChange={(e) => {
                  setFlawsValues({
                    ...flawsValues,
                    [name]: e.target.value,
                  });
                }}
                onBlur={(e) =>
                  persist({
                    flaws: { ...flawsValues, [name]: e.target.value },
                  })
                }
              />
            </div>
          ))}
          <div className={styles.addBlock}>
            <input
              type="text"
              className={styles.input}
              placeholder="Novo Flaw"
              value={newFlaws}
              onChange={(e) => setNewFlaws(e.target.value)}
            />
            <button
              type="button"
              className={styles.btn}
              onClick={handleAddFlaws}
            >
              Adicionar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;
