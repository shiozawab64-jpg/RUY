"use client";

import { useCallback, useEffect, useState } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { PortfolioSelector } from "@/components/portfolio-controls";
import { PluggyConnectButton } from "@/components/pluggy-connect-button";
import { BankLogo } from "@/components/ui/bank-logo";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DEMO_CONNECTIONS } from "@/lib/demo/fixtures";
import type { PortfolioKind, StoredConnection } from "@/lib/pluggy/types";
import { PORTFOLIO_META } from "@/lib/portfolio/types";
import { readConnections, removeConnection } from "@/lib/session/connections";

export const ConnectContent = () => {
  const [connections, setConnections] = useState<StoredConnection[]>([]);
  const [connectPortfolio, setConnectPortfolio] = useState<PortfolioKind>("pessoal");
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshConnections = useCallback(() => {
    setConnections(readConnections());
  }, []);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  const handleRemove = async (itemId: string) => {
    setRemovingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/pluggy/items/${itemId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível remover a conta.");
      }

      setConnections(removeConnection(itemId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Erro ao remover conexão.");
    } finally {
      setRemovingItemId(null);
    }
  };

  const usingDemo = connections.length === 0;

  const renderConnectionMeta = (connection: StoredConnection) => {
    const meta = PORTFOLIO_META[connection.portfolio];

    return (
      <>
        <p className="font-semibold text-ink">{connection.bankName}</p>
        <p className="text-xs text-muted">
          {meta.label}
          {connection.cnpj ? ` · ${connection.cnpj}` : ""}
        </p>
      </>
    );
  };

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="ruy-section-label">Open Finance</p>
        <h2 className="ruy-headline mt-1 text-4xl">Conectar contas</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Separe contas pessoais (PF) da Holding Shiozawa (CNPJ). Cada conexão fica vinculada ao
          portfólio escolhido — BRL, USD e EUR aparecem nos saldos sem conversão automática.
        </p>
      </header>

      {usingDemo ? <DemoBanner /> : null}

      <section className="ruy-card bg-paper-muted p-5 space-y-5">
        <div>
          <h3 className="ruy-headline text-base">Adicionar banco real</h3>
          <p className="mt-1 text-sm text-muted">
            Escolha se a conta é pessoal ou da holding antes de abrir o Pluggy Connect.
          </p>
        </div>

        <PortfolioSelector
          onChange={setConnectPortfolio}
          value={connectPortfolio}
          variant="assign"
        />

        <PluggyConnectButton
          label={
            connectPortfolio === "holding"
              ? "Conectar conta da Holding Shiozawa"
              : "Conectar conta pessoal"
          }
          onConnected={setConnections}
          portfolio={connectPortfolio}
        />
      </section>

      <section className="space-y-4">
        <h3 className="ruy-headline border-b border-rule pb-2 text-lg">
          {usingDemo ? "Contas no painel (exemplo)" : "Contas conectadas"}
        </h3>

        {error ? <ErrorMessage message={error} /> : null}

        {usingDemo ? (
          <ul className="space-y-3">
            {DEMO_CONNECTIONS.map((connection) => (
              <li
                className="ruy-card flex flex-col gap-4 border-dashed p-4 sm:flex-row sm:items-center sm:justify-between"
                key={connection.itemId}
              >
                <div className="flex items-center gap-3">
                  <BankLogo bankName={connection.bankName} logoUrl={connection.bankLogoUrl} />
                  <div>
                    {renderConnectionMeta(connection)}
                    <p className="mt-1 text-xs text-muted">Dados de demonstração no dashboard</p>
                  </div>
                </div>
                <span className="bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  {PORTFOLIO_META[connection.portfolio].badge} · Exemplo
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {connections.map((connection) => (
              <li
                className="ruy-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={connection.itemId}
              >
                <div className="flex items-center gap-3">
                  <BankLogo bankName={connection.bankName} logoUrl={connection.bankLogoUrl} />
                  <div>
                    {renderConnectionMeta(connection)}
                    <p className="mt-1 text-xs text-muted">
                      Conectado em{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(connection.connectedAt))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-paper-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {PORTFOLIO_META[connection.portfolio].badge}
                  </span>
                  <button
                    className="border border-negative/30 px-4 py-2 text-sm font-semibold text-negative transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={removingItemId === connection.itemId}
                    onClick={() => void handleRemove(connection.itemId)}
                    type="button"
                  >
                    {removingItemId === connection.itemId ? (
                      <LoadingSpinner label="Removendo…" />
                    ) : (
                      "Remover"
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
