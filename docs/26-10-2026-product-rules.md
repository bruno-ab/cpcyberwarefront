# Cyberpunk Storyteller — regras de produto (26-10-2026)

Documento único de referência para PM, QA e implementação. Detalhes de API: `cpcyberware/docs/26-10-2026-authorization.md`. UX mesa/campanhas: `docs/26-10-2026-ux-mesa-campanhas.md`, `docs/26-10-2026-gm-player.md`.

---

## 1. Papéis de usuário

| Papel | Definição | App (front) | API / VTT |
|-------|-----------|-------------|-----------|
| **Convidado (guest)** | Sem JWT válido | Bloqueado: `AuthGate` redireciona para `/login?next=…` exceto `/login` e `/register`. Home e rotas lore existem no router, mas não renderizam conteúdo privado sem token. | `401` em rotas com `AuthGuard`; WebSocket `vtt:join` → `unauthorized` + disconnect se `playerId` inválido. |
| **Jogador (player)** | Conta com `playerId`; membro de campanha via convite aceito (`memberPlayerIds`) ou dono da campanha como GM não se aplica aqui | Vê campanhas em `GET /api/campaigns/mine` (participação). Mesa, ficha e roster scoped ao que a API permite. Nav **Mesa** desabilitada sem campanha em `mine`. | Membro ≠ roster: ficha em `characterIds` **não** abre campanha. Mesa exige ficha **própria** no roster (`roster-required`). Cenas: só **ativa + publicada** (snapshot reduzido se não). |
| **Narrador (GM)** | `playerId === campaign.gmPlayerId` | `/narrator` e affordances GM só quando a conta narra (`asGm` no cliente é **ignorado** no servidor). Toolbar GM na mesa via `isGm` real do socket. | Roster completo, todas as cenas, `vtt:scene-activate`, CRUD cenas, intents GM (`combat:*`, `initiative:roll-all`, etc.). `POST /api/gm/assist` exige JWT + narrador quando `campaignId` informado. |

**Demo:** `pnpm seed:demo` no backend — `gm@test.local` / `player@test.local` (ver seed).

---

## 2. Campanha: convite → ID-card → mesa

### 2.1 Entrada na campanha

1. GM cria convite (`POST /api/campaigns/:id/invites` ou fluxo na UI **Convites / Jogadores**).
2. Jogador vê convites pendentes (`GET /api/campaigns/invites/mine`) e aceita (`POST …/accept`).
3. Aceite adiciona `playerId` a `memberPlayerIds`. Até lá, HTTP 403 / `forbidden` no join VTT.

**Regra de ouro:** membership vem do convite (ou ser GM), não de ter personagem listado no roster de outra pessoa.

### 2.2 Personagem e ID-card (`NC-` + 8 chars)

- Gerado no create; imutável; backfill no boot JSON.
- Ficha **global:** `POST /api/characters` sem `campaignId` — lista em `/characters`.
- Ficha **de campanha:** create com `campaignId` ou atalho `/campaigns/:id/create-character` (exige membership).
- **Vincular à campanha:**
  - GM: `POST /api/campaigns/:id/roster` com `{ characterId, confirmMigration? }`.
  - GM: `POST /api/campaigns/:id/link-by-card` com `{ idCard, confirmMigration? }`.
- **Uma campanha por personagem:** migrar exige confirmação (`needs-confirm`).

Preview: `GET /api/characters/by-card/:code` (dono ou narrador com acesso).

### 2.3 Abrir a mesa (VTT)

Pré-requisitos cumulativos para **jogador**:

1. Login (JWT no handshake `/vtt`).
2. Membro da campanha.
3. Personagem **próprio** no roster.
4. Cena ativa da campanha **publicada** (GM pode entrar em cena inativa/não publicada).

Front: `VttAccessGate` traduz `roster-required`, `scene-not-available`, `forbidden`, `unauthorized` para PT + links Campanhas / detalhe / login. `CampaignProvider` limpa `cp-campaign-id` inválido.

---

## 3. Mesa — combate, movimento, RAM e chrome (comportamento esperado)

Implementação principal: `cpcyberware/src/vtt/vtt.gateway.ts`, helpers `vtt-movement.helpers.ts`, `character-ram.ts`, `chrome-activation.ts`.

### 3.1 Combate e turno

| Ação | Quem | Comportamento |
|------|------|----------------|
| `combat:start` / `combat:end` | GM | Liga/desliga combate; encerrar zera economia de turno e movimento por turno. |
| `combat:lock-move` | GM | `rules.tokenMoveOnTurnOnly` — restringe movimento de token ao dono no turno atual. |
| `initiative:roll-all` | GM | Rola iniciativa (Dex+Alertness + bônus de ficha/chrome) para tokens visíveis no `floor`; ordena; inicia combate fase `turn`. |
| `initiative:set` / `reorder` / `delay` / `hold` / `next` | GM ou dono do token onde aplicável | Ordem viva; `next` incrementa rodada no wrap, tick de `conditions`, avanço opcional de threat clocks. |
| `turn:action` | Dono do token ou GM | Marca main / move / reaction / extra na economia do turno. |

