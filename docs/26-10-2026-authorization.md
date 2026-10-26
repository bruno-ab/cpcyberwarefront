# Autorização front — 26-10-2026

## Gate global

Sem `access_token`, o app redireciona para `/login?next=…` exceto `/login` e `/register`. Ver `26-10-2026-auth-gate.md`.

## Rotas

| Rota | Comportamento |
|------|----------------|
| `/table` | Exige login; valida campanha via `GET /api/campaigns/mine`; limpa `cp-campaign-id` se inválido |
| `/sheet` | Exige login; 403 → mensagem de acesso |
| `/campaigns/[id]` | Login obrigatório; 403 → “Sem acesso a esta campanha” |

## Mensagens (PT)

- **Faça login** — sem `access_token` ou `vtt:join` `unauthorized`
- **Sem acesso a esta campanha** — campanha fora de `participating` / join `forbidden`

## `CampaignProvider`

`refresh()` reconcilia `cp-campaign-id` com campanhas permitidas antes de buscar heat/dados.

## API

Ver `cpcyberware/docs/26-10-2026-authorization.md`.
