import type { SpendingAnalytics } from "@/lib/analytics/spending";
import { buildSpendingAnalytics } from "@/lib/analytics/spending";
import type { DashboardAccount, DashboardTransaction, StoredConnection } from "@/lib/pluggy/types";
import type {
  CurrencyBalanceSummary,
  CurrencyFilter,
  PortfolioFilter,
  PortfolioKind,
  SupportedCurrency,
} from "./types";

const isSupportedCurrency = (code: string): code is SupportedCurrency =>
  code === "BRL" || code === "USD" || code === "EUR";

const matchesPortfolioFilter = (
  portfolio: PortfolioKind,
  filter: PortfolioFilter,
): boolean => filter === "geral" || portfolio === filter;

export const portfolioForItem = (
  itemId: string,
  connections: StoredConnection[],
): PortfolioKind => {
  const match = connections.find((connection) => connection.itemId === itemId);
  return match?.portfolio ?? "pessoal";
};

export const enrichAccounts = (
  accounts: Array<Omit<DashboardAccount, "portfolio"> & { portfolio?: PortfolioKind }>,
  connections: StoredConnection[],
): DashboardAccount[] =>
  accounts.map((account) => ({
    ...account,
    portfolio: portfolioForItem(account.itemId, connections),
  }));

export const enrichTransactions = (
  transactions: Array<
    Omit<DashboardTransaction, "portfolio" | "currencyCode"> & {
      portfolio?: PortfolioKind;
      currencyCode?: string;
    }
  >,
  accounts: DashboardAccount[],
): DashboardTransaction[] => {
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  return transactions.map((transaction) => {
    const account = accountMap.get(transaction.accountId);

    return {
      ...transaction,
      portfolio: account?.portfolio ?? "pessoal",
      currencyCode: account?.currencyCode ?? transaction.currencyCode ?? "BRL",
    };
  });
};

export const filterAccounts = (
  accounts: DashboardAccount[],
  portfolio: PortfolioFilter,
  currency: CurrencyFilter,
): DashboardAccount[] =>
  accounts.filter((account) => {
    if (!matchesPortfolioFilter(account.portfolio, portfolio)) {
      return false;
    }

    if (currency === "all") {
      return true;
    }

    return account.currencyCode === currency;
  });

export const filterTransactions = (
  transactions: DashboardTransaction[],
  portfolio: PortfolioFilter,
  currency: CurrencyFilter,
): DashboardTransaction[] =>
  transactions.filter((transaction) => {
    if (!matchesPortfolioFilter(transaction.portfolio, portfolio)) {
      return false;
    }

    if (currency === "all") {
      return true;
    }

    return transaction.currencyCode === currency;
  });

export const summarizeBalancesByCurrency = (
  accounts: DashboardAccount[],
  portfolio: PortfolioFilter,
): CurrencyBalanceSummary[] => {
  const portfolioAccounts =
    portfolio === "geral"
      ? accounts
      : accounts.filter((account) => account.portfolio === portfolio);
  const totals = new Map<SupportedCurrency, { total: number; count: number }>();

  for (const account of portfolioAccounts) {
    if (!isSupportedCurrency(account.currencyCode)) {
      continue;
    }

    const current = totals.get(account.currencyCode) ?? { total: 0, count: 0 };
    current.total += account.balance;
    current.count += 1;
    totals.set(account.currencyCode, current);
  }

  return (["BRL", "USD", "EUR"] as const)
    .filter((currency) => totals.has(currency))
    .map((currency) => ({
      currency,
      total: totals.get(currency)?.total ?? 0,
      accountCount: totals.get(currency)?.count ?? 0,
    }));
};

export const buildPortfolioAnalytics = (
  transactions: DashboardTransaction[],
  portfolio: PortfolioFilter,
  currency: CurrencyFilter,
  months: number,
): SpendingAnalytics => {
  const analyticsCurrency = currency === "all" ? "BRL" : currency;

  return buildSpendingAnalytics(
    filterTransactions(transactions, portfolio, analyticsCurrency),
    months,
  );
};
