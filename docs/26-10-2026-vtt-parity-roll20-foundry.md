# Cyberpunk Storyteller — VTT parity vs Roll20 & Foundry VTT

**Data:** 26-10-2026  
**Escopo:** Honest comparison for a **niche** homebrew stack — Storyteller d10, Night City sandbox, chrome/RAM/NET — not a generic Foundry clone.

**API pointer:** `cpcyberware/docs/26-10-2026-vtt-parity-roll20-foundry.md`

---

## 1. What Storyteller already has

### Platform & auth

- JWT jack-in; campaign membership via accepted invite (not roster-only).
- GM derived from `gmPlayerId` only (client cannot escalate).
- JSON-mode API with campaigns, characters, media, demo seed.

### Campaign layer (beyond classic VTT)

- Heat (police / corpo / media), Street Cred, eddies, district control.
- Gigs, shop buys tied to campaign pool, N54 news from recaps/minigames.
- Wiki, handouts, wanted board, memorial, achievements.
- ID-card linking, roster migration, export/import bundle (GM).

### Characters & rules

- Full Cyberpunk / Storyteller sheets (stats, skills, chrome, RAM, humanity).
- Server-side dice (`DiceService`, `dice:roll` intent).
- Catalog cyberware, NPC sheets, portraits, phone/handout UX stubs.

### VTT core (`/table`, Socket.IO `/vtt`)

- Multi-scene per campaign (`vtt_scenes`), activate/switch, prep **publish** flag.
- Map: background upload, Universal VTT import, pan/zoom, grid, walls, lights (data).
- Fog of war (brush, reveal/hide), layers (tokens / GM lock).
- Tokens: move, portraits, hidden, ownership, turn highlight, emotes.
- Combat: initiative roll-all, rounds, turn economy, movement budget (Chebyshev).
- Attack macro + damage pipeline (gateway); conditions, threat clocks, objectives.
- Chrome activate, RAM sync to sheet, Breach Protocol (table + standalone HTTP).
- NET: devices, quickhacks, scan tiers, drones/signal, Kiroshi AR on tokens.
- Chat, handouts, radio stub, GM notes, safe vision mode, scene GM notes.
- **HTTP session read:** `GET /api/vtt/sessions/:id` with JWT + membership + `snapshotFor`.

### Front UX

- Auth gate, campaign hub, VTT access gate (PT errors), SceneBar, combat HUD, GM toolbar.
- Landing deck gadgets (breach, terminal, heat strip) — play routes require login.

---

## 2. Gap tables

Legend: **Yes** = usable today · **Partial** = prototype or GM-only · **No** · **N/A** = out of product vision  
Priority: **P0** ship blocker · **P1** solid CP VTT · **P2** parity / polish · **P3** long tail

### Core table

| Feature | Storyteller | Roll20 | Foundry | Priority |
|--------|-------------|--------|---------|----------|
| Grid map + tokens | Yes | Yes | Yes | — |
| Fog of war | Yes (server filter partial) | Yes | Yes (strong) | P1 hardening |
| Dynamic LoS / vision | Partial (walls exist, no raycast) | Partial (DL) | Yes | P2 |
| Lighting (dynamic) | Partial (static lights data) | Partial | Yes | P3 |
| Multi-scene / pages | Yes | Yes | Yes | — |
| Drawing / freehand | No | Yes | Yes (modules) | P2 |
| Measurement / templates | Partial (ruler, area attack backlog) | Yes | Yes | P1 |
| Character sheets | Yes (CP homebrew) | Generic sheets | System modules | N/A |
| Automated sheet rolls | Partial (pools, macros) | Yes | Yes | P1 |
| Compendiums / drag-drop actors | Partial (NPC catalog) | Yes | Yes | P2 |
| Macro bar / saved actions | Partial | Yes | Yes | P2 |
| Chat + rolls log | Yes | Yes | Yes | — |
| Whisper / blind GM roll | Partial | Yes | Yes | P2 |
| Handouts / journal | Partial | Yes | Yes | P1 |
| Audio / playlists | Stub | Yes (built-in) | Yes (modules) | P2 |
| Video / voice | No (external Discord) | Yes | No native | P3 |
| Marketplace / modules | No | Yes | Yes | N/A |
| Self-host / export world | Partial (JSON backup) | Cloud | Yes | P2 |
| Mobile UX | Partial | Partial | Partial | P2 |
| 3D / Foundry-level FX | No | No | Optional modules | P3 |

