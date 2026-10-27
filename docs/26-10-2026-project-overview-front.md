# Cyberpunk Storyteller — visão geral do front (26-10-2026)

Next.js App Router (client-heavy), tema Night City HUD, token JWT em `localStorage` (`access_token`), API REST + Socket.IO para VTT.

## Mapa de rotas (principais)

| Rota | Papel |
|------|--------|
| `/login`, `/register` | Jack-in e registro (rotas públicas) |
| `/` | Home / landing deck (gadgets, terminal, CTAs) — **exige login** via `AuthGate` |
| `/campaigns` | Listar/criar campanhas, convites, GM vs player |
| `/campaigns/[id]` | Detalhe da campanha, roster, cenas VTT, invites |
| `/campaigns/[id]/wanted` | Wanted board (hydration dedicada) |
| `/campaigns/[id]/create-character` | Personagem amarrado à campanha |
| `/characters`, `/characters/create` | Fichas do jogador (com ou sem campanha) |
| `/sheet?id=` | Ficha Cyberpunk / Storyteller |
| `/account` | Perfil, senha, prefs locais, logout, delete |
| `/table` | VTT — board, combate, fog, tokens, chat/dice |
| `/narrator` | Ferramentas GM (nav oculta se não GM) |
| Lore / sandbox | `/cyberware`, `/catalog`, `/book`, `/lore`, `/map`, `/npcs`, `/gigs`, `/adventure`, `/news`, `/shop`, `/wiki`, `/achievements`, `/memorial`, `/id-card`, `/breach`, etc. |

Rotas internas / dev: `/test`, `/installation`, `/maps`, `/scanner`, `/rules`, `/create`.

## Auth gate

- **`AuthGate`** (`src/components/layout/Providers.tsx`): após mount, sem token → `router.replace('/login?next=<path+query encoded>')`.
- **Allowlist:** `/login`, `/register` (`src/lib/authRoutes.ts`).
- **`sanitizeAuthNext`:** bloqueia open redirect e loop em login/register; fallback `/campaigns`.
- Helpers: `authLoginHref`, `authRegisterHref` para links “Entrar” com retorno correto.
- Loading: shell `NC · UPLINK` enquanto verifica ou redireciona (sem flash de conteúdo privado).

Detalhe: [`26-10-2026-auth-gate.md`](./26-10-2026-auth-gate.md).

## Home (pós-login)

- **`PageFrame landing`** + **`HomeLanding`**: grid ciano, hero com CTAs (`HomeCtaRow` → campanhas, mesa, personagens, breach).
- Gadgets: terminal NetWatch, NCPD/MaxTac, tape N54, Neuralink, holomap distritos/Dogtown, cartão chrome 3D, clima NC, telemetria `HomeNetGraph`, propaganda, modal ICE, gags ambientes.
- Mesa na nav/home respeita **`useCanOpenTable`** (campanha ativa + roster).

Detalhe: [`26-10-2026-home-landing.md`](./26-10-2026-home-landing.md).

## AppShell / navegação

- **`AppShell`**: header sticky, nav primária (logado: campanhas, personagens, mesa, conta; deslogado na allowlist: login + atalhos com `?next=`).
- Nav secundária: cyberware, catálogo, lore, mapa, NPCs, gigs, etc.; `/narrator` só para GM.
- Controles: Heat, tema, motion, SFX, escala de fonte, PT/EN.
- Footer HUD em páginas não-landing.

## Campanhas, personagens, conta

- **Campanhas:** painéis GM/player, convites, skeleton loading, empty states por seção.
- **Personagens:** lista filtrada por `player_id`, ID-card, link para ficha; criar via `/characters/create`; **Minhas fichas** exibe mini cartão ID Night City (`CharacterIdCardPortrait`) com retrato (`characterImageSrc`) à esquerda de cada linha.
- **Conta:** `GET /api/account/me`, troca de senha, prefs locais (notify stub), zona de delete; atalho para personagens.

Docs relacionados: [`26-10-2026-account.md`](./26-10-2026-account.md), [`26-10-2026-ux-mesa-campanhas.md`](./26-10-2026-ux-mesa-campanhas.md).

## VTT `/table` — resumo do HUD

Estado grande em `src/app/table/page.tsx` + socket `vtt:*`.

| Camada | Componentes / função |
|--------|----------------------|
| Acesso | `VttAccessGate` — login, sem campanha, join error, boot loading, sem cena |
| Topo | `TableTopHud` — cena, papel GM/player, PREP/JAM, relógios/objetivos, visão safe, Kiroshi/NET |
| Board | Fog, layers, pan/zoom, tokens, aim, movimento por turno |
| Combate | `CombatHud`, `CombatHotbar`, `InitiativeTimeline`, `ReactionBar` |
| GM | `GmToolBar`, spawn list, notes, shortcuts |
| Runner | `RunnerPanel`, sheet popup, chrome trails, emotes |
| Flutuantes | `FloatingHudPanel` prefs, dice glitch, breach, phone/handout |

Plano e backlog: [`plano-mesa-vtt.md`](./plano-mesa-vtt.md), [`plano-mesa-p2-combate.md`](./plano-mesa-p2-combate.md).

## Stack e convenções

- UI: `HudPanel`, `HudButton`, CSS modules + tokens (`src/styles/`).
- i18n: `useTranslations`, `pt-BR` / `en`.
- Campanha ativa: `CampaignProvider` + `localStorage` campaign id.
- Mídia/API: `src/lib/api.ts`, `authHeaders()`.

## UX aplicado nesta revisão (26-10)

- `?next=` em links de login/registro (campanhas, conta).
- Conta: botão “Personagens” apontava para `/campaigns` — corrigido para `/characters`.
- Login: hint de destino pós-jack-in, autofocus no email.
- Nav: mesa “…“ enquanto `useCanOpenTable` carrega; scroll horizontal da nav no mobile.
- Registro: `aria-describedby` em erros de nome/email.
- Personagens: CTA “Novo” só com sessão; empty state dedicado.
- VTT gate: loading com `role="status"`.
- Logo auth → `/` (gate devolve login com `next=/` se necessário).

## Dívida UX conhecida

1. **Home exige login** — visitantes só veem `/login`/`/register`; landing deck não funciona como marketing público.
2. **Nav secundária longa** — muitos links “sandbox” sem agrupamento (drawer / mais…) no desktop.
3. **Duplicação sessão** — painéis “Faça login” em campanhas/personagens raramente aparecem com gate ativo; útil só se token expirar in-page.
4. **Mesa mobile** — board/HUD densos; plano P5 ergonomia/mobile ainda aberto.
5. **Contraste scanlines** — estética CP2077 vs WCAG em textos pequenos mono (cyan sobre preto).
6. **Registro → login manual** — após criar conta, redirect para login em ~900ms (sem auto jack-in).
7. **Notificações conta** — toggle local stub, sem backend.
8. **i18n parcial** — campanhas/personagens/VTT gates em PT fixo; nav/common/account bilíngue.
9. **Table nav desabilitada** — tooltip só no hover; sem link para campanhas a partir do item disabled.
10. **Auth logo → `/`** — usuário deslogado volta ao fluxo gate (esperado, mas pode surpreender).

## Comandos

```powershell
cd F:\projetos\cpcyberwarefront
npm run dev    # http://localhost:3000
npm run lint
npm test
```
