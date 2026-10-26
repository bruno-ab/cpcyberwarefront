# Home / landing — 26-10-2026

## Objetivo

Hero mais “deck” Night City: marca forte, uplink interativo, CTAs claros (logado vs visitante), gadgets abaixo da dobra — sem grid de cards no primeiro viewport.

## Interações

| Peça | Comportamento |
|------|----------------|
| `HomeGlitchTitle` | Nome do produto clicável/hover com RGB split leve; jitter no clique. Respeita `data-motion=off` e `prefers-reduced-motion`. |
| `HomeUplink` | Terminal + skyline: clique digita linhas de lore (PT); ~35% chance de corrupção visual que se corrige. SFX `ui` / `key` se SFX on. |
| `HomeDeckGadgets` | N54 com pulse (link `/news`), SCAN alterna dica, chrome 10/10 → `/catalog`. |
| `HomeCtaRow` | Deslogado: Entrar / Catálogo / Regras + link mesa. Logado: Campanhas / Mesa (desabilitada se sem campanha) / Catálogo. Glitch breve no clique dos CTAs. |

## Arquivos

- `src/app/page.tsx`, `src/app/home.module.css`
- `src/components/home/*`
- `src/i18n/messages/pt-BR.json`, `en.json`

## Preview

```powershell
cd F:\projetos\cpcyberwarefront
npm run dev
```

Abrir `http://localhost:3000/` — toggles **FX ON/OFF** e **SFX** no header continuam valendo.
