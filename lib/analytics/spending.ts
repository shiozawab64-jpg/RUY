import type { PortfolioKind } from "@/lib/pluggy/types";

/** Minimum transaction shape for spending analytics (portfolio optional until client enrichment). */
export type AnalyticsTransaction = {
  id: string;
  accountId: string;
  bankName: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  portfolio?: PortfolioKind;
  currencyCode?: string;
};

export type MonthlySpending = {
  monthKey: string;
  label: string;
  expenses: number;
  income: number;
};

export type CategorySpending = {
  category: string;
  total: number;
  count: number;
  share: number;
};

export type BankSpending = {
  bankName: string;
  total: number;
  share: number;
};

export type AutoInsight = {
  title: string;
  body: string;
  tone: "info" | "warning" | "success";
};

export type SpendingAnalytics = {
  monthsAnalyzed: number;
  monthly: MonthlySpending[];
  byCategory: CategorySpending[];
  byBank: BankSpending[];
  topExpenses: AnalyticsTransaction[];
  autoInsights: AutoInsight[];
  currentMonth: { expenses: number; income: number };
  previousMonth: { expenses: number; income: number };
  expenseChangePercent: number | null;
  totalExpensesPeriod: number;
  totalIncomePeriod: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  "Food and drinks": "Alimentação e bebidas",
  Groceries: "Supermercado",
  Shopping: "Compras",
  Transportation: "Transporte",
  Travel: "Viagens",
  Entertainment: "Lazer",
  Healthcare: "Saúde",
  Education: "Educação",
  Housing: "Moradia",
  Utilities: "Contas e utilidades",
  Insurance: "Seguros",
  Taxes: "Impostos",
  Investments: "Investimentos",
  "Fixed Income Investment": "Investimento renda fixa",
  Transfer: "Transferência",
  Salary: "Salário",
  "Credit card payment": "Pagamento de cartão",
  "Bank fees": "Tarifas bancárias",
  "Digital services": "Serviços digitais",
  Subscription: "Assinaturas",
};

export const translateCategory = (category: string): string =>
  CATEGORY_LABELS[category] ?? category;

const monthKey = (isoDate: string): string => isoDate.slice(0, 7);

const monthLabel = (key: string): string => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const isExpense = (amount: number): boolean => amount < 0;
const isIncome = (amount: number): boolean => amount > 0;
const expenseAmount = (amount: number): number => Math.abs(amount);

const normalizeDescription = (description: string): string =>
  description.trim().toUpperCase().replace(/\s+/g, " ").slice(0, 40);

const buildMonthRange = (months: number): string[] => {
  const keys: string[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    keys.push(key);
  }

  return keys;
};

const detectRecurringCharges = (transactions: AnalyticsTransaction[]): string[] => {
  const byDescription = new Map<
    string,
    { months: Set<string>; amounts: number[]; label: string }
  >();

  for (const tx of transactions) {
    if (!isExpense(tx.amount)) {
      continue;
    }

    const key = normalizeDescription(tx.description);
    const entry = byDescription.get(key) ?? {
      months: new Set<string>(),
      amounts: [],
      label: tx.description.trim(),
    };

    entry.months.add(monthKey(tx.date));
    entry.amounts.push(expenseAmount(tx.amount));
    byDescription.set(key, entry);
  }

  const recurring: string[] = [];

  for (const entry of byDescription.values()) {
    if (entry.months.size < 2) {
      continue;
    }

    const avg = entry.amounts.reduce((sum, value) => sum + value, 0) / entry.amounts.length;
    const stable = entry.amounts.every((value) => Math.abs(value - avg) / avg <= 0.15);

    if (stable) {
      recurring.push(`${entry.label} (~${avg.toFixed(0)}/mês)`);
    }
  }

  return recurring.slice(0, 5);
};

