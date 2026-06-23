import type { SpendingAnalytics } from "@/lib/analytics/spending";
import type { DashboardAccount, DashboardTransaction, StoredConnection } from "@/lib/pluggy/types";
import { HOLDING_SHIOZAWA } from "@/lib/portfolio/types";

const DEMO_NUBANK_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_WISE_ID = "00000000-0000-4000-8000-000000000002";
const DEMO_REVOLUT_ID = "00000000-0000-4000-8000-000000000003";
const DEMO_ITAU_PJ_ID = "00000000-0000-4000-8000-000000000004";
const DEMO_BTG_ID = "00000000-0000-4000-8000-000000000005";
const DEMO_MERCURY_ID = "00000000-0000-4000-8000-000000000006";

export const DEMO_CONNECTIONS: StoredConnection[] = [
  {
    itemId: DEMO_NUBANK_ID,
    bankName: "Nubank",
    bankLogoUrl: null,
    connectedAt: "2026-01-15T10:00:00.000Z",
    portfolio: "pessoal",
  },
  {
    itemId: DEMO_WISE_ID,
    bankName: "Wise",
    bankLogoUrl: null,
    connectedAt: "2026-02-01T11:00:00.000Z",
    portfolio: "pessoal",
  },
  {
    itemId: DEMO_REVOLUT_ID,
    bankName: "Revolut",
    bankLogoUrl: null,
    connectedAt: "2026-02-10T09:30:00.000Z",
    portfolio: "pessoal",
  },
  {
    itemId: DEMO_ITAU_PJ_ID,
    bankName: "Itaú Empresas",
    bankLogoUrl: null,
    connectedAt: "2026-01-20T14:00:00.000Z",
    portfolio: "holding",
    cnpj: HOLDING_SHIOZAWA.cnpj,
  },
  {
    itemId: DEMO_BTG_ID,
    bankName: "BTG Pactual",
    bankLogoUrl: null,
    connectedAt: "2026-02-05T16:00:00.000Z",
    portfolio: "holding",
    cnpj: HOLDING_SHIOZAWA.cnpj,
  },
  {
    itemId: DEMO_MERCURY_ID,
    bankName: "Mercury",
    bankLogoUrl: null,
    connectedAt: "2026-03-01T08:00:00.000Z",
    portfolio: "holding",
    cnpj: HOLDING_SHIOZAWA.cnpj,
  },
];

export const DEMO_ACCOUNTS: DashboardAccount[] = [
  {
    id: "demo-acc-nubank-cc",
    itemId: DEMO_NUBANK_ID,
    bankName: "Nubank",
    bankLogoUrl: null,
    accountType: "Conta corrente",
    accountName: "Conta Nubank",
    balance: 12450.8,
    currencyCode: "BRL",
    portfolio: "pessoal",
  },
  {
    id: "demo-acc-nubank-card",
    itemId: DEMO_NUBANK_ID,
    bankName: "Nubank",
    bankLogoUrl: null,
    accountType: "Cartão de crédito",
    accountName: "Ultravioleta",
    balance: -2340.5,
    currencyCode: "BRL",
    portfolio: "pessoal",
  },
  {
    id: "demo-acc-wise-usd",
    itemId: DEMO_WISE_ID,
    bankName: "Wise",
    bankLogoUrl: null,
    accountType: "Conta internacional",
    accountName: "USD Balance",
    balance: 8420.35,
    currencyCode: "USD",
    portfolio: "pessoal",
  },
  {
    id: "demo-acc-revolut-eur",
    itemId: DEMO_REVOLUT_ID,
    bankName: "Revolut",
    bankLogoUrl: null,
    accountType: "Conta corrente",
    accountName: "Euro Wallet",
    balance: 3150.0,
    currencyCode: "EUR",
    portfolio: "pessoal",
  },
  {
    id: "demo-acc-itau-pj",
    itemId: DEMO_ITAU_PJ_ID,
    bankName: "Itaú Empresas",
    bankLogoUrl: null,
    accountType: "Conta corrente PJ",
    accountName: "Holding Shiozawa",
    balance: 284500.0,
    currencyCode: "BRL",
    portfolio: "holding",
  },
  {
    id: "demo-acc-btg-pj",
    itemId: DEMO_BTG_ID,
    bankName: "BTG Pactual",
    bankLogoUrl: null,
    accountType: "Investimentos",
    accountName: "Carteira PJ",
    balance: 156200.5,
    currencyCode: "BRL",
    portfolio: "holding",
  },
  {
    id: "demo-acc-mercury-usd",
    itemId: DEMO_MERCURY_ID,
    bankName: "Mercury",
    bankLogoUrl: null,
    accountType: "Business checking",
    accountName: "Operating USD",
    balance: 42180.12,
    currencyCode: "USD",
    portfolio: "holding",
  },
];

