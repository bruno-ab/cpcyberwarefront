'use client';

import { useState } from 'react';
import { HudButton } from '../ui/HudButton';
import { formatStatOption, sheetStatValue } from '../../lib/sheetPool';
import { characterImageSrc } from '../../lib/media';
import { ROLE_RULES } from '../../data/roleRules';
import { defaultAbilities } from '../../app/sheet/defaultSheet';
import { speedFromSheetSummary } from '../../lib/characterSpeed';
import { ramFromSheetSummary } from '../../lib/characterRam';
import type { RunnerChar } from './RunnerPanel';
import styles from './runnerSheetPopup.module.css';

type PopupTab = 'atributos' | 'habilidades';

type RunnerSheetPopupProps = {
  character: RunnerChar;
  onClose: () => void;
  onRoll: (opts: { attr: string; skill: string; label: string }) => void;
};

const STAT_GROUPS: Array<{
  id: string;
  title: string;
  keys: string[];
}> = [
  {
    id: 'physical',
    title: 'Physical',
    keys: ['strength', 'dexterity', 'stamina'],
  },
  {
    id: 'social',
    title: 'Social',
    keys: ['charisma', 'manipulation', 'appearance'],
  },
  {
    id: 'mental',
    title: 'Mental',
    keys: ['perception', 'intelligence', 'wits'],
  },
];

const ABILITY_GROUPS: Array<{
  id: keyof typeof defaultAbilities;
  title: string;
}> = [
  { id: 'talents', title: 'Talentos' },
  { id: 'skills', title: 'Perícias' },
  { id: 'knowledges', title: 'Conhecimentos' },
];

const findRoleRule = (role?: string) => {
  const r = String(role || '').toLowerCase();
  return (
    ROLE_RULES.find(
      (x) =>
        x.id === r ||
        x.name.toLowerCase() === r ||
        r.includes(x.id),
    ) || null
  );
};

