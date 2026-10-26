'use client';

import { HudButton } from '../ui/HudButton';
import { computeSheetPool, formatStatOption } from '../../lib/sheetPool';
import { characterImageSrc } from '../../lib/media';
import { ROLE_RULES } from '../../data/roleRules';
import { speedFromSheetSummary } from '../../lib/characterSpeed';
import { ramFromSheetSummary } from '../../lib/characterRam';
import { chromeActivationRamCost } from '../../lib/chromeCatalog';
import styles from './runnerPanel.module.css';

export type RunnerChar = {
  id: string;
  name: string;
  role?: string;
  credits?: number;
  image?: string | null;
  vitality?: number;
  vitalityMax?: number;
  sheetSummary?: Record<string, any>;
};

type QuickRoll = {
  attr: string;
  skill: string;
  label: string;
};

type RunnerPanelProps = {
  character: RunnerChar | null;
  difficulty: number;
  onRoll: (opts: { attr: string; skill: string; label: string }) => void;
  onOpenSheet: () => void;
  onChrome?: (chrome: string) => void;
};

const COMMON_ROLLS: QuickRoll[] = [
  { attr: 'dexterity', skill: 'alertness', label: 'Iniciativa' },
  { attr: 'dexterity', skill: 'firearms', label: 'Firearms' },
  { attr: 'dexterity', skill: 'athletics', label: 'Esquiva' },
  { attr: 'wits', skill: 'streetwise', label: 'Streetwise' },
  { attr: 'intelligence', skill: 'computer', label: 'Computer' },
  { attr: 'perception', skill: 'investigation', label: 'Scan' },
  { attr: 'strength', skill: 'melee', label: 'Melee' },
  { attr: 'charisma', skill: 'expression', label: 'Expression' },
];

