# 26-10-2026 — Hydration `/characters` + Mural de Procurados

## Hydration em `/characters`

**Sintoma:** `Text content does not match server-rendered HTML` — servidor `"Sessão"`, cliente `"Minhas fichas"` no `HudPanel`.

**Causa:** não era i18n. O JSX usava `getAccessToken()` durante o render. No SSR `window` não existe → token vazio → painel **Sessão** + **Minhas fichas**. No primeiro render no cliente, `localStorage` já tinha JWT → painel **Sessão** sumia e o primeiro `HudPanel` passava a ser **Minhas fichas** (mesma posição no DOM, texto diferente).

**Correção:** estado `hasToken` inicial `false`, atualizado só após `getAccessToken()` no `load()` (mesmo padrão de `/campaigns`).

## Mural de Procurados (por campanha)

- Rota: `/campaigns/[id]/wanted`
- Link na ficha da campanha: botão **Procurados** no hero
- Home: teaser NCPD → `/campaigns` (texto “Abrir campanhas → Procurados”)
- API (Nest, JSON DB): coleção `campaign_wanted`
  - `GET /api/campaigns/:id/wanted` — membros (AuthGuard)
  - `POST` / `PUT` / `DELETE` — GM
- Campos: nome, crime, recompensa €$, notas, retrato opcional, vínculo NPC, flag `active`