const entriesOf = (block: Record<string, any> | undefined) =>
  Object.entries(block || {})
    .map(([k, v]) => ({ key: k, value: Number(v) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

const abilityRows = (
  id: keyof typeof defaultAbilities,
  block: Record<string, any> | undefined,
) => {
  const defaults = defaultAbilities[id] as Record<string, number>;
  const keys = Array.from(
    new Set([...Object.keys(defaults), ...Object.keys(block || {})]),
  );
  return keys
    .map((key) => ({
      key,
      value: Number(block?.[key] ?? defaults[key]) || 0,
    }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
};

export const RunnerSheetPopup = ({
  character,
  onClose,
  onRoll,
}: RunnerSheetPopupProps) => {
  const [tab, setTab] = useState<PopupTab>('atributos');
  const sheet = character.sheetSummary || {};
  const speed = speedFromSheetSummary(sheet);
  const ram = ramFromSheetSummary(sheet);
  const ot = sheet.other_traits || {};
  const header = sheet.header || {};
  const roleRule = findRoleRule(character.role || sheet.role);
  const portrait = characterImageSrc(character);

  return (
    <div className={styles.backdrop} role="dialog" aria-label="Ficha">
      <div className={styles.panel}>
        <header className={styles.head}>
          <div className={styles.headMain}>
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portrait} alt="" className={styles.thumb} />
            ) : (
              <span className={styles.thumbFallback}>
                {character.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <strong>{character.name}</strong>
              <div className={styles.meta}>
                {character.role || sheet.role || header.concept || '—'}
                {header.background ? ` · ${header.background}` : ''}
                {header.origin ? ` · ${header.origin}` : ''}
              </div>
              <div className={styles.meta}>
                HP {character.vitality ?? '—'}/{character.vitalityMax ?? 7}
                {ot.humanity != null ? ` · HUM ${ot.humanity}` : ''}
                {ot.reputation != null ? ` · Rep ${ot.reputation}` : ''}
                {character.credits != null
                  ? ` · Eddies ${character.credits}`
                  : ''}
                {ot.willpower != null ? ` · WP ${ot.willpower}` : ''}
              </div>
              <div className={styles.meta}>
                Velocidade <b>{speed.speed}</b>
                {speed.speedBonus > 0 ? (
                  <span className={styles.speedBoost}>
                    {' '}
                    ({speed.speedBase}+{speed.speedBonus} chrome)
                  </span>
                ) : (
                  ' · 5 + Destreza'
                )}
              </div>
              {(ram.hasNetDeck || ram.ramMax > 0) && (
                <div className={styles.meta}>
                  RAM{' '}
                  <b>
                    {ram.ram}/{ram.ramMax}
                  </b>
                  {ram.ramBonus > 0 ? (
                    <span className={styles.speedBoost}>
                      {' '}
                      ({ram.ramBase}+{ram.ramBonus} chrome)
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <HudButton variant="ghost" onClick={onClose}>
            ×
          </HudButton>
        </header>

        <nav className={styles.tabs} aria-label="Seções da ficha">
          <button
            type="button"
            className={tab === 'atributos' ? styles.tabActive : undefined}
            aria-selected={tab === 'atributos'}
            onClick={() => setTab('atributos')}
          >
            Atributos
          </button>
          <button
            type="button"
            className={tab === 'habilidades' ? styles.tabActive : undefined}
            aria-selected={tab === 'habilidades'}
            onClick={() => setTab('habilidades')}
          >
            Habilidades
          </button>
        </nav>

        {tab === 'atributos' && (
          <div className={styles.grid}>
            {STAT_GROUPS.map((g) => (
              <section key={g.id} className={styles.block}>
                <h3>{g.title}</h3>
                <ul>
                  {g.keys.map((key) => {
                    const value = sheetStatValue(sheet, key);
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          disabled={value <= 0}
                          onClick={() =>
                            onRoll({
                              attr: key,
                              skill: 'alertness',
                              label: formatStatOption(key),
                            })
                          }
                        >
                          <span>{formatStatOption(key)}</span>
                          <b>{value}</b>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {roleRule && (
              <section className={styles.blockWide}>
                <h3>Role · {roleRule.roleAbility.name}</h3>
                <p>{roleRule.roleAbility.effect}</p>
              </section>
            )}

            {Array.isArray(sheet.chrome) && sheet.chrome.length > 0 && (
              <section className={styles.blockWide}>
                <h3>Chrome</h3>
                <p className={styles.flat}>{sheet.chrome.join(' · ')}</p>
              </section>
            )}

            {Array.isArray(sheet.weapons) && sheet.weapons.length > 0 && (
              <section className={styles.blockWide}>
                <h3>Armas</h3>
                <p className={styles.flat}>{sheet.weapons.join(' · ')}</p>
              </section>
            )}
          </div>
        )}

        {tab === 'habilidades' && (
          <div className={styles.grid}>
            {ABILITY_GROUPS.map((g) => {
              const rows = abilityRows(g.id, sheet[g.id]);
              return (
                <section key={g.id} className={styles.block}>
                  <h3>{g.title}</h3>
                  <ul>
                    {rows.map((r) => (
                      <li key={r.key}>
                        <button
                          type="button"
                          disabled={r.value <= 0}
                          onClick={() =>
                            onRoll({
                              attr: 'dexterity',
                              skill: r.key,
                              label: formatStatOption(r.key),
                            })
                          }
                        >
                          <span>{formatStatOption(r.key)}</span>
                          <b>{r.value}</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {sheet.virtues && Object.keys(sheet.virtues).length > 0 && (
              <section className={styles.block}>
                <h3>Virtudes</h3>
                <ul>
                  {entriesOf(sheet.virtues).map((r) => (
                    <li key={r.key}>
                      <span>{formatStatOption(r.key)}</span>
                      <b>{r.value}</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sheet.backgrounds && Object.keys(sheet.backgrounds).length > 0 && (
              <section className={styles.block}>
                <h3>Antecedentes</h3>
                <ul>
                  {entriesOf(sheet.backgrounds).map((r) => (
                    <li key={r.key}>
                      <span>{formatStatOption(r.key)}</span>
                      <b>{r.value}</b>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
