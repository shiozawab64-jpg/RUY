# Painel do Ruy

Dashboard financeiro pessoal com Open Finance (Pluggy) e insights gerados por Claude.

Estilo editorial WSJ: portfolio PF/Holding/Geral, multi-moeda, ticker de mercado, gastos por categoria e análise com IA.

## Stack

- Next.js 16 App Router + Tailwind CSS v4
- Pluggy Open Finance (`api.pluggy.ai`, sandbox no widget)
- Claude (`claude-sonnet-4-6`) via rota server-side
- Sessão local com `localStorage` (IDs de conexão Pluggy)

## Setup local

1. Copie `.env.example` para `.env.local` e preencha:

```bash
PLUGGY_CLIENT_ID=your_pluggy_client_id
PLUGGY_CLIENT_SECRET=your_pluggy_client_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
```

2. Instale dependências e inicie:

```bash
npm install
npm run dev
```

3. Abra `http://localhost:3000`, conecte uma conta em **Conectar conta** e volte ao dashboard.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/dashboard` | Saldo consolidado, contas, resumo do mês e últimos lançamentos |
| `/gastos` | Gastos por mês/categoria/banco, feedback automático e análise com IA |
| `/connect` | Pluggy Connect Widget + lista de conexões |
| `/api/pluggy/token` | Gera connect token (server-only) |
| `/api/pluggy/webhook` | Recebe eventos Pluggy (checklist produção + sync em background) |
| `/api/pluggy/accounts` | Contas e saldos por `itemIds` |
| `/api/pluggy/transactions` | Transações dos últimos 30 dias |
| `/api/pluggy/items/[itemId]` | Remove conexão na Pluggy |
| `/api/insights` | Análise financeira em PT-BR via Claude |

## Deploy na Vercel

Este repositório é um app Next.js standalone (raiz = projeto).

1. Faça login em [vercel.com](https://vercel.com) com a conta GitHub `shiozawab64-jpg`.
2. **Add New Project** → importe `shiozawab64-jpg/RUY`.
3. Framework preset: **Next.js** (detectado automaticamente).
4. Root Directory: **`.`** (raiz do repositório).
5. Em **Environment Variables**, adicione:
   - `PLUGGY_CLIENT_ID`
   - `PLUGGY_CLIENT_SECRET`
   - `ANTHROPIC_API_KEY`
6. Deploy. Produção atualiza automaticamente a cada push em `main`; PRs geram previews.

Não commite `.env.local`. Não use `vercel --prod` manualmente — o fluxo oficial é push para GitHub.

## Webhooks Pluggy (checklist de produção)

Para concluir o passo 3 do **Request Production Access** no [dashboard Pluggy](https://dashboard.pluggy.ai):

| Campo | Valor |
| --- | --- |
| **URL** | `https://ruy-two.vercel.app/api/pluggy/webhook` |
| **Eventos** | `all` — ou: `item/created`, `item/updated`, `transactions/created`, `transactions/updated`, `transactions/deleted` |

A rota responde **200** imediatamente. Sync em background ocorre quando KV está configurado e o `itemId` do evento está registrado.

**Alternativa (sandbox):** se ainda estiver em sandbox com MeuPluggy, pode **pular o passo 3** — bancos de teste funcionam sem webhook. O app desktop sincroniza via cron diário (9h BRT) mesmo sem URL pública.

**App desktop:** o `.dmg` roda em localhost; deixe webhooks em branco no dashboard para uso local. Use a URL acima só para satisfazer o checklist de produção.

**Segurança opcional:** Pluggy não envia `x-pluggy-signature`. Para autenticar, crie o webhook via API com header `X-Webhook-Secret` e defina `PLUGGY_WEBHOOK_SECRET` no Vercel.

Teste rápido:

```bash
curl -s -X POST https://ruy-two.vercel.app/api/pluggy/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"item/updated","eventId":"test","itemId":"a5c763cb-0952-457b-9936-630f79c5b016"}'
```

Resposta esperada: `{"received":true,"event":"item/updated"}` com HTTP 200.

## Origem

Extraído de [gpmhDeployment](https://github.com/gpmentalheath/gpmhDeployment) (`apps/painel-do-ruy`, branch `deploy/painel-do-ruy`).
