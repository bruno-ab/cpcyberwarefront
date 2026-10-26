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
| N54 | Rotação manual (SP, Eurásia, Israel, Japão, Arasaka) + tape SVG Arasaka▲ / Bola do Japão▼. |
| NCPD | Ticker NetWatch (alertas Tel Aviv ficção) além do wanted + MaxTac. |
| Neuralink | Barras demo; sobem após falha no modal ICE. |
| Kiroshi ad | Após 3s; dismiss com glitch; CTA `/catalog`. |
| Modal ICE | Deck scan / comando `breach`; link para minigame `/breach`. |
| `HomeAmbientGags` | Gags raros (matrix slang, invasão, coelho ASCII, barra sync) — só com FX/motion on; não bloqueia cliques. |

## Arquivos

- `src/app/page.tsx`
- `src/components/home/HomeLanding.tsx`, `HomeCyberGrid.tsx`, `HomeAmbientGags.tsx`, `HomeMarketTape.tsx`, `homeWireFeed.ts`, `homeLanding.module.css`, `homeTerminalCommands.ts`
- `src/components/layout/AppShell.tsx` (`landing` prop), `PageFrame.tsx`
- `src/app/layout.tsx` (fonte Orbitron)

## Preview

```powershell
cd F:\projetos\cpcyberwarefront
npm run dev
```

Abrir `http://localhost:3000/` — toggles **FX ON/OFF** e **SFX** no header do AppShell continuam valendo.