const topStats = (sheet: Record<string, any> | undefined, group: string, n = 4) => {
  const block = sheet?.[group] || {};
  return Object.entries(block)
    .map(([k, v]) => ({ key: k, value: Number(v) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
};

const findRoleRule = (role?: string) => {
  const r = String(role || '').toLowerCase();
  return (
    ROLE_RULES.find(
      (x) =>
        x.id === r ||
        x.name.toLowerCase() === r ||
        r.includes(x.id) ||
        x.name.toLowerCase().includes(r),
    ) || null
  );
};

export const RunnerPanel = ({
  character,
  difficulty,
  onRoll,
  onOpenSheet,
  onChrome,
}: RunnerPanelProps) => {
  if (!character) {
    return (
      <aside className={styles.wrap}>
        <header className={styles.head}>Runner</header>
        <p className={styles.empty}>Sem ficha no roster desta campanha.</p>
      </aside>
    );
  }

  const sheet = character.sheetSummary || {};
  const speed = speedFromSheetSummary(sheet);
  const ram = ramFromSheetSummary(sheet);
  const ot = sheet.other_traits || {};
  const roleRule = findRoleRule(character.role || sheet.role);
  const portrait = characterImageSrc(character);
  const skills = [
    ...topStats(sheet, 'talents', 3),
    ...topStats(sheet, 'skills', 3),
    ...topStats(sheet, 'knowledges', 2),
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const rolls = (() => {
    const ranked = COMMON_ROLLS.filter(
      (r) => computeSheetPool(sheet, r.attr, r.skill) >= 2,
    ).slice(0, 6);
    return ranked.length > 0 ? ranked : COMMON_ROLLS.slice(0, 4);
  })();

  return (
    <aside className={styles.wrap}>
      <header className={styles.head}>
        <span>Runner</span>
        <em>{character.role || sheet.role || '—'}</em>
      </header>

      <button
        type="button"
        className={styles.portraitBtn}
        onClick={onOpenSheet}
        title="Abrir ficha compacta"
      >
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} alt="" />
        ) : (
          <span className={styles.portraitFallback}>
            {character.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className={styles.portraitHint}>ficha</span>
      </button>

      <div className={styles.identity}>
        <strong>{character.name}</strong>
        <span>
          HP {character.vitality ?? '—'}/{character.vitalityMax ?? 7}
          {ot.humanity != null ? ` · HUM ${ot.humanity}` : ''}
        </span>
        <span>
          {ot.reputation != null ? `Rep ${ot.reputation}` : ''}
          {character.credits != null
            ? `${ot.reputation != null ? ' · ' : ''}Eddies ${character.credits}`
            : ''}
          {ot.willpower != null ? ` · WP ${ot.willpower}` : ''}
        </span>
        <span className={styles.speedLine}>
          Velocidade{' '}
          <b>{speed.speed}</b>
          {speed.speedBonus > 0 ? (
            <>
              {' '}
              <em className={styles.speedBoost}>
                ({speed.speedBase}+{speed.speedBonus})
              </em>
            </>
          ) : null}
        </span>
        {ram.hasNetDeck || ram.ramMax > 0 ? (
          <span className={styles.speedLine}>
            RAM{' '}
            <b>
              {ram.ram}/{ram.ramMax}
            </b>
            {ram.ramNeural > 0 || ram.ramBonus > 0 || ram.ramBase > 0 ? (
              <em className={styles.speedBoost}>
                {' '}
                ({[
                  ram.ramNeural > 0 ? `${ram.ramNeural} neural` : null,
                  ram.ramBase > 0 ? `${ram.ramBase} deck` : null,
                  ram.ramBonus > 0 ? `+${ram.ramBonus} chrome` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')})
              </em>
            ) : null}
          </span>
        ) : null}
      </div>

      {roleRule && (
        <div className={styles.ability}>
          <div className={styles.abilityName}>
            {roleRule.roleAbility.name}
            {ot.role_ability_rank ? ` · R${ot.role_ability_rank}` : ''}
          </div>
          <p>{roleRule.roleAbility.effect}</p>
          <HudButton
            variant="ghost"
            onClick={() =>
              onRoll({
                attr: 'wits',
                skill: 'alertness',
                label: `Role · ${roleRule.roleAbility.name}`,
              })
            }
          >
            Usar role
          </HudButton>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Attrs</span>
        <ul className={styles.statList}>
          {[
            ...topStats(sheet, 'physical', 3),
            ...topStats(sheet, 'mental', 2),
            ...topStats(sheet, 'social', 1),
          ].map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() =>
                  onRoll({
                    attr: s.key,
                    skill: skills[0]?.key || 'alertness',
                    label: formatStatOption(s.key),
                  })
                }
              >
                {formatStatOption(s.key)}
                <b>{s.value}</b>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Skills</span>
        <ul className={styles.statList}>
          {skills.map((s) => {
            const attrGuess =
              sheet.physical?.dexterity != null ? 'dexterity' : 'intelligence';
            const pool = computeSheetPool(sheet, attrGuess, s.key);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() =>
                    onRoll({
                      attr: attrGuess,
                      skill: s.key,
                      label: formatStatOption(s.key),
                    })
                  }
                  title={`pool ~${pool} vs dif ${difficulty}`}
                >
                  {formatStatOption(s.key)}
                  <b>{s.value}</b>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Quick rolls</span>
        <div className={styles.quick}>
          {rolls.map((r) => {
            const pool = Math.max(
              1,
              computeSheetPool(sheet, r.attr, r.skill),
            );
            return (
              <HudButton
                key={r.label}
                variant="ghost"
                onClick={() =>
                  onRoll({
                    attr: r.attr,
                    skill: r.skill,
                    label: r.label,
                  })
                }
                title={`${formatStatOption(r.attr)}+${formatStatOption(r.skill)} = ${pool}`}
              >
                {r.label}
                <i>{pool}</i>
              </HudButton>
            );
          })}
        </div>
      </div>

      {Array.isArray(sheet.chrome) && sheet.chrome.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Chrome</span>
          <ul className={styles.chromeList}>
            {sheet.chrome.slice(0, 6).map((name: string) => {
              const cost = chromeActivationRamCost(name);
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => onChrome?.(name)}
                    title={
                      cost != null
                        ? `${name} · ativar custa ${cost} RAM`
                        : name
                    }
                  >
                    {name}
                    {cost != null ? <i>RAM {cost}</i> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};
