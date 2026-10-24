import Header from '../header/Header';
import styles from './rules.module.css';
import { CYBERWARE_RULES } from '../../data/cyberwareRules';
import { SLOT_LABELS } from '../../data/cyberwareSlots';

const Rules = () => {
  return (
    <section className={`${styles.cyberpunk} ${styles.black}`}>
      <Header />
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
        <ul>
          {CYBERWARE_RULES.slots.bullets.map((item) => (
            <li key={item}>{item}</li>
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
        Catálogo completo de peças: <a href="/catalog">/catalog</a> · NPCs da mesa:{' '}
        <a href="/npcs">/npcs</a>
      </p>
    </section>
  );
};

export default Rules;
