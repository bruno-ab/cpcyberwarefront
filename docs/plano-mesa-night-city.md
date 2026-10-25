# Mesa Night City — backlog de imersão

Revisão 25-10-2026. Visão completa; **MVP fundação** marcado com ✅ nesta entrega.

## Mecânicas Night City

| Item | Status |
|------|--------|
| Modo Scan (Kiroshi) | ✅ overlay + intent `view:mode` / highlight devices+tokens |
| Camada NET | ✅ `viewMode=net` filtra devices hackeáveis + links |
| Câmeras PiP | ⏳ device tipo camera + FOV stub; PiP completo depois |
| Drones / invocações | ⏳ token `kind:'drone'` no modelo; UI parcial |
| Sandevistan | ✅ `chrome:activate` → turno extra + FX client + humanity cost stub |
| Rádio / jammer / canais | ⏳ `radio:set` existe; jammer/whisper depois |

## Mapa

| Item | Status |
|------|--------|
| Andares | ✅ `floor` em tokens/devices + seletor |
| Cobertura via walls | ✅ util + banda na régua / mod ataque |
| Zonas (fogo/gás/…) | ✅ `zones[]` + tick no turno |
| Prefabs / .dd2vtt | ⏳ backlog |
| Prep mode GM | ✅ `published` — players veem cena vazia até publicar |

## Combate visual / HUD

| Item | Status |
|------|--------|
| Iniciativa real + CombatHud | ✅ P2.1 |
| Floating damage / mira / cinecam | ⏳ |
| Auras (psycho / sandy / hacked) | ✅ classes CSS + conditions stub |
| HUD humanidade degradada | ✅ `data-humanity` no layout mesa |
| Pedido de rolagem GM | ✅ `roll:request` → janela no player |
| Objetivos de cena | ✅ `objectives[]` |
| Loot compartilhado | ⏳ |

## Tempo / a11y / ops / GM QoL

| Item | Status |
|------|--------|
| Threat clocks | ✅ |
| Safe flash / a11y | ✅ `data-safe-vision` |
| Emotes | ✅ `chat:emote` |
| Notas GM cena/token | ✅ `gmNotes` stripados do snapshot player |
| Snapshots / audit / AI scene gen | ⏳ |

Prompt de combate detalhado: `plano-mesa-p2-combate.md`.