const accountMeta = new Map(
  DEMO_ACCOUNTS.map((account) => [
    account.id,
    {
      bankName: account.bankName,
      portfolio: account.portfolio,
      currencyCode: account.currencyCode,
    },
  ]),
);

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const monthDaysAgo = (monthsBack: number, day: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsBack);
  date.setDate(day);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

type RawTx = {
  idSuffix: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
};

const buildDemoTransactions = (): DashboardTransaction[] => {
  const rows: RawTx[] = [
    // Pessoal BRL
    {
      idSuffix: "salary-nubank",
      accountId: "demo-acc-nubank-cc",
      date: monthDaysAgo(0, 5),
      description: "PIX SALARIO CONSULTORIA",
      amount: 28500,
      category: "Salário",
    },
    {
      idSuffix: "salary-nubank-prev",
      accountId: "demo-acc-nubank-cc",
      date: monthDaysAgo(1, 5),
      description: "PIX SALARIO CONSULTORIA",
      amount: 28500,
      category: "Salário",
    },
    {
      idSuffix: "ifood-1",
      accountId: "demo-acc-nubank-card",
      date: daysAgo(2),
      description: "IFood *Pedido 4821",
      amount: -89.9,
      category: "Alimentação e bebidas",
    },
    {
      idSuffix: "ifood-2",
      accountId: "demo-acc-nubank-card",
      date: daysAgo(9),
      description: "IFood *Pedido 4790",
      amount: -72.5,
      category: "Alimentação e bebidas",
    },
    {
      idSuffix: "uber-1",
      accountId: "demo-acc-nubank-card",
      date: daysAgo(4),
      description: "UBER TRIP",
      amount: -34.2,
      category: "Transporte",
    },
    {
      idSuffix: "netflix",
      accountId: "demo-acc-nubank-card",
      date: monthDaysAgo(0, 10),
      description: "NETFLIX.COM",
      amount: -55.9,
      category: "Assinaturas",
    },
    {
      idSuffix: "aluguel",
      accountId: "demo-acc-nubank-cc",
      date: monthDaysAgo(0, 8),
      description: "PIX ALUGUEL APTO",
      amount: -5200,
      category: "Moradia",
    },
    {
      idSuffix: "aluguel-prev",
      accountId: "demo-acc-nubank-cc",
      date: monthDaysAgo(1, 8),
      description: "PIX ALUGUEL APTO",
      amount: -5200,
      category: "Moradia",
    },
    // Pessoal USD
    {
      idSuffix: "wise-salary",
      accountId: "demo-acc-wise-usd",
      date: monthDaysAgo(0, 3),
      description: "WISE TRANSFER IN · CLIENT US",
      amount: 4200,
      category: "Receita internacional",
    },
    {
      idSuffix: "wise-salary-prev",
      accountId: "demo-acc-wise-usd",
      date: monthDaysAgo(1, 3),
      description: "WISE TRANSFER IN · CLIENT US",
      amount: 3800,
      category: "Receita internacional",
    },
    {
      idSuffix: "aws-usd",
      accountId: "demo-acc-wise-usd",
      date: monthDaysAgo(0, 12),
      description: "AMAZON WEB SERVICES",
      amount: -142.5,
      category: "Tecnologia",
    },
    {
      idSuffix: "notion-usd",
      accountId: "demo-acc-wise-usd",
      date: monthDaysAgo(0, 15),
      description: "NOTION LABS",
      amount: -16,
      category: "Assinaturas",
    },
    // Pessoal EUR
    {
      idSuffix: "revolut-hotel",
      accountId: "demo-acc-revolut-eur",
      date: monthDaysAgo(1, 20),
      description: "HOTEL PARIS · REVOLUT",
      amount: -890,
      category: "Viagens",
    },
    {
      idSuffix: "revolut-dinner",
      accountId: "demo-acc-revolut-eur",
      date: daysAgo(14),
      description: "RESTAURANT LISBOA",
      amount: -124.5,
      category: "Alimentação e bebidas",
    },
    {
      idSuffix: "revolut-transfer-in",
      accountId: "demo-acc-revolut-eur",
      date: monthDaysAgo(0, 2),
      description: "SEPA CREDIT · CONSULTING",
      amount: 2500,
      category: "Receita internacional",
    },
    // Holding BRL
    {
      idSuffix: "holding-dividendo",
      accountId: "demo-acc-itau-pj",
      date: monthDaysAgo(0, 10),
      description: "DIVIDENDOS · PARTICIPADA A",
      amount: 45000,
      category: "Receita empresarial",
    },
    {
      idSuffix: "holding-dividendo-prev",
      accountId: "demo-acc-itau-pj",
      date: monthDaysAgo(1, 10),
      description: "DIVIDENDOS · PARTICIPADA A",
      amount: 42000,
      category: "Receita empresarial",
    },
    {
      idSuffix: "holding-folha",
      accountId: "demo-acc-itau-pj",
      date: monthDaysAgo(0, 5),
      description: "FOLHA PAGAMENTO PJ",
      amount: -18500,
      category: "Folha de pagamento",
    },
    {
      idSuffix: "holding-folha-prev",
      accountId: "demo-acc-itau-pj",
      date: monthDaysAgo(1, 5),
      description: "FOLHA PAGAMENTO PJ",
      amount: -17800,
      category: "Folha de pagamento",
    },
    {
      idSuffix: "holding-contador",
      accountId: "demo-acc-itau-pj",
      date: monthDaysAgo(0, 18),
      description: "ESCRITORIO CONTABIL",
      amount: -4200,
      category: "Serviços profissionais",
    },
    {
      idSuffix: "holding-aplicacao",
      accountId: "demo-acc-btg-pj",
      date: monthDaysAgo(0, 7),
      description: "APLIC CDB BTG",
      amount: -80000,
      category: "Investimentos",
    },
    {
      idSuffix: "holding-rendimento",
      accountId: "demo-acc-btg-pj",
      date: monthDaysAgo(0, 1),
      description: "RENDIMENTO CDB",
      amount: 2840.5,
      category: "Investimentos",
    },
    // Holding USD
    {
      idSuffix: "mercury-saas",
      accountId: "demo-acc-mercury-usd",
      date: monthDaysAgo(0, 14),
      description: "STRIPE PAYOUT · SAAS US",
      amount: 12500,
      category: "Receita empresarial",
    },
    {
      idSuffix: "mercury-saas-prev",
      accountId: "demo-acc-mercury-usd",
      date: monthDaysAgo(1, 14),
      description: "STRIPE PAYOUT · SAAS US",
      amount: 11800,
      category: "Receita empresarial",
    },
    {
      idSuffix: "mercury-legal",
      accountId: "demo-acc-mercury-usd",
      date: monthDaysAgo(0, 22),
      description: "LAW FIRM RETAINER",
      amount: -2500,
      category: "Serviços profissionais",
    },
    {
      idSuffix: "mercury-cloud",
      accountId: "demo-acc-mercury-usd",
      date: monthDaysAgo(0, 11),
      description: "GOOGLE CLOUD",
      amount: -890.4,
      category: "Tecnologia",
    },
  ];

  return rows
    .map((row, index) => {
      const meta = accountMeta.get(row.accountId);

      return {
        id: `demo-tx-${row.idSuffix}-${index}`,
        accountId: row.accountId,
        bankName: meta?.bankName ?? "Banco",
        date: row.date,
        description: row.description,
        amount: row.amount,
        category: row.category,
        portfolio: meta?.portfolio ?? "pessoal",
        currencyCode: meta?.currencyCode ?? "BRL",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const DEMO_TRANSACTIONS = buildDemoTransactions();

export type DemoSnapshot = {
  isDemo: true;
  accounts: DashboardAccount[];
  transactions: DashboardTransaction[];
  connections: StoredConnection[];
};

export const getDemoSnapshot = (): DemoSnapshot => ({
  isDemo: true,
  accounts: DEMO_ACCOUNTS,
  transactions: DEMO_TRANSACTIONS,
  connections: DEMO_CONNECTIONS,
});

export const DEMO_AI_ANALYSIS = `## Resumo geral do período
O Ruy opera em duas frentes distintas: **contas pessoais** (PF, com BRL, USD e EUR) e a **Holding Shiozawa** (CNPJ ${HOLDING_SHIOZAWA.cnpj}). Nos últimos meses, a holding concentra receitas empresariais e investimentos; o pessoal mistura moradia, assinaturas e receitas internacionais em dólar e euro.

## Onde está concentrado o dinheiro
- **Pessoal:** saldo relevante em BRL (Nubank) e reservas em USD (Wise) e EUR (Revolut).
- **Holding:** maior patrimônio em BRL (Itaú Empresas + BTG) e caixa operacional em USD (Mercury).

## Maiores gastos por categoria
No pessoal (BRL), moradia e alimentação lideram. Na holding, folha de pagamento e serviços profissionais são os principais custos fixos. Em USD, tecnologia e assinaturas aparecem tanto no pessoal quanto na holding.

## Evolução dos últimos meses
Receitas da holding subiram com dividendos e payouts SaaS em USD. No pessoal, aluguel e delivery mantêm padrão estável; viagens em EUR concentraram-se no mês passado.

## Alertas de cobranças recurrentes suspeitas
Netflix, Notion, AWS e Google Cloud repetem mensalmente — parecem legítimos. Vale revisar se todas as assinaturas PF ainda são usadas e se custos cloud da holding estão alocados corretamente.

## 3 recomendações práticas para o Ruy
1. Manter **PF e holding separados** na análise — nunca somar BRL + USD + EUR em um único total.
2. Definir teto mensal para delivery/iFood no pessoal e revisar folha + contador na holding trimestralmente.
3. Consolidar reservas internacionais (Wise/Revolut/Mercury) com metas por moeda, não convertidas automaticamente.`;
