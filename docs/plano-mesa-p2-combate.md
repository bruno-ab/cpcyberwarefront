# Mesa P2 — Combate ao vivo (prompt de implementação)

Revisão 25-10-2026. Ajustado ao código atual de `cpcyberware` + `cpcyberwarefront`.

## Baseline (não reimplementar)

| Peça | Onde |
|------|------|
| Socket namespace `/vtt` | `cpcyberware/src/vtt/vtt.gateway.ts` |
| Intents via `vtt:intent` | mesmo gateway (`switch (body.type)`) |
| Estado + persistência | `vtt-session.store.ts` → coleção JSON `vtt_sessions` |
| Cenas por campanha | `vtt-scenes.service.ts` + `vtt_scenes`; UI `SceneBar` |
| Join / GM auth | `vtt:join` + `campaign.gmPlayerId` (JWT); room `session:*` + `campaign:*` |
| Dice server-side | `dice.service.ts` → `dice:roll` + emit `vtt:dice` |
| Roster / sheetSummary | `GET /api/campaigns/:id/roster` (attr/skills/vitality) |
| Tokens | `portraitUrl`, `bars.hp/hpMax/humanity?`, drag próprio, menu contexto |
| Camadas | `layers` + `layer:update` / `layer:active` |
| Front mesa | `src/app/table/page.tsx` + `FogCanvas`, `DiceGlitchOverlay`, `LayersPanel` |
| Chat card hoje | texto em `state.chat` (`kind: 'chat' \| 'dice'`) |

**Já existe (esqueleto frágil):** `initiative:set` / `initiative:next`, `token:bars`, botões “Iniciativa / Próximo turno” (ordem fake `10-i`), atalho de roll Dex+Alertness / Firearms **sem** amarrar combate.

**Risco de segurança (tratar em paralelo barato):** `snapshotFor` filtra tokens `hidden` e fog não revelado para players, mas o fog completo ainda fica no estado GM e walls são sempre enviados. Na P2: **nunca** mandar tokens fora de fog / hidden a players; auditar se algum intent devolve estado cru. RNG de dados já é servidor — manter.

---

## Objetivo da fatia

Uma luta jogável de ponta a ponta numa **cena** (`vtt_scenes`):

1. Abrir combate → todos rolam iniciativa (com chrome) → ordem viva  
2. Turno atual com ações (principal / movimento / reação)  
3. Macro de ataque com cartão no chat + “aplicar dano”  
4. Barras do token ↔ ficha (Vitalidade / Humanidade / Edges)  
5. Condições com duração em rodadas  
6. Distância na régua afetando acerto; templates de área listando alvos  

Fora desta fatia (próximos docs): visão dinâmica, áudio, ergonomia avançada, mobile.

---

## Modelo de estado (estender `VttSessionState`)

```ts
// acréscimos em vtt-session.store.ts
combat?: {
  active: boolean;
  round: number;
  phase: 'init' | 'turn' | 'end';
};

initiative: Array<{
  tokenId: string;
  name: string;
  score: number;          // total rolado
  dice?: number[];
  delayed?: boolean;
  holding?: boolean;      // prontidão
  characterId?: number | string;
}>;

turnIndex: number;

turnEconomy?: {
  tokenId: string;
  mainUsed: boolean;
  moveUsed: boolean;
  reactionUsed: boolean;
  extraActions: number;   // ações múltiplas → penalidade
};

conditions?: Array<{
  id: string;
  tokenId: string;
  kind: 'stunned' | 'burning' | 'hacked' | 'bleeding' | string;
  label: string;
  roundsLeft: number;
  icon?: string;
}>;

// token.bars expandido
bars?: {
  hp: number;
  hpMax: number;
  humanity?: number;
  humanityMax?: number;
  edges?: number;
};
```

Persistir combate/conditions/initiative junto com a cena em `vtt_sessions` (já no `persistSession`).

---

## Intents novos / estendidos (gateway)

