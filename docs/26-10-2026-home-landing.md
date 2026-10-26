# Home / landing — 26-10-2026

## Objetivo

Landing “deck” Night City alinhada ao mock HTML (Out/2026): grid animado, scanlines, painéis chanfrados, terminal NetWatch, módulos NCPD/N54/Neuralink, popup Kiroshi e modal ICE — integrada ao `AppShell` (nav global, Heat, FX/SFX).

## Interações

| Peça | Comportamento |
|------|----------------|
| `HomeCyberGrid` | Canvas de grade ciano; scroll vertical só com `data-motion=on`. |
| `HomeLanding` | Pipes → `/campaigns`, `/table`, `/characters` ou `/login`, `/breach`. Hero: mesa + deck scan (modal). |
| Terminal | Comandos `help`, `scan`, `breach`, `ncpd`, `clear`, `status`, `neuralink`. SFX via `playCyberSound` se SFX on. |
| NCPD | Flash vermelho MaxTac (~3s) + `alarm` SFX; desligado com FX/motion off (flash estático leve). |
| N54 | Rotação manual (capitais/megacidades + mercados) + **tape horizontal** com sparklines neon (Arasaka, Nikkei, Militech, Trauma Team, Kang Tao, Petrochem, NCX, EUR$ — mix ▲/▼, scroll no compact). |
| NCPD | Ticker NetWatch (alertas Tel Aviv ficção) além do wanted + MaxTac. |
| Neuralink | Barras demo; sobem após falha no modal ICE. |
| Kiroshi ad | Após 3s; dismiss com glitch; CTA `/catalog`. |
| Modal ICE | Deck scan / comando `breach`; link para minigame `/breach`. |
| `HomeAmbientGags` | Gags raros (matrix slang, invasão, coelho ASCII, barra sync) — só com FX/motion on; não bloqueia cliques. |
| `HomeDistrictHolomap` | Holoprojetor SVG (wireframe ciano): Watson, Westbrook, Heywood, Pacifica, City Center, Badlands — lore PT + link (`/lore`, `/wiki`, `/map`, `/gigs`). |
| `HomeChromeFlipCard` | Cartão chrome CSS 3D; verso sorteia peça de `/api/cyberware/catalog` (fallback catálogo local) + link `/catalog`. Flip instantâneo com FX off / reduced motion. |
| `HomeNightCityWeather` | Ciclo manual + auto (4 min com FX on): chuva ácida, smog, corpo zero, céu limpo. Tint/overlay na landing; HUD `CLIMA:` na status bar. FX off = tint estático, sem animação. |

## Layout dos gadgets

Entre o **heroGrid** (mesa + terminal) e a **fileira de módulos** (NCPD / N54 / Neuralink):

1. **Holomap** — coluna larga (2fr ≥1100px); mapa + painel de lore.
2. **Chrome flip card** — coluna estreita ao lado.
3. **Meteo NC** — coluna estreita; controla o clima global da landing.

Em tablet (768–1099px): holomap ocupa linha inteira; cartão e clima dividem a linha de baixo.

## Arquivos

- `src/app/page.tsx`
- `src/components/home/HomeLanding.tsx`, `HomeCyberGrid.tsx`, `HomeAmbientGags.tsx`, `HomeMarketTape.tsx`, `homeMarketTapeData.ts`, `HomeDistrictHolomap.tsx`, `HomeChromeFlipCard.tsx`, `HomeNightCityWeather.tsx`, `homeNightCityDistricts.ts`, `homeWeatherModes.ts`, `homeWireFeed.ts`, `homeLanding.module.css`, `homeTerminalCommands.ts`
- `src/components/layout/AppShell.tsx` (`landing` prop), `PageFrame.tsx`
- `src/app/layout.tsx` (fonte Orbitron)

## Preview

```powershell
cd F:\projetos\cpcyberwarefront
npm run dev
```

Abrir `http://localhost:3000/` — toggles **FX ON/OFF** e **SFX** no header do AppShell continuam valendo.

Layout: grids usam `minmax(0, 1fr)` + ticker contido; glitch FX em overlay fixo (não `filter` no root) para não quebrar `position: fixed`.

**26/10 (tarde):** N54 ganhou feed pulp por capitais (SP, Tóquio, Londres, Berlin, Moscou, Pequim, NY, CDMX, Lagos, Dubai, Seoul…) e tape de mercado com 8 mini-gráficos scrolláveis.
