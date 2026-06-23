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

## Origem

Extraído de [gpmhDeployment](https://github.com/gpmentalheath/gpmhDeployment) (`apps/painel-do-ruy`, branch `deploy/painel-do-ruy`).
