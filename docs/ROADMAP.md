# Roadmap — Cyberpunk Storyteller (front + API)

Revisão 24-10-2026. Prioridade do que ainda falta.

## Feito nesta rodada

- `CampaignProvider` + faixa Heat no AppShell
- API `POST /api/campaigns/:id/minigame-result` (braindance, bar, rocker, breach…)
- JWT lê `JWT_SECRET` do env
- Heat de gig diferenciado por risco; manchetes sem meta de heat no texto
- API local preferida em `localhost` sem `.env`

## Crítico (segurança / produção)

1. Auth em mutações de campanha / wiki GM / media upload / phone
2. VTT: não aceitar `?role=gm` sem JWT válido
3. Tirar `typescript.ignoreBuildErrors` e limpar erros TS
4. CORS com origins explícitos

## Alto (produto)

1. Seletor de campanha global (SheetRoster → `setCampaignId`)
2. Ligar restante dos minigames (cirurgia, psico, lock) ao `minigame-result`
3. Heat effects em gigs/map (encounter table)
4. Push N54 → telefone da ficha
5. Psychosis `checkPsychosis` no install de chrome

## Médio

1. Unificar shells (`PageFrame` em sheet/cyberware/map)
2. Agrupar nav (Play / City / Lore)
3. Export/import com news + recaps
4. Remover rotas órfãs (`/test`, `/maps`, skeleton page)
5. README real (hoje ainda é boilerplate Nest)

## Baixo

1. Remover MobX / react-router / Tailwind se não forem usados
2. i18n completo ou só PT
3. PWA cache de `/news`
