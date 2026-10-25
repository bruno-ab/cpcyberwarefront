# Plano de melhoria — Mesa `/table`

Revisão 25-10-2026. Baseline: chat/dice glitch, sessão `campaign-{id}`, GM via `gmPlayerId`, roster spawn, fog/walls/pan.

## Já entregue

- Chat usável + dice glitch/SFX + pool attr+skill
- Sessão por campanha + JWT; spawn roster; fog brush/fill; walls; handout SMS; Breach; braindance log

## P1 — Mapa e tokens (próxima fatia)

1. Background de mapa (`backgroundUrl` + upload GM); grid por cima
2. Fog performático (canvas/bitmap; brush raio; hide/reveal)
3. Tokens melhores (portrait, menu contexto, highlight turno)
4. Seleção clara + drag só do próprio token (player)
5. Persistência no JSON DB por `campaignId` (sobrevive restart da API)

## P2 — Combate e ficha ao vivo

1. Iniciativa rolada (Dex+Alertness), ordenar, passar turno
2. Barras Vitalidade/Humanidade sync ficha ↔ token
3. Macro de ataque (Firearms / arma do inventário)
4. Whisper / canais (all | gm | player↔GM)
5. Presença rica (avatar, personagem, “rolando”)

## P3 — Cena e integrações

1. Handouts → telefone da ficha (`SheetPhone` / N54)
2. Breach na mesa → `minigame-result` (heat/XP)
3. Rádio com stations + SFX
4. Braindance scrubber (play/pause na timeline)
5. Lobby: seletor de campanha + link `?campaign=`

## P4 — Polish + mobile

1. HUD scanlines / ripperdoc iniciativa
2. Mobile: accordion sidebar, pinch zoom, touch drag
3. `aria-live` nos rolls; limpar leftovers demo (`10-i`, SMS genérico)

## Fatia recomendada agora

**P1 entregue (25-10-2026)** — background + tokens UI + persistência + camadas.

- Front: imagem sob o grid; menu no token; FogCanvas; painel Camadas (VIS/LCK/ativa)
- API: coleção `vtt_sessions`; persist no `save` / load no `getOrCreate`; `layer:*`
- Próxima fatia sugerida: **P2** (iniciativa rolada, barras sync, whisper)

## Fora de escopo

- Vision cones / lighting estilo Foundry
- App nativo
- Auth JWT em todas as rotas REST (roadmap global separado)
