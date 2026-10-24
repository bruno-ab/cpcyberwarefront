'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '../../header/Header';
import { getNpcById } from '../../../data/npcSheets';
import { computeCyberwareCapacity } from '../../../lib/cyberwareCapacity';
import { SLOT_LABELS, CyberWareSlot } from '../../../data/cyberwareSlots';
import styles from '../npcs.module.css';

const renderDots = (value: number) => '●'.repeat(value) + '○'.repeat(Math.max(0, 5 - value));

const NpcSheetPage = () => {
  const params = useParams();
  const id = String(params?.id || '');
  const npc = useMemo(() => getNpcById(id), [id]);

  if (!npc) {
    return (
      <section className={styles.page}>
        <Header />
        <p>NPC não encontrado.</p>
        <Link href="/npcs">← Voltar</Link>
      </section>
    );
  }

  const { sheet } = npc;
  const capacity = computeCyberwareCapacity(
    sheet.cyberwareLoad.map((cw) => ({ implantCost: cw.implantCost })),
  );

  return (
    <section className={styles.page}>
      <Header />
      <p>
        <Link href="/npcs">← NPCs</Link>
      </p>
      <h2>{npc.name}</h2>
      <p className={styles.meta}>
        {npc.role} · {npc.affiliation} · ameaça {npc.threat}
      </p>
      <p>{npc.summary}</p>

      <div className={styles.sheetGrid}>
        <article className={styles.card}>
          <h3>Header</h3>
          {Object.entries(sheet.header).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </article>

        <article className={styles.card}>
          <h3>Recursos</h3>
          <p>Vitalidade: {sheet.vitality}</p>
          <p>Humanidade: {sheet.other_traits.humanity}</p>
          <p>Willpower: {sheet.other_traits.willpower}</p>
          <p>Edges (E): {sheet.other_traits.edges}</p>
          <p>
            Capacidade chrome: {capacity.remaining} livres / {capacity.used} usados
            {capacity.inCyberpsychosis
              ? ` · PSICOSE sev. ${capacity.cyberpsychosisSeverity}`
              : ''}
          </p>
        </article>
      </div>

      <div className={styles.sheetGrid}>
        {(
          [
            ['Physical', sheet.physical],
            ['Social', sheet.social],
            ['Mental', sheet.mental],
          ] as const
        ).map(([title, group]) => (
          <article key={title} className={styles.card}>
            <h3>{title}</h3>
            {Object.entries(group).map(([name, value]) => (
              <p key={name}>
                {name}: <span className={styles.dots}>{renderDots(value)}</span> ({value})
              </p>
            ))}
          </article>
        ))}
      </div>

      <div className={styles.sheetGrid}>
        {(
          [
            ['Talents', sheet.talents],
            ['Skills', sheet.skills],
            ['Knowledges', sheet.knowledges],
          ] as const
        ).map(([title, group]) => (
          <article key={title} className={styles.card}>
            <h3>{title}</h3>
            {Object.entries(group).map(([name, value]) => (
              <p key={name}>
                {name}: {value}
              </p>
            ))}
          </article>
        ))}
      </div>

      <article className={styles.card}>
        <h3>Cyberware</h3>
        {sheet.cyberwareLoad.length === 0 ? (
          <p>Sem chrome relevante.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Peça</th>
                <th>Slot</th>
                <th>E</th>
                <th>Implante</th>
                <th>Hack</th>
              </tr>
            </thead>
            <tbody>
              {sheet.cyberwareLoad.map((cw) => (
                <tr key={cw.name}>
                  <td>{cw.name}</td>
                  <td>{SLOT_LABELS[cw.slot as CyberWareSlot] || cw.slot}</td>
                  <td>{cw.edgeCost}</td>
                  <td>{cw.implantCost}</td>
                  <td>{cw.hackDifficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>

      <article className={styles.card}>
        <h3>Merits / Flaws</h3>
        {Object.entries(sheet.merits).map(([name, text]) => (
          <p key={name}>
            <strong>Merit — {name}:</strong> {text}
          </p>
        ))}
        {Object.entries(sheet.flaws).map(([name, text]) => (
          <p key={name}>
            <strong>Flaw — {name}:</strong> {text}
          </p>
        ))}
      </article>

      <article className={styles.card}>
        <h3>Ganchos de sessão</h3>
        <ul>
          {npc.storytellerHooks.map((hook) => (
            <li key={hook}>{hook}</li>
          ))}
        </ul>
        {sheet.notes ? <p>{sheet.notes}</p> : null}
      </article>
    </section>
  );
};

export default NpcSheetPage;
