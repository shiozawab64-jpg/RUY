import { getKv, isKvConfigured } from "@/lib/kv/client";
import type { ItemSyncCache, RegisteredConnection, SyncRunSummary } from "./types";

const CONNECTIONS_KEY = "ruy:connections";
const SYNC_LOG_KEY = "ruy:sync-log";

const itemCacheKey = (itemId: string): string => `ruy:cache:${itemId}`;

export const listRegisteredConnections = async (): Promise<RegisteredConnection[]> => {
  if (!isKvConfigured()) {
    return [];
  }

  const connections = await getKv().get<RegisteredConnection[]>(CONNECTIONS_KEY);
  return connections ?? [];
};

export const registerConnection = async (connection: RegisteredConnection): Promise<void> => {
  const kv = getKv();
  const existing = (await kv.get<RegisteredConnection[]>(CONNECTIONS_KEY)) ?? [];
  const next = [connection, ...existing.filter((entry) => entry.itemId !== connection.itemId)];
  await kv.set(CONNECTIONS_KEY, next);
};

export const unregisterConnection = async (itemId: string): Promise<void> => {
  const kv = getKv();
  const existing = (await kv.get<RegisteredConnection[]>(CONNECTIONS_KEY)) ?? [];
  const next = existing.filter((entry) => entry.itemId !== itemId);
  await kv.set(CONNECTIONS_KEY, next);
  await kv.del(itemCacheKey(itemId));
};

export const getItemCache = async (itemId: string): Promise<ItemSyncCache | null> => {
  if (!isKvConfigured()) {
    return null;
  }

  return (await getKv().get<ItemSyncCache>(itemCacheKey(itemId))) ?? null;
};

export const setItemCache = async (cache: ItemSyncCache): Promise<void> => {
  await getKv().set(itemCacheKey(cache.itemId), cache);
};

export const getItemCaches = async (itemIds: string[]): Promise<Map<string, ItemSyncCache>> => {
  const caches = new Map<string, ItemSyncCache>();

  if (!isKvConfigured() || itemIds.length === 0) {
    return caches;
  }

  const kv = getKv();
  const entries = await Promise.all(
    itemIds.map(async (itemId) => {
      const cache = await kv.get<ItemSyncCache>(itemCacheKey(itemId));
      return [itemId, cache] as const;
    }),
  );

  for (const [itemId, cache] of entries) {
    if (cache) {
      caches.set(itemId, cache);
    }
  }

  return caches;
};

export const saveSyncLog = async (summary: SyncRunSummary): Promise<void> => {
  if (!isKvConfigured()) {
    return;
  }

  await getKv().set(SYNC_LOG_KEY, summary);
};

export const getSyncLog = async (): Promise<SyncRunSummary | null> => {
  if (!isKvConfigured()) {
    return null;
  }

  return (await getKv().get<SyncRunSummary>(SYNC_LOG_KEY)) ?? null;
};
