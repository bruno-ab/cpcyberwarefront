# Plano de melhoria — Mesa `/table`

Revisão 25-10-2026 (pós-cenas/camadas).

## Já entregue (P0 + P1)

- Chat, dice glitch/SFX, pool attr+skill, JWT/GM via `gmPlayerId`
- Cenas (`vtt_scenes`) — cada uma com mesa isolada
- Background upload, FogCanvas + brush, walls, pan/zoom/régua
- Tokens (portrait, seleção, turno highlight, menu), camadas VIS/LCK
- Persistência `vtt_sessions`; handout SMS; Breach; braindance log; rádio stub

Docs: `docs/25-10-2026.md`

## Roadmap priorizado (visão produto)

| Ordem | Bloco | Por quê |
|-------|--------|---------|
| 1 | **Combate ao vivo** | Sem luta a mesa não fecha o loop de RPG |
| 2 | **Segurança de visibilidade + reconexão** | Barato agora, caro depois |
| 3 | Visão / paredes / portas / luz | Walls já existem; LoS é o salto de imersão |
| 4 | Áudio + efeitos + handout→telefone | Alto ganho / baixo–médio esforço |
| 5 | Ergonomia + mobile | Qualidade de vida |
| 6 | Integrações campanha (breach→heat, loot, recap) | Fecha o sandbox |

**Imersão/custo:** áudio, efeitos de cena e handout→Agent rendem mais cedo; visão dinâmica é o mais caro e o que mais “parece Night City”.

## P2 — Combate ao vivo ← **agora**

Spec completa (intents, estado, UI, commits):

→ **[`plano-mesa-p2-combate.md`](./plano-mesa-p2-combate.md)**

Resumo: iniciativa real (Dex+Alertness+chrome), economia de turno, sync Vitalidade/Humanidade/Edges, macro ataque + card no chat, condições, alcance na régua, templates de área, hardening de `snapshotFor`.

## P3 — Visão e ambiente

→ **[`plano-mesa-p3-visao.md`](./plano-mesa-p3-visao.md)** (rascunho)

## P4 — Som e narrativa

Áudio por cena, música adaptativa, cutscene GM, handout→`SheetPhone`, braindance scrubber, “olhem aqui” / ping.

## P5 — Ergonomia

Multiselect, undo/redo, biblioteca de tokens, whisper/`/gmroll`, macros salvas, presença rica, mobile, screen do GM.

## P6 — Campanha ↔ mesa

Breach→`minigame-result`, heat em encontros, loot/eddies, recap→N54.

## Fundação técnica (contínuo)

- Visibilidade só no servidor (auditar fog/tokens)
- RNG só no servidor (`DiceService` + `crypto.randomInt` — já)
- Reconexão com snapshot completo no `vtt:join`
- JWT em mutações REST, CORS, rate limit socket
- Upload validado; limpar TS / `ignoreBuildErrors`; e2e Playwright; README; perf 100 tokens

## Entrega 25-10 (P2.1 + Night City MVP)

- Combate: `initiative:roll-all`, delay/hold/next+round, turn economy, `attack:macro`, `token:damage`, CombatHud
- Scan / NET / devices / floors / prep publish / Sandevistan FX / threat clocks / objectives / emotes / roll:request / Safe vision / GM notes
- Backlog completo: `plano-mesa-night-city.md`

## Fora de escopo longo prazo

App nativo; lighting “Foundry completo” na primeira passada de visão (MVP LoS + portas + luz pontual).
