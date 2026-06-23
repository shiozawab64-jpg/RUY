"use client";

import { formatDateTime } from "@/lib/format";
import type { FinancialDataSource } from "@/lib/sync/types";

type SyncStatusBarProps = {
  lastSyncedAt: string | null;
  source: FinancialDataSource | null;
  refreshing: boolean;
  onRefresh: () => void;
};

const sourceLabel = (source: FinancialDataSource | null): string => {
  if (source === "cache") {
    return "cache diário";
  }

  if (source === "mixed") {
    return "parcial em cache";
  }

  if (source === "live") {
    return "Pluggy ao vivo";
  }

  return "";
};

export const SyncStatusBar = ({
  lastSyncedAt,
  source,
  refreshing,
  onRefresh,
}: SyncStatusBarProps) => {
  if (!lastSyncedAt && source !== "live") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-paper-muted px-4 py-3 text-sm">
      <p className="text-muted">
        {lastSyncedAt ? (
          <>
            Última atualização:{" "}
            <span className="font-semibold text-ink">{formatDateTime(lastSyncedAt)}</span>
          </>
        ) : (
          "Dados carregados diretamente da Pluggy."
        )}
        {source ? (
          <span className="ml-2 text-xs uppercase tracking-wide text-ink-muted">
            · {sourceLabel(source)}
          </span>
        ) : null}
      </p>

      <button
        className="ruy-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={refreshing}
        onClick={onRefresh}
        type="button"
      >
        {refreshing ? "Atualizando…" : "Atualizar agora"}
      </button>
    </div>
  );
};
