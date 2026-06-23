import { isKvConfigured } from "@/lib/kv/client";
import {
  listAccountsForItems,
  listTransactionsForAccounts,
  refreshItem,
} from "@/lib/pluggy/client";
import { listRegisteredConnections, saveSyncLog, setItemCache } from "./store";
import type { ItemSyncCache, SyncItemResult, SyncRunSummary } from "./types";

const SYNC_MONTHS = 6;
const REFRESH_SETTLE_MS = 4_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const syncItem = async (itemId: string): Promise<SyncItemResult> => {
  if (!isKvConfigured()) {
    return {
      itemId,
      status: "skipped",
      error: "KV não configurado",
    };
  }

  try {
    try {
      await refreshItem(itemId);
      await sleep(REFRESH_SETTLE_MS);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error ? refreshError.message : "Falha ao atualizar item na Pluggy";

      if (
        !message.includes("ITEM_ALREADY_UPDATING") &&
        !message.includes("ITEM_IS_ALREADY_UPDATING")
      ) {
        console.warn(`[sync] refreshItem(${itemId}) falhou, continuando com fetch: ${message}`);
      }
    }

    const accounts = await listAccountsForItems([itemId]);
    const transactions = await listTransactionsForAccounts(
      accounts.map((account) => ({
        id: account.id,
        bankName: account.bankName,
        currencyCode: account.currencyCode,
      })),
      SYNC_MONTHS,
    );

    const syncedAt = new Date().toISOString();
    const cache: ItemSyncCache = {
      itemId,
      syncedAt,
      status: "success",
      accounts,
      transactions,
    };

    await setItemCache(cache);

    return {
      itemId,
      status: "success",
      syncedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const syncedAt = new Date().toISOString();

    await setItemCache({
      itemId,
      syncedAt,
      status: "error",
      error: message,
      accounts: [],
      transactions: [],
    });

    return {
      itemId,
      status: "error",
      syncedAt,
      error: message,
    };
  }
};

export const syncItems = async (itemIds: string[]): Promise<SyncRunSummary> => {
  const uniqueItemIds = [...new Set(itemIds)];
  const results: SyncItemResult[] = [];

  for (const itemId of uniqueItemIds) {
    results.push(await syncItem(itemId));
  }

  const summary: SyncRunSummary = {
    ranAt: new Date().toISOString(),
    results,
  };

  await saveSyncLog(summary);
  return summary;
};

export const syncAllRegisteredItems = async (): Promise<SyncRunSummary> => {
  const connections = await listRegisteredConnections();
  const itemIds = connections.map((connection) => connection.itemId);

  if (itemIds.length === 0) {
    const summary: SyncRunSummary = {
      ranAt: new Date().toISOString(),
      results: [],
    };
    await saveSyncLog(summary);
    return summary;
  }

  return syncItems(itemIds);
};
