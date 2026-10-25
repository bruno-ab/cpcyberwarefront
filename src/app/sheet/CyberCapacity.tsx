'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { computeCyberwareCapacity } from '../../lib/cyberwareCapacity';
import { SLOT_LABELS, CyberWareSlot } from '../../data/cyberwareSlots';
import {
  BodyPart,
  BODY_PART_LABELS,
  bodyPartsWithInstalledChrome,
  cyberwareMatchesBodyPart,
} from '../../data/bodyPartSlots';
import { cyberwareImageSrc } from '../../lib/media';
import { BodyFigure } from '../cyberware/BodyFigure';
import pageStyles from './page.module.css';
import styles from './cyberCapacity.module.css';

type CyberItem = {
  name: string;
  type: string;
  image?: string;
  implantCost?: number;
  edgeCost?: number;
  hackDifficulty?: number;
  effect?: string;
};

type CyberCapacityProps = {
  characterData: {
    id: string | number;
    cyberwares?: CyberItem[];
    cyberwareCapacity?: {
      remaining: number;
      used: number;
      baseCapacity: number;
      inCyberpsychosis: boolean;
      cyberpsychosisSeverity: number;
    };
    sheet?: {
      other_traits?: {
        edges?: number;
        implant_capacity?: number;
      };
    };
  };
};

const CyberCapacity = ({ characterData }: CyberCapacityProps) => {
  const cyberwares = characterData.cyberwares || [];
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);

  const capacity =
    characterData.cyberwareCapacity ||
    computeCyberwareCapacity(
      cyberwares.map((cw) => ({ implantCost: cw.implantCost ?? 1 })),
    );
  const edges = characterData.sheet?.other_traits?.edges ?? 0;

  const installedParts = useMemo(
    () => bodyPartsWithInstalledChrome(cyberwares.map((cw) => cw.type)),
    [cyberwares],
  );

  const filtered = useMemo(() => {
    if (!selectedPart) return cyberwares;
    return cyberwares.filter((cw) =>
      cyberwareMatchesBodyPart(cw.type, selectedPart),
    );
  }, [cyberwares, selectedPart]);

  const handleSelectPart = (part: BodyPart) => {
    setSelectedPart((prev) => (prev === part ? null : part));
  };

  return (
    <section className={`${styles.wrap} ${pageStyles.glitchChrome}`}>
      <h3 className={pageStyles.attributesSection}>Chrome e Edges</h3>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Capacidade de implante</div>
          <strong
            className={styles.statValue}
            data-warn={capacity.remaining < 0 ? '1' : '0'}
          >
            {capacity.remaining}
          </strong>
          <div className={styles.statMeta}>
            usada {capacity.used} / base {capacity.baseCapacity}
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Edges (E)</div>
          <strong className={styles.statValue}>{edges}</strong>
          <div className={styles.statMeta}>
            Comprar no{' '}
            <Link href={`/cyberware?id=${characterData.id}`}>ripperdoc →</Link>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Cyberpsicose</div>
          <strong
            className={styles.statValue}
            data-warn={capacity.inCyberpsychosis ? '1' : '0'}
            data-ok={!capacity.inCyberpsychosis ? '1' : '0'}
          >
            {capacity.inCyberpsychosis
              ? `Ativa (sev. ${capacity.cyberpsychosisSeverity})`
              : 'Estável'}
          </strong>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.bodyCol}>
          <p className={styles.bodyHint}>
            Clique no corpo para filtrar o chrome daquela área. Amarelo =
            região com implante.
          </p>
          <div className={styles.bodyWrap}>
            <BodyFigure
              selectedPart={selectedPart}
              onSelectPart={handleSelectPart}
              installedParts={installedParts}
            />
          </div>
          <p className={styles.bodyPrompt}>
            {selectedPart
              ? BODY_PART_LABELS[selectedPart]
              : 'Toque numa região'}
          </p>
          {selectedPart && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSelectedPart(null)}
            >
              Limpar filtro
            </button>
          )}
          <div className={styles.legend}>
            <span className={styles.legendCyan}>livre</span>
            <span className={styles.legendYellow}>com chrome</span>
          </div>
        </aside>

        <div className={styles.listCol}>
          <div className={styles.listHead}>
            <h4 className={styles.listTitle}>Peças implantadas</h4>
            {selectedPart && (
              <span className={styles.filterTag}>
                filtro · {BODY_PART_LABELS[selectedPart]}
              </span>
            )}
          </div>

          {cyberwares.length === 0 ? (
            <p className={styles.empty}>Nenhuma peça de chrome implantada.</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>
              Sem chrome nesta região. Clique de novo para limpar o filtro.
            </p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((cw, index) => (
                <article
                  key={`${cw.name}-${index}`}
                  className={styles.card}
                  data-hot={
                    selectedPart &&
                    cyberwareMatchesBodyPart(cw.type, selectedPart)
                      ? '1'
                      : '0'
                  }
                >
                  <img
                    className={styles.cardImg}
                    src={cyberwareImageSrc(cw)}
                    alt={cw.name}
                    width={72}
                    height={72}
                  />
                  <div className={styles.cardName}>{cw.name}</div>
                  <div className={styles.cardMeta}>
                    {SLOT_LABELS[cw.type as CyberWareSlot] || cw.type} ·{' '}
                    {cw.edgeCost ?? '—'} E
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CyberCapacity;