### Cyberpunk-specific (Storyteller differentiators)

| Feature | Storyteller | Roll20 | Foundry | Priority |
|--------|-------------|--------|---------|----------|
| Heat / N54 news loop | Yes | No | Needs homebrew | — |
| RAM / chrome on table | Yes | No | Needs system | P1 polish |
| Breach minigame ↔ campaign | Partial | No | Homebrew | P1 |
| NET quickhacks / devices | Yes (gateway) | No | Homebrew | P1 tests |
| Kiroshi AR intel on tokens | Yes | No | Homebrew | P2 |
| ID-card / one-campaign character | Yes | No | Homebrew | — |
| Wanted / memorial / gigs | Yes | No | Homebrew | P2 UX |

### Security & ops (recent QA focus)

| Feature | Storyteller | Roll20 | Foundry | Priority |
|--------|-------------|--------|---------|----------|
| Auth on REST mutations | Yes (26-10 hardening) | Yes | Yes | P0 done |
| Auth on session HTTP | Yes (26-10) | Yes | Yes | P0 done |
| Player snapshot filtering | Yes (`snapshotFor`) | Yes | Yes | P1 audit |
| E2E / CI Playwright | No | N/A | Community | P1 |
| CORS / TS strict build | Partial | N/A | N/A | P1 |

---

## 3. Improvements needed (correctness)

### P0 — must work for trustworthy demo

1. **Snapshot hardening** — audit fog/hidden tokens/devices on every emit path (HTTP + WS).
2. **Combat regression tests** — gateway specs for `attack:macro`, `token:damage`, initiative.
3. **CORS + env secrets** — explicit origins; no default JWT in prod.
4. **Front TS build** — remove `ignoreBuildErrors`; fix blocking types.

### P1 — solid Cyberpunk VTT loop

1. **E2E smoke** — login → campaign → join table (2 browsers).
2. **Attack / damage UI** — chat cards, apply damage from macro results (P2 doc).
3. **Breach / minigames** — tie standalone HTTP to campaign context or rate-limit.
4. **Handout → phone** — push item to character agent from GM.
5. **Reconnect story** — document + test socket re-join snapshot parity with HTTP GET session.
6. **GM/player scene rules** — keep HTTP scenes + WS join aligned (already shared membership).

### P2 — parity feel (not clone)

1. Area templates, cover preview polish, psychosis on table.
2. Whisper channels, `/gmroll`, macro library per character.
3. Undo/redo, token library, multiselect.
4. Dynamic LoS MVP (portals/doors), not full Foundry lighting.
5. Audio per scene (URLs + GM trigger).
6. i18n cleanup (PT-first).

### P3 — vision

1. Adaptive music, cutscene mode, rich presence.
2. Module-like extension API (unlikely; stay monolith + JSON).
3. Native apps.

---

## 4. Suggested roadmap

| Quarter slice | Theme | Deliverables |
|---------------|--------|--------------|
| **Now (Oct 26)** | Security QA | I1 session JWT + snapshot; I2 campaign mutation auth; docs + Jest |
| **+2 weeks** | Trust | Combat gateway specs; snapshot audit checklist; Playwright smoke |
| **+1 month** | Combat UX | Attack cards, damage apply, conditions UI, movement UX mobile |
| **+6 weeks** | Night City loop | Breach→heat, handout→phone, recap→news from table events |
| **+3 months** | Immersion | LoS MVP, audio URLs, whisper/macros |
| **Ongoing** | Content | NPC/portraits, gigs, lore book — not VTT engine work |

---

## 5. Positioning statement

Roll20 optimizes for **generic tabletop + marketplace**. Foundry optimizes for **self-hosted moddable engines**. **Cyberpunk Storyteller** optimizes for **Night City campaign state + Storyteller d10 + chrome/NET at the table**. Matching Foundry’s module ecosystem or Roll20’s sheet library is explicitly **not** the goal; matching **trust, combat loop, and CP identity** is.

---

*Evidence: API Jest (`vtt-session-access.spec.ts`, `vtt.controller.spec.ts`, `campaign-http-auth.spec.ts`), docs `26-10-2026-qa-scenarios.md`, `plano-mesa-vtt.md`.*
