# Decisões de design — Cyberpunk Storyteller

## Visual (Eixo B)
- Paleta: amarelo `#FCEE0A`, ciano `#2BE4EA`, magenta `#FF2A6D`, alerta `#FF003C`, fundos `#0A0A0C` / `#12141A`
- Fontes: Rajdhani (UI), Share Tech Mono (dados/HUD)
- Arte UI: SVG/CSS próprios — sem assets oficiais ripados no repo
- Mapa `/map`: embed de mapas interativos de terceiros (Piggyback oficial, MapGenie, NightCity.io, cyberpunkmap.app) com atribuição; overlay de campanha (distritos/gigs) é nosso

## Regras Storyteller
- Reserva: atributo + habilidade em d10; dificuldade padrão 6
- 10 = sucesso extra; 1s anulam sucessos; falha crítica se 0 sucessos e ≥1 um
- Capacidade chrome base 10; psicose se saldo &lt; 0
- Iniciativa: Dexterity + Alertness (+ mods chrome)
- Ações extras no turno: −1 sucesso por ação além da primeira
- Diagonal no grid: 1-2-1-2 (default)

## VTT
- Canvas: react-konva; realtime: Socket.IO + JWT
- Servidor = fonte da verdade; version monotônica por entidade
- Fog/visão filtrados no servidor
- Dice: RNG no servidor

## Campanha / identidade
- Street Cred 0–100; Breach Protocol grid 5×5 buffer 4–8 (original)
- Claude assist: opt-in via `ANTHROPIC_API_KEY`
- i18n: pt-BR default; en com stubs progressivos

## Local
- `DATABASE=json` → `data/local-db.json`
- Demo: `v@nightcity.local` / `arasaka`
- API local: `NEXT_PUBLIC_API_URL=http://localhost:4444`

## PWA
- `public/manifest.json` + `sw.js`; cache ficha/livro; não cacheia socket/API

## Conta
- `/account` — perfil, senha, opções locais, delete; nav **Conta** só logado — `docs/26-10-2026-account.md`

## Rotas entregues
- `/book` `/lore` `/map` `/gigs` `/shop` `/wiki` `/table` `/scanner` `/narrator` `/create` `/adventure` `/id-card` `/account`
