import type { StoredConnection } from "@/lib/pluggy/types";

export type RegisteredConnection = StoredConnection;

export type CachedAccount = {
  id: string;
  itemId: string;
  bankName: string;
  bankLogoUrl?: string | null;
  accountType: string;
  accountName: string;
  balance: number;
  currencyCode: string;
};

export type CachedTransaction = {
  id: string;
  accountId: string;
  bankName: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  currencyCode: string;
};

export type ItemSyncCache = {
  itemId: string;
  syncedAt: string;
  status: "success" | "error";
  error?: string;
  accounts: CachedAccount[];
  transactions: CachedTransaction[];
};

export type SyncItemResult = {
  itemId: string;
  status: "success" | "error" | "skipped";
  syncedAt?: string;
  error?: string;
};

export type SyncRunSummary = {
  ranAt: string;
  results: SyncItemResult[];
};

export type FinancialDataSource = "cache" | "live" | "mixed";

export type FinancialDataMeta = {
  source: FinancialDataSource;
  lastSyncedAt: string | null;
};
