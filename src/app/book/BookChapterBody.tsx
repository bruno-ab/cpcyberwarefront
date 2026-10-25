'use client';

import styles from './book.module.css';

type LoreInsert = {
  kind: 'quote' | 'news' | 'testimony' | 'email' | 'scene' | 'shard';
  title?: string;
  attribution?: string;
  body: string;
};

type Props = {
  body: string;
  inserts?: LoreInsert[];
};

const KIND_LABEL: Record<LoreInsert['kind'], string> = {
  quote: 'Citação',
  news: 'Notícia',
  testimony: 'Depoimento',
  email: 'Email corp',
  scene: 'Cena',
  shard: 'Shard',
};

type Block =
  | { type: 'h2' | 'h3' | 'h4' | 'p' | 'table' | 'empty'; text: string }
  | { type: 'ul'; items: string[] };

/** Renders markdown-ish rule body + styled lore inserts. */
export const BookChapterBody = ({ body, inserts }: Props) => {
  const lines = (body || '').split('\n');
  const blocks: Block[] = [];

  let tableBuf: string[] = [];
  let listBuf: string[] = [];

  const flushTable = () => {
    if (!tableBuf.length) return;
    blocks.push({ type: 'table', text: tableBuf.join('\n') });
    tableBuf = [];
  };

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push({ type: 'ul', items: [...listBuf] });
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw;
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushTable();
      listBuf.push(bullet[1]);
      continue;
    }
    flushList();

    if (line.trim().startsWith('|')) {
      tableBuf.push(line);
      continue;
    }
    flushTable();

    if (/^####\s+/.test(line)) {
      blocks.push({ type: 'h4', text: line.replace(/^####\s+/, '') });
    } else if (/^###\s+/.test(line)) {
      blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '') });
    } else if (/^##\s+/.test(line)) {
      blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '') });
    } else if (!line.trim()) {
      blocks.push({ type: 'empty', text: '' });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  }
  flushList();
  flushTable();

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className={styles.code}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={styles.article}>
      {blocks.map((b, i) => {
        if (b.type === 'empty') return <div key={i} className={styles.spacer} />;
        if (b.type === 'h2')
          return (
            <h2 key={i} className={styles.h2}>
              {b.text}
            </h2>
          );
        if (b.type === 'h3')
          return (
            <h3 key={i} className={styles.h3}>
              {b.text}
            </h3>
          );
        if (b.type === 'h4')
          return (
            <h4 key={i} className={styles.h4}>
              {b.text}
            </h4>
          );
        if (b.type === 'ul') {
          return (
            <ul key={i} className={styles.list}>
              {b.items.map((item, li) => (
                <li key={li}>{formatInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'table') {
          const rows = b.text
            .split('\n')
            .filter((r) => r.trim() && !/^\|\s*-+/.test(r));
          return (
            <table key={i} className={styles.table}>
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row
                    .split('|')
                    .map((c) => c.trim())
                    .filter(Boolean);
                  return (
                    <tr key={ri}>
                      {cells.map((cell, ci) =>
                        ri === 0 ? (
                          <th key={ci}>{formatInline(cell)}</th>
                        ) : (
                          <td key={ci}>{formatInline(cell)}</td>
                        ),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        }
        return (
          <p key={i} className={styles.p}>
            {formatInline(b.text)}
          </p>
        );
      })}

      {(inserts || []).length > 0 && (
        <section className={styles.inserts} aria-label="Lore">
          <h2 className={styles.h2}>Arquivo de rua</h2>
          {inserts!.map((ins, i) => (
            <article
              key={`${ins.kind}-${i}`}
              className={styles.insert}
              data-kind={ins.kind}
            >
              <header>
                <span className={styles.kind}>{KIND_LABEL[ins.kind]}</span>
                {ins.title && <strong>{ins.title}</strong>}
                {ins.attribution && <em>{ins.attribution}</em>}
              </header>
              <p>{ins.body}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default BookChapterBody;
