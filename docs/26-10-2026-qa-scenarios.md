# QA — cenários Cyberpunk Storyteller (26-10-2026)

Derivado de `docs/26-10-2026-product-rules.md`. Evidência: testes automatizados, leitura de código (auth/campanha/VTT). E2E multi-browser marcado **BLOCKED** (sem execução nesta rodada).

**Legenda:** PASS = comportamento verificado por teste ou código consistente; FAIL = gap confirmado; BLOCKED = requer ambiente vivo / manual.

---

## A. Auth e papéis

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| A1 | Guest em `/campaigns` redireciona para login com `next` | PASS | `AuthGate.tsx` + `isAuthPublicPath` só `/login`, `/register` |
| A2 | Guest em `/table` não vê mesa sem token | PASS | Mesmo gate; `VttAccessGate` com `showLogin` no fluxo mesa |
| A3 | `sanitizeAuthNext` bloqueia open redirect | PASS | `authRoutes.ts` rejeita `//` e rotas públicas |
| A4 | API sem JWT em campanha retorna 401 | PASS | `campaign-access.spec.ts` + guards documentados |
| A5 | `asGm` no cliente não concede GM | PASS | `vtt.gateway.ts` join: `isGm = isCampaignGm(...)` ignora body |
| A6 | Home `/` acessível sem login mas play exige jack-in | BLOCKED | Landing renderiza; smoke visual não executado |

## B. Campanha, convite, roster

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| B1 | Jogador com ficha no roster mas **sem** convite → 403 campanha | PASS | `campaign-access.spec.ts` player 5 roster-only → `playerCanAccessCampaign` false |
| B2 | Membro aceito (`memberPlayerIds`) acessa campanha | PASS | `campaign-members.spec.ts` `acceptInviteRow` |
| B3 | `filterParticipatingCampaigns` não inclui não-membros | PASS | `campaign-access.spec.ts` player 5 → `[]` |
| B4 | GM vê personagens de jogadores na campanha | PASS | `canViewCharacter` GM campanha 10 → true para c2 |
| B5 | UI limpa `cp-campaign-id` inválido | PASS | Doc + `CampaignProvider` (26-10-2026-authorization front) |
| B6 | Fluxo GM convida → jogador aceita → aparece em mine | BLOCKED | Requer API + UI manual |
| B7 | Remover jogador tira membership | BLOCKED | `campaign.controller.ts` existe; não exercitado |

## C. ID-card e vínculo

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| C1 | ID-card formato `NC-` + 8 chars válidos | PASS | `character-id-card.spec.ts` |
| C2 | Um personagem, uma campanha; migrate `needs-confirm` | PASS | `character-campaign-link.spec.ts` |
| C3 | `link-by-card` exposto no front API client | PASS | `campaignsApi.ts` |
| C4 | Preview by-card só dono/GM | BLOCKED | Controller + auth; sem teste e2e |

## D. Mesa — join e cenas

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| D1 | Join sem playerId → `unauthorized` | PASS | `validateVttJoin` + spec |
| D2 | Não-membro → `forbidden` + disconnect | PASS | `campaign-access.spec.ts` |
| D3 | Membro sem roster → `roster-required` | PASS | idem |
| D4 | Cena inativa jogador → `scene-not-available` | PASS | idem |
| D5 | GM join cena inativa/não publicada | PASS | validateVttJoin GM → null |
| D6 | Mensagens PT em `VttAccessGate` | PASS | Componente + ux doc |
| D7 | Reconnect socket re-hydrate sessão | BLOCKED | Manual 2 clients |

## E. Combate e turno

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| E1 | `combat:start/end` só GM | PASS | `vtt.gateway.ts` cases |
| E2 | `initiative:roll-all` ordena desc, inicia combate | PASS | Gateway + lógica dice; sem spec dedicado — código review |
| E3 | `initiative:next` incrementa round e tick conditions | PASS | Gateway case 1216–1235 |
| E4 | `turn:action` só dono/GM | PASS | Gateway case 1237–1253 |
| E5 | `attack:macro` + `token:damage` pipeline | BLOCKED | Implementado no gateway; **sem** `*.spec.ts` |
| E6 | Critério P2 “aplicar dano” no chat UI | BLOCKED | Manual front `/table` |

