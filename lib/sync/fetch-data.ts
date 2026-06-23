import { listAccountsForItems, listTransactionsForAccounts } from "@/lib/pluggy/client";
import { getItemCaches } from "./store";
import type {
  CachedAccount,
  CachedTransaction,
  FinancialDataMeta,
  FinancialDataSource,
  ItemSyncCache,
} from "./types";

const CACHE_MONTHS = 6;

const monthsAgoIso = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
};

const filterTransactionsByMonths = (
  transactions: CachedTransaction[],
  months: number,
): CachedTransaction[] => {
  const dateFrom = monthsAgoIso(months);
  return transactions.filter((transaction) => transaction.date >= dateFrom);
};

const mergeCaches = (
  caches: ItemSyncCache[],
): { accounts: CachedAccount[]; transactions: CachedTransaction[] } => {
  const accounts: CachedAccount[] = [];
  const transactions: CachedTransaction[] = [];

  for (const cache of caches) {
    accounts.push(...cache.accounts);
    transactions.push(...cache.transactions);
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { accounts, transactions };
};

const resolveMeta = (source: FinancialDataSource, caches: ItemSyncCache[]): FinancialDataMeta => {
  if (caches.length === 0) {
    return { source, lastSyncedAt: null };
  }

  const syncedAtTimes = caches.map((cache) => new Date(cache.syncedAt).getTime());
  const oldestSync = new Date(Math.min(...syncedAtTimes)).toISOString();

  return { source, lastSyncedAt: oldestSync };
};

export const fetchFinancialData = async (
  itemIds: string[],
  months: number,
): Promise<{
  accounts: CachedAccount[];
  transactions: CachedTransaction[];
  meta: FinancialDataMeta;
}> => {
  if (itemIds.length === 0) {
    return {
      accounts: [],
      transactions: [],
      meta: { source: "live", lastSyncedAt: null },
    };
  }

  const cacheMap = await getItemCaches(itemIds);
  const successfulCaches = itemIds
    .map((itemId) => cacheMap.get(itemId))
    .filter((cache): cache is ItemSyncCache => Boolean(cache && cache.status === "success"));

  const allItemsCached = successfulCaches.length === itemIds.length && months <= CACHE_MONTHS;

  if (allItemsCached) {
    const { accounts, transactions } = mergeCaches(successfulCaches);

    return {
      accounts,
      transactions: filterTransactionsByMonths(transactions, months),
      meta: resolveMeta("cache", successfulCaches),
    };
  }

  const accounts = await listAccountsForItems(itemIds);
  const transactions = await listTransactionsForAccounts(
    accounts.map((account) => ({
      id: account.id,
      bankName: account.bankName,
      currencyCode: account.currencyCode,
    })),
    months,
  );

  const source: FinancialDataSource =
    successfulCaches.length > 0 && successfulCaches.length < itemIds.length ? "mixed" : "live";

  return {
    accounts,
    transactions,
    meta: resolveMeta(source, successfulCaches),
  };
};