export const buildSpendingAnalytics = (
  transactions: AnalyticsTransaction[],
  monthsAnalyzed: number,
): SpendingAnalytics => {
  const monthKeys = buildMonthRange(monthsAnalyzed);
  const monthlyMap = new Map<string, { expenses: number; income: number }>();
  for (const key of monthKeys) {
    monthlyMap.set(key, { expenses: 0, income: 0 });
  }

  const categoryMap = new Map<string, { total: number; count: number }>();
  const bankMap = new Map<string, number>();
  let totalExpensesPeriod = 0;
  let totalIncomePeriod = 0;

  for (const tx of transactions) {
    const key = monthKey(tx.date);
    const bucket = monthlyMap.get(key);

    if (isExpense(tx.amount)) {
      const value = expenseAmount(tx.amount);
      totalExpensesPeriod += value;

      if (bucket) {
        bucket.expenses += value;
      }

      const category = translateCategory(tx.category);
      const cat = categoryMap.get(category) ?? { total: 0, count: 0 };
      cat.total += value;
      cat.count += 1;
      categoryMap.set(category, cat);

      bankMap.set(tx.bankName, (bankMap.get(tx.bankName) ?? 0) + value);
    }

    if (isIncome(tx.amount) && bucket) {
      bucket.income += tx.amount;
      totalIncomePeriod += tx.amount;
    }
  }

  const monthly: MonthlySpending[] = monthKeys.map((key) => {
    const bucket = monthlyMap.get(key) ?? { expenses: 0, income: 0 };
    return {
      monthKey: key,
      label: monthLabel(key),
      expenses: bucket.expenses,
      income: bucket.income,
    };
  });

  const byCategory: CategorySpending[] = [...categoryMap.entries()]
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      share: totalExpensesPeriod > 0 ? (data.total / totalExpensesPeriod) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byBank: BankSpending[] = [...bankMap.entries()]
    .map(([bankName, total]) => ({
      bankName,
      total,
      share: totalExpensesPeriod > 0 ? (total / totalExpensesPeriod) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const topExpenses = transactions
    .filter((tx) => isExpense(tx.amount))
    .sort((a, b) => expenseAmount(b.amount) - expenseAmount(a.amount))
    .slice(0, 8);

  const currentMonth = monthly.at(-1) ?? { expenses: 0, income: 0 };
  const previousMonth = monthly.at(-2) ?? { expenses: 0, income: 0 };

  const expenseChangePercent =
    previousMonth.expenses > 0
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : null;

  const autoInsights: AutoInsight[] = [];

  if (expenseChangePercent !== null) {
    const direction = expenseChangePercent >= 0 ? "a mais" : "a menos";
    autoInsights.push({
      title: "Comparativo mensal",
      body: `Este mês você gastou ${Math.abs(expenseChangePercent).toFixed(0)}% ${direction} que no mês passado.`,
      tone: expenseChangePercent > 10 ? "warning" : "info",
    });
  }

  if (byCategory[0]) {
    autoInsights.push({
      title: "Maior categoria de gasto",
      body: `${byCategory[0].category} concentrou ${byCategory[0].share.toFixed(0)}% dos gastos (${byCategory[0].total.toFixed(2)} no período).`,
      tone: "info",
    });
  }

  if (byBank[0]) {
    autoInsights.push({
      title: "Banco com mais saídas",
      body: `${byBank[0].bankName} respondeu por ${byBank[0].share.toFixed(0)}% dos gastos consolidados.`,
      tone: "info",
    });
  }

  const recurring = detectRecurringCharges(transactions);
  if (recurring.length > 0) {
    autoInsights.push({
      title: "Cobranças recorrentes",
      body: `Possíveis assinaturas/fixos: ${recurring.join("; ")}.`,
      tone: "warning",
    });
  }

  if (topExpenses[0]) {
    autoInsights.push({
      title: "Maior despesa do período",
      body: `${topExpenses[0].description} — ${expenseAmount(topExpenses[0].amount).toFixed(2)}.`,
      tone: "success",
    });
  }

  if (currentMonth.income > 0 && currentMonth.expenses > 0) {
    const savings = currentMonth.income - currentMonth.expenses;
    autoInsights.push({
      title: "Saldo do mês",
      body:
        savings >= 0
          ? `Entradas superaram saídas em ${savings.toFixed(2)} este mês.`
          : `Saídas superaram entradas em ${Math.abs(savings).toFixed(2)} este mês.`,
      tone: savings >= 0 ? "success" : "warning",
    });
  }

  return {
    monthsAnalyzed,
    monthly,
    byCategory,
    byBank,
    topExpenses,
    autoInsights,
    currentMonth,
    previousMonth,
    expenseChangePercent,
    totalExpensesPeriod,
    totalIncomePeriod,
  };
};
