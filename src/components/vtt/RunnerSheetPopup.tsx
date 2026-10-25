'use client';

import { HudButton } from '../ui/HudButton';
import { formatStatOption, sheetStatValue } from '../../lib/sheetPool';
import { characterImageSrc } from '../../lib/media';
import { ROLE_RULES } from '../../data/roleRules';
import type { RunnerChar } from './RunnerPanel';
import styles from './runnerSheetPopup.module.css';

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
  id: string;
  title: string;
}> = [
  { id: 'talents', title: 'Talents' },
  { id: 'skills', title: 'Skills' },
  { id: 'knowledges', title: 'Knowledges' },
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

export const RunnerSheetPopup = ({
  character,
  onClose,
  onRoll,
}: RunnerSheetPopupProps) => {
  const sheet = character.sheetSummary || {};
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
                {ot.edges != null ? ` · Edges ${ot.edges}` : ''}
                {ot.willpower != null ? ` · WP ${ot.willpower}` : ''}
                {character.credits != null ? ` · ¤${character.credits}` : ''}
              </div>
            </div>
          </div>
          <HudButton variant="ghost" onClick={onClose}>
            ×
          </HudButton>
        </header>

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

          {ABILITY_GROUPS.map((g) => {
            const rows = entriesOf(sheet[g.id]);
            if (!rows.length) return null;
            return (
              <section key={g.id} className={styles.block}>
                <h3>{g.title}</h3>
                <ul>
                  {rows.map((r) => (
                    <li key={r.key}>
                      <button
                        type="button"
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

          {sheet.virtues && Object.keys(sheet.virtues).length > 0 && (
            <section className={styles.block}>
              <h3>Virtues</h3>
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
              <h3>Backgrounds</h3>
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
      </div>
    </div>
  );
};