Todas via `vtt:intent`. Autorização: GM ou dono do token onde fizer sentido. Respeitar `layerLocked('tokens')`.

### Iniciativa

| Intent | Quem | Comportamento |
|--------|------|----------------|
| `combat:start` | GM | `combat.active=true`, `round=1`, limpa delayed/holding |
| `combat:end` | GM | zera combate / economy / opcionalmente conditions |
| `initiative:roll-all` | GM | para cada token com `characterId` (ou NPC pool), server rola Dex+Alertness (+bônus chrome se houver no sheetSummary / flag Sandevistan); preenche `initiative` ordenada desc; `turnIndex=0`; emite `vtt:dice` por rolagem ou um batch |
| `initiative:roll-one` | dono/GM | reroll de um token |
| `initiative:reorder` | GM | payload `{ order: tokenId[] }` |
| `initiative:delay` | dono no turno / GM | marca `delayed`, sai da posição atual |
| `initiative:hold` | dono no turno / GM | `holding=true` (prontidão) |
| `initiative:next` | GM (ou dono do turno, config) | avança; se voltar ao topo → `round++` e tick de conditions (`roundsLeft--`, remover ≤0); reseta `turnEconomy` |
| `initiative:set` | GM | manter (override manual) |

**Chrome na iniciativa:** ler do roster/sheet no momento do roll (ex.: trait/`statBonuses` de Reflex/Dex, ou chrome name contendo Sandevistan). Se não houver dado, Dex+Alertness puro (já mapeado em `sheetPool` / `ATTR_OPTIONS` + `alertness`).

### Economia de turno

| Intent | Comportamento |
|--------|----------------|
| `turn:action` | `{ kind: 'main'\|'move'\|'reaction'\|'extra' }` — marca uso; se `extra`, aplica tag de penalidade no próximo ataque (−dice ou +dif, documentar na UI) |

Front: painel “Turno” só habilitado para o token do jogador / GM.

### Sync ficha ↔ token

| Intent | Comportamento |
|--------|----------------|
| `token:bars` | estender: aceita `humanity`, `edges`; se `characterId` e JSON DB, **escrever de volta** na ficha (`other_traits.vitality`, humanity, edges) via `JsonDbService` |
| `sheet:pull-bars` | GM/dono: lê ficha → atualiza token |
| `token:damage` | `{ tokenId, amount, type? }` — reduz hp (min 0); sync ficha; chat `kind:'combat'` |
| `token:heal` | espelho |

Importante: uma única fonte de verdade no servidor; front só mostra o snapshot.

### Macro de ataque

| Intent | Comportamento |
|--------|----------------|
| `attack:macro` | payload: `{ attackerTokenId, targetTokenId?, weaponId?\| weaponName?, skill?: 'firearms', rangeBand?, areaId? }` |

Pipeline server:

1. Resolve pool (attr+skill da ficha / NPC stub)  
2. Aplica modificadores: distância (curto 0 / médio −1 sucesso ou +1 dif / longo −2), condições (stunned…), extra action  
3. `DiceService.roll` (acerto)  
4. Se sucessos ≥ 1 (ou vs defesa futura): rola dano da arma (tabela simples seed ou inventário)  
5. Absorção stub (armadura 0 se não houver)  
6. Empurra `chat` com `kind: 'attack'` e payload estruturado  
7. Emite `vtt:attack` com o cartão  

Front: card no chat com botão **Aplicar dano ao alvo** → `token:damage` (só GM ou dono do ataque, uma vez — id de cartão anti-replay).

### Condições

| Intent | Comportamento |
|--------|----------------|
| `condition:add` | GM / efeito de ataque |
| `condition:remove` | GM / dono |
| tick automático | dentro de `initiative:next` ao mudar de rodada |

UI: ícone no token (`data-condition`), tooltip com `roundsLeft`.

### Distância e templates

