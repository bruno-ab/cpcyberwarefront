import Header from '../header/Header';
import styles from './rules.module.css';
import { CYBERWARE_RULES } from '../../data/cyberwareRules';
import { SLOT_LABELS } from '../../data/cyberwareSlots';
import {
  LIFEPATH_RULES,
  ROLE_CREATION_NOTES,
  ROLE_RULES,
} from '../../data/roleRules';

const Rules = () => {
  return (
    <section className={`${styles.cyberpunk} ${styles.black}`}>
      <Header />
      <h2 className={styles.cyberpunk}>Regras — Storyteller × Cyberpunk 2077</h2>

      <article className={styles.ruleBlock}>
        <h3>Classes / Roles</h3>
        <p>
          As roles abaixo são as classes do universo Cyberpunk (RED/2077) adaptadas ao
          Storyteller. Escolha uma role principal na criação.
        </p>
        <ul>
          {ROLE_CREATION_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </article>

      {ROLE_RULES.map((role) => (
        <article key={role.id} className={styles.ruleBlock}>
          <h3>
            {role.name} <span className={styles.aka}>({role.aka})</span>
          </h3>
          <p>{role.summary}</p>
          <p>
            <strong>Atributos-chave:</strong> {role.primaryAttributes.join(', ')}
          </p>
          <p>
            <strong>Habilidades-chave:</strong> {role.keyAbilities.join(', ')}
          </p>
          <p>
            <strong>Edges na criação:</strong> {role.edgesOnCreate}
          </p>
          <p>
            <strong>Role Ability — {role.roleAbility.name}:</strong>{' '}
            {role.roleAbility.effect}
          </p>
          <p>
            <strong>Chrome sugerido:</strong> {role.suggestedChrome.join(', ')}
          </p>
          <ul>
            {role.sessionHooks.map((hook) => (
              <li key={hook}>{hook}</li>
            ))}
          </ul>
        </article>
      ))}

      <article className={styles.ruleBlock}>
        <h3>Lifepaths de CP2077 (origem)</h3>
        <p>Opcional na criação — bônus de Night City estilo V.</p>
      </article>
      {LIFEPATH_RULES.map((path) => (
        <article key={path.id} className={styles.ruleBlock}>
          <h3>{path.name}</h3>
          <p>{path.summary}</p>
          <p>
            <strong>Bônus:</strong> {path.bonus}
          </p>
          <p>
            <strong>Contatos:</strong> {path.contacts}
          </p>
          <p>
            <strong>Complicação:</strong> {path.complication}
          </p>
        </article>
      ))}

      <h2 className={styles.cyberpunk}>{CYBERWARE_RULES.title}</h2>
      <p className={`${styles.cyberpunk} ${styles.inverse}`}>{CYBERWARE_RULES.intro}</p>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.capacity.title}</h3>
        <ul>
          {CYBERWARE_RULES.capacity.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.edges.title}</h3>
        <ul>
          {CYBERWARE_RULES.edges.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.hacking.title}</h3>
        <ul>
          {CYBERWARE_RULES.hacking.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.cyberpsychosis.title}</h3>
        <ul>
          {CYBERWARE_RULES.cyberpsychosis.stages.map((stage) => (
            <li key={stage.severity}>
              <strong>Severidade {stage.severity}:</strong> {stage.effect}
            </li>
          ))}
        </ul>
      </article>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.slots.title}</h3>
        <ul>
          {Object.values(SLOT_LABELS).map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </article>

      <article className={styles.ruleBlock}>
        <h3>{CYBERWARE_RULES.sessionTips.title}</h3>
        <ul>
          {CYBERWARE_RULES.sessionTips.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <p className={styles.footerNote}>
        Catálogo: <a href="/catalog">/catalog</a> · Fichas de NPCs:{' '}
        <a href="/npcs">/npcs</a>
      </p>
    </section>
  );
};

export default Rules;
