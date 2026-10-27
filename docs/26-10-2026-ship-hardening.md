# Ship note — front TS build (26-10-2026)

## TypeScript build

- Removed `typescript.ignoreBuildErrors` from `next.config.js`.
- Fixed blocking `tsc` errors in legacy/demo routes: `createCharacterForm`, `characters/details`, `cyberware/.../skeleton`, `maps`, `table` (FX trail + hotkey `canDragToken` wrapper).

Verify locally:

```powershell
pnpm exec tsc --noEmit
pnpm build
```

API parity (snapshot/CORS/JWT/combat tests): see `cpcyberware/docs/26-10-2026-ship-hardening.md`.