**Ataque:** `attack:macro` (servidor: pool, banda de alcance, dado, cartão no chat); `token:damage` / `token:heal` com sync opcional para JSON da ficha quando `characterId` presente.

**Intencional hoje:** GM conduz `initiative:next` (não auto-pass para jogador). Condições e templates de área existem no modelo; UX completa P2 ainda parcial (ver dívida).

### 3.2 Movimento

- Drag de token: dono, controlador ou GM; respeita `not-your-turn` se regra de turno ativa.
- Com combate ativo e orçamento de movimento (`turnMovement`): Chebyshev a partir da posição inicial do turno; exceder → `no-movement`.
- `token:reset-move` reverte posição e restaura `remaining` no turno.
- Velocidade máxima derivada da ficha (`character-speed`) + bônus passivos de chrome catalog.
- Drones/summons: piloto não-GM exige link/sinal/bateria; movimento drena bateria; `no-link` emite `vtt:drone`.
- Sandevistan ativo: trilha FX `sandevistan-trail` no movimento.

### 3.3 RAM (NET / deck)

- **Máximo:** buffer neural (chrome ativável no catálogo) + base do deck (`RAM_DECK_BASE` se houver netdeck) + bônus de ficha.
- Token na mesa: `bars.ram` / `bars.ramMax`; sync para ficha JSON ao alterar RAM via intents.
- **Gastos típicos:** ativação de chrome (`chrome:activate`), hacks NET, Breach Protocol (`BREACH_PROTOCOL_RAM_COST`), recarga via intent dedicado (mensagem no chat).
- GM tratado como tendo netdeck para validações de runner em alguns fluxos NET.

### 3.4 Chrome (implantes ativáveis)

- Intent `chrome:activate` com `{ tokenId, chrome }` — resolve pelo nome instalado na ficha (`installedChromeNames`).
- Jogador sem implante: `not-installed` (GM pode forçar label para teste).
- RAM insuficiente: `no-ram` + evento `vtt:chrome`.
- Efeitos: auras (ex. `sandevistan`), chat `kind: 'chrome'`, custos do catálogo (`activationRamCost`).
- Iniciativa e movimento leem bônus passivos/ativos via roster/sheet no roll (`rollInitiativeForToken`, `chromeBonusesForCharacter`).

### 3.5 Visibilidade (fog / hidden)

- `snapshotFor` filtra tokens `hidden` e fog não revelado para players.
- **Dívida conhecida:** estado GM ainda carrega fog/walls completos; auditar vazamento em intents (roadmap P2.6 / segurança).

---

## 4. Intencional vs dívida técnica

### Intencional (produto atual)

- Guest **não** navega app autenticado; jack-in obrigatório.
- Convite aceito como única porta de membership (exceto GM).
- ID-card como identidade estável cross-campanha; migração explícita.
- GM derivado só do JWT + `gmPlayerId`; cliente não escala privilégio.
- RNG de dados no servidor (`DiceService`, `dice:roll`).
- Demo seed manual (`seed:demo`); auto-merge desligado por padrão (`AUTO_DEMO_SEED=1`).
- `/characters` hub global; campanha mantém atalhos de roster/create.
- Landing `/` rica em lore/minigames; rotas de play exigem login.
- Combate “mesa ao vivo” com iniciativa real, economia de turno, movimento orçado, chrome/RAM/NET — escopo além do doc P2 mínimo em várias áreas (drones, breach, cover).

### Dívida / fora do escopo imediato

| Área | Notas |
|------|--------|
| **Auth REST** | Campanha/VTT session HTTP com JWT + membership (26-10); breach/dice HTTP ainda públicos. |
| **Minigames HTTP** | Breach/dice roll públicos (sem campanha). |
| **E2E** | Sem Playwright no CI do front; smoke manual 2 browsers. |
| **P2 combate doc** | Attack cards UI, templates de área, psychosis na mesa, snapshot hardening — parcial vs `plano-mesa-p2-combate.md`. |
| **P3 visão** | LoS dinâmico, áudio adaptativo, portas — não nesta fatia. |
| **Build TS front** | `typescript.ignoreBuildErrors` (roadmap). |
| **i18n** | Mistura PT/EN na nav e strings legadas. |
| **Toasts 403 globais** | Só mesa/campanha bem tratadas; outras rotas genéricas. |

---

## 5. Referências cruzadas

| Tema | Front | API |
|------|-------|-----|
| Auth gate | `AuthGate.tsx`, `26-10-2026-auth-gate.md` | `auth.guard.ts`, login JWT |
| Campanha / roster | `CampaignProvider`, `campaigns/[id]` | `campaign-access.ts`, `campaign.controller.ts` |
| Mesa | `/table`, `VttAccessGate` | `vtt.gateway.ts`, `vtt-scenes.service.ts` |
| Combate (visão) | `plano-mesa-p2-combate.md` | intents em `vtt.gateway.ts` |
| RAM / chrome | UI barras token / sheet | `character-ram.ts`, `chrome-activation.ts`, catálogo cyberware |

---

*Revisão: 26-10-2026 — alinhado aos testes Jest/Vitest e docs 26-10 do monorepo.*
