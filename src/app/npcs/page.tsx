import Header from '../header/Header';
import { NPCS } from '../../data/npcs';
import styles from './npcs.module.css';

const NpcsPage = () => {
  return (
    <section className={styles.page}>
      <Header />
      <h2>NPCs — Night City & Edgerunners</h2>
      <p className={styles.intro}>
        Perfis prontos para sessão Storyteller. Use as paradas sugeridas como ponto de
        partida; ajuste ameaça conforme a mesa.
      </p>

      <div className={styles.grid}>
        {NPCS.map((npc) => (
          <article key={npc.id} className={styles.card}>
            <header className={styles.cardHeader}>
              <h3>{npc.name}</h3>
              <span className={styles.badge}>{npc.threat}</span>
            </header>
            <p className={styles.meta}>
              {npc.role} · {npc.affiliation} · {npc.source}
            </p>
            <p>{npc.summary}</p>
            <p>
              <strong>Conceito:</strong> {npc.concept}
            </p>
            <p>
              <strong>Chrome:</strong> {npc.notableCyberware.join(', ')}
            </p>
            <p>
              <strong>Combate:</strong> {npc.suggestedDice.combat}
            </p>
            <p>
              <strong>Social:</strong> {npc.suggestedDice.social}
            </p>
            <p>
              <strong>Tech:</strong> {npc.suggestedDice.tech}
            </p>
            <ul>
              {npc.storytellerHooks.map((hook) => (
                <li key={hook}>{hook}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NpcsPage;