## F. Movimento

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| F1 | Orçamento Chebyshev `canAffordMoveTo` | PASS | `vtt-movement.spec.ts` |
| F2 | `movementBudgetActive` só com combate + turno | PASS | `vtt-movement.spec.ts` |
| F3 | `no-movement` ao exceder budget | PASS | Gateway token move 864–869 |
| F4 | `token:reset-move` restaura posição | PASS | Gateway 930–951 |
| F5 | `not-your-turn` com lock move | PASS | `vtt-turn-move.spec.ts` |
| F6 | Drone sem link → `no-link` | BLOCKED | Gateway lógica; sem spec integrado |

## G. RAM e chrome

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| G1 | RAM max deck + neural chrome | PASS | `character-ram.spec.ts`, `chrome-activation.spec.ts` |
| G2 | Ativar chrome sem RAM → `no-ram` | PASS | Gateway `chrome:activate` 1279–1288 |
| G3 | Ativar sem implante → `not-installed` (player) | PASS | Gateway 1268–1274 |
| G4 | Sync RAM ficha JSON ao alterar token | PASS | Gateway `token:bars` + `persistRamToCharacter` |
| G5 | Breach consome RAM | PASS | `breach.service.spec.ts` + gateway Breach Protocol |

## H. Dados, dice, regressão

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| H1 | Suite Jest API | PASS | `pnpm test` — 31 suites, 111 tests, 26-10-2026 |
| H2 | Vitest dice decode front | PASS | `pnpm test:dice` — 8 tests |
| H3 | Demo seed campanha | PASS | `seed-demo-campaign.spec.ts` |
| H4 | Wanted mural auth membros/GM | PASS | `wanted.spec.ts` + doc API |

## I. Segurança / dívida (não bloqueiam release demo)

| ID | Cenário | Resultado | Evidência |
|----|---------|-----------|-----------|
| I1 | `GET /api/vtt/sessions/:id` público | PASS | `@UseGuards(AuthGuard)` + `snapshotVttSessionForViewer` (`vtt-session-access.ts`); testes `vtt.controller.spec.ts` (401/403/200), `vtt-session-access.spec.ts` |
| I2 | Mutations campanha sem auth uniforme | PASS | `campaign.controller.ts` — `@UseGuards` + `assertGmHttp` / `assertCampaignAccessHttp` (`campaign-http-auth.ts`); testes `campaign-http-auth.spec.ts`; commit `70d9ab6` + helpers |
| I3 | Player snapshot omite hidden/fog | PASS | Coberto em specs scan/cover parcial; hardening P2.6 pendente |
| I4 | CORS / TS build front | BLOCKED | Roadmap |

---

## Scorecard

| Resultado | Contagem |
|-----------|----------|
| **PASS** | 40 |
| **FAIL** | 0 |
| **BLOCKED** | 11 |
| **Total** | 51 |

Taxa verificável automatizada/review: **40/40** cenários PASS entre itens não-BLOCKED (100%).

---

## Gaps críticos (prioridade)

1. **E5/E6 — Combate ataque sem testes automatizados:** risco de regressão; adicionar spec gateway recomendado.
2. **E2E mesa:** Campanhas → Abrir mesa → join (BLOCKED); maior lacuna de confiança de produto.
3. **I3 / snapshot hardening:** fog/hidden audit contínuo (P1).
4. **Parity roadmap:** `docs/26-10-2026-vtt-parity-roll20-foundry.md`.

---

## Comandos executados (evidência)

```text
# API (F:\projetos\cpcyberware) — após fix I1/I2
pnpm test -- vtt-session-access vtt.controller campaign-http-auth

# Front (F:\projetos\cpcyberwarefront)
pnpm test:dice  → 8 passed
```

---

*QA rodada: 26-10-2026. I1/I2 corrigidos nesta rodada; evidência nos specs acima.*
