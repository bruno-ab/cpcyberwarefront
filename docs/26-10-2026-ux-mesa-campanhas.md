# UX mesa e campanhas — 26-10-2026

## Auditoria (prioridades internas)

| Prioridade | Problema |
|------------|----------|
| **P0** | `/table`: falhas de acesso/join redirecionavam sem UI; `accessNotice` nunca era exibido |
| **P0** | Nav: Mesa sempre clicável mesmo sem campanha permitida |
| **P1** | Campanhas → detalhe: sem loading, CTAs fracas em roster/cenas vazias, convites pouco visíveis |
| **P1** | Lista de campanhas: apenas texto “Carregando…” |
| **P1** | Mesa: painel direito aberto por padrão (HUD pesado) |
| **P2** | GM sem dica inicial (roster drag, mão, `?`) |
| **P2** | Inconsistência PT (“Jack in”, “Ir para a mesa” vs “Abrir mesa”) |
| **P2** | Detalhe da campanha: erro genérico em falha de API |

## Entregue nesta rodada

- **Gate da mesa** (`VttAccessGate`): loading ao validar campanha/cenas e ao `vtt:join`; mensagens PT com links para Campanhas, detalhe e login.
- **Nav logado**: Campanhas / Mesa / Conta em destaque; Mesa desabilitada com tooltip quando não há campanha em `mine`.
- **Campanhas**: skeletons na lista; botões PT (“Entrar na conta”, “Ver campanha”).
- **Detalhe da campanha**: skeleton, “Abrir mesa” no hero, âncora “Convidar jogadores”, CTAs roster/cenas vazias, painel de acesso em 403/erro.
- **Mesa**: painel direito recolhido por padrão (pref local); banner GM dismissível (`GmFirstVisitHints`).

## Próximo (não feito)

- Toast global reutilizável para 403 em rotas fora da mesa.
- Query `?notice=` ao voltar de redirects legados.
- Colapsar seções GM (tokens/map/scene) por pref na primeira visita.
- Testes e2e Campanhas → Abrir mesa → join.
