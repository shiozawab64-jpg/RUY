import { getServerEnv } from "../env";
import type { PluggyAccount, PluggyItem, PluggyTransaction } from "./types";

const PLUGGY_BASE_URL = "https://api.pluggy.ai";

type ApiKeyCache = {
  apiKey: string;
  expiresAt: number;
};

let apiKeyCache: ApiKeyCache | null = null;

const pluggyFetch = async <T>(
  path: string,
  init?: RequestInit & { apiKey?: string },
): Promise<T> => {
  const apiKey = init?.apiKey ?? (await getPluggyApiKey());
  const { apiKey: _ignored, ...requestInit } = init ?? {};

  const response = await fetch(`${PLUGGY_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      ...(requestInit.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pluggy API error (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const getPluggyApiKey = async (): Promise<string> => {
  if (apiKeyCache && Date.now() < apiKeyCache.expiresAt) {
    return apiKeyCache.apiKey;
  }

  const { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } = getServerEnv();

  const response = await fetch(`${PLUGGY_BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao autenticar na Pluggy (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { apiKey: string };

  apiKeyCache = {
    apiKey: data.apiKey,
    expiresAt: Date.now() + 100 * 60 * 1000,
  };

  return data.apiKey;
};

export const createConnectToken = async (): Promise<string> => {
  const data = await pluggyFetch<{ accessToken: string }>("/connect_token", {
    method: "POST",
    body: JSON.stringify({
      options: {
        clientUserId: "painel-do-ruy",
        avoidDuplicates: true,
      },
    }),
  });

  return data.accessToken;
};

export const getItem = async (itemId: string): Promise<PluggyItem> =>
  pluggyFetch<PluggyItem>(`/items/${itemId}`);

export const refreshItem = async (itemId: string): Promise<PluggyItem> =>
  pluggyFetch<PluggyItem>(`/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });

export const deleteItem = async (itemId: string): Promise<void> => {
  await pluggyFetch<void>(`/items/${itemId}`, { method: "DELETE" });
};

export const listAccountsByItem = async (itemId: string): Promise<PluggyAccount[]> => {
  const data = await pluggyFetch<{ results: PluggyAccount[] }>(
    `/accounts?itemId=${encodeURIComponent(itemId)}`,
  );

  return data.results ?? [];
};

const accountTypeLabel = (account: PluggyAccount): string => {
  const labels: Record<string, string> = {
    CHECKING_ACCOUNT: "Conta corrente",
    SAVINGS_ACCOUNT: "Poupança",
    CREDIT_CARD: "Cartão de crédito",
    INVESTMENT: "Investimento",
  };

  return labels[account.subtype] ?? account.subtype ?? account.type;
};

export const listAccountsForItems = async (itemIds: string[]) => {
  const accounts: Array<{
    id: string;
    itemId: string;
    bankName: string;
    bankLogoUrl?: string | null;
    accountType: string;
    accountName: string;
    balance: number;
    currencyCode: string;
  }> = [];

  for (const itemId of itemIds) {
    const [item, itemAccounts] = await Promise.all([getItem(itemId), listAccountsByItem(itemId)]);

    for (const account of itemAccounts) {
      accounts.push({
        id: account.id,
        itemId: account.itemId,
        bankName: item.connector.name,
        bankLogoUrl: item.connector.imageUrl,
        accountType: accountTypeLabel(account),
        accountName: account.marketingName ?? account.name,
        balance: account.balance,
        currencyCode: account.currencyCode,
      });
    }
  }

  return accounts;
};

const monthsAgoIso = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
};

export const listTransactionsForAccounts = async (
  accounts: Array<{ id: string; bankName: string; currencyCode?: string }>,
  months = 6,
): Promise<
  Array<{
    id: string;
    accountId: string;
    bankName: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    currencyCode: string;
  }>
> => {
  const dateFrom = monthsAgoIso(months);
  const bankByAccountId = new Map(accounts.map((a) => [a.id, a.bankName]));
  const currencyByAccountId = new Map(accounts.map((a) => [a.id, a.currencyCode ?? "BRL"]));
  const transactions: Array<{
    id: string;
    accountId: string;
    bankName: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    currencyCode: string;
  }> = [];

  for (const account of accounts) {
    let after: string | undefined;
    let pageCount = 0;

    do {
      const params = new URLSearchParams({
        accountId: account.id,
        dateFrom,
      });

      if (after) {
        params.set("after", after);
      }

      const data = await pluggyFetch<{
        results: PluggyTransaction[];
        next?: string | null;
      }>(`/v2/transactions?${params.toString()}`);

      for (const tx of data.results ?? []) {
        transactions.push({
          id: tx.id,
          accountId: tx.accountId,
          bankName: bankByAccountId.get(tx.accountId) ?? account.bankName,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          category: tx.category ?? "Sem categoria",
          currencyCode: currencyByAccountId.get(tx.accountId) ?? "BRL",
        });
      }

      after = data.next
        ? (new URLSearchParams(data.next.replace(/^\?/, "")).get("after") ?? undefined)
        : undefined;
      pageCount += 1;
    } while (after && pageCount < 12);
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const listRecentTransactionsForAccounts = async (
  accounts: Array<{ id: string; bankName: string }>,
) => listTransactionsForAccounts(accounts, 1);