| Intent / client | Comportamento |
|-----------------|---------------|
| Régua existente | além de `distance` u, mostrar banda `close\|medium\|long\|out` (ex.: 0–3 / 4–8 / 9–15 / >15) e cor de aviso |
| `attack:macro` | se `out`, rejeitar ou marcar falha automática |
| `template:place` | GM: `{ shape: 'circle'\|'cone'\|'line', ox, oy, radius\|length, angle? }` |
| `template:query` | retorna `tokenIds[]` cujas células intersectam |

Front: tool `template` na aba map/scene; highlight tokens hit.

### Cyberpsicose (gancho)

- No install de chrome (fora da mesa): reutilizar/`expor` `checkPsychosis` de `campaign.controller` / character use-case.  
- Na mesa: intent `psychosis:check` `{ characterId, stress: 'combat'\|'install' }` → roll + possível condition `hacked`/`stunned` ou delta humanity via `token:bars`.  
Escopo mínimo P2: botão GM “Teste de stress” + sync humanity.

---

## Front (`/table`)

1. **CombatHud** (sidebar ou barra sob SceneBar): rodada, turno atual, botões Iniciar / Próximo / Delay / Hold / Encerrar.  
2. Lista de iniciativa **arrastável** (GM) → `initiative:reorder`.  
3. Economia de turno (3 chips).  
4. Chat: render `kind === 'attack'` como card (não só texto).  
5. Token: barras HP + humanity; badges de condição; ring do turno (já existe `data-turn`).  
6. Régua: banda de alcance.  
7. Tool templates.  
8. Macros rápidas: manter Firearms; adicionar “Atacar alvo selecionado”.  

Não quebrar SceneBar / Layers / Fog.

---

## Testes

- API: `initiative:roll-all` ordena; `initiative:next` incrementa round e expira condition; `token:damage` sync JSON character; `attack:macro` emite card; player não recebe token `hidden`.  
- Front: smoke manual 2 browsers (GM + player) numa cena.  
- `pnpm test` nos specs VTT; `pnpm tsc` API; front sem erros novos na pasta `table`/`vtt`.

---

## Ordem de implementação (commits sugeridos)

1. **P2.1 Estado + iniciativa real** — model combat/initiative; `combat:*`; `initiative:roll-all/reorder/delay/hold`; UI CombatHud  
2. **P2.2 Economia de turno + conditions** — `turn:action`; conditions + tick  
3. **P2.3 Sync bars + damage/heal** — ficha JSON ↔ token  
4. **P2.4 Attack macro + chat card** — `attack:macro` / `vtt:attack`  
5. **P2.5 Range bands + templates** — régua + área  
6. **P2.6 Hardening snapshot** — revisar `snapshotFor` (tokens sob fog, strips); reconexão já re-`join` com hydrate  

---

## Critério de pronto

Numa cena ativa, GM clica **Iniciar combate** → todos os tokens do roster têm iniciativa rolada → highlight do turno → player no turno usa macro Firearms num alvo em alcance → card no chat → **Aplicar dano** baixa HP do token e Vitalidade na ficha → **Próximo turno** avança e condições expiram → **Encerrar combate**.

---

## Explicitamente NÃO nesta fatia

- Visão por token / LoS / luzes dinâmicas / portas (→ `plano-mesa-p3-visao.md`)  
- Áudio adaptativo / cutscene / “olhem aqui”  
- Multiselect, undo, biblioteca de tokens, whisper completo (whisper mínimo pode entrar se sobrar tempo: `chat:message` com `channel: 'gm'`)  
- Auth JWT em todas as rotas REST / CORS / Playwright e2e (roadmap global)

---

## Prompt curto para o agente

```
Implemente Mesa P2 combate ao vivo conforme docs/plano-mesa-p2-combate.md.
Repositórios: cpcyberware (gateway/store/scenes) + cpcyberwarefront (/table).
Estenda VttSessionState; adicione intents listados; UI CombatHud + attack cards.
Não refaça P1 (cenas/camadas/fog/bg). Persista em vtt_sessions por cena.
Ao final: testes VTT, tsc API, commit/push nos dois repos.
Comece por P2.1 (iniciativa real + CombatHud).
```
