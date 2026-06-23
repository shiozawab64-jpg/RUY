"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { PortfolioKind, StoredConnection } from "@/lib/pluggy/types";
import { HOLDING_SHIOZAWA } from "@/lib/portfolio/types";
import { addConnection } from "@/lib/session/connections";

const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false },
);

type PluggyConnectButtonProps = {
  onConnected: (connections: StoredConnection[]) => void;
  label?: string;
  portfolio: PortfolioKind;
};

type PluggySuccessPayload = {
  item: {
    id: string;
    connector?: {
      name?: string;
      imageUrl?: string | null;
    };
  };
};

export const PluggyConnectButton = ({
  onConnected,
  label = "Conectar nova conta",
  portfolio,
}: PluggyConnectButtonProps) => {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openWidget = async () => {
    setLoadingToken(true);
    setError(null);

    try {
      const response = await fetch("/api/pluggy/token", { method: "POST" });
      const data = (await response.json()) as {
        accessToken?: string;
        error?: string;
      };

      if (!response.ok || !data.accessToken) {
        throw new Error(data.error ?? "Não foi possível iniciar a conexão.");
      }

      setConnectToken(data.accessToken);
      setWidgetOpen(true);
    } catch (widgetError) {
      setError(
        widgetError instanceof Error ? widgetError.message : "Erro ao abrir o Pluggy Connect.",
      );
    } finally {
      setLoadingToken(false);
    }
  };

  const handleSuccess = useCallback(
    (payload: PluggySuccessPayload) => {
      const connection = addConnection({
        itemId: payload.item.id,
        bankName: payload.item.connector?.name ?? "Banco conectado",
        bankLogoUrl: payload.item.connector?.imageUrl,
        connectedAt: new Date().toISOString(),
        portfolio,
        cnpj: portfolio === "holding" ? HOLDING_SHIOZAWA.cnpj : null,
      });

      onConnected(connection);
      setWidgetOpen(false);
      setConnectToken(null);
    },
    [onConnected, portfolio],
  );

  return (
    <div className="space-y-3">
      <button
        className="ruy-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loadingToken}
        onClick={openWidget}
        type="button"
      >
        {loadingToken ? "Preparando conexão…" : label}
      </button>

      {loadingToken ? <LoadingSpinner label="Gerando token seguro…" /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {widgetOpen && connectToken ? (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox
          onClose={() => {
            setWidgetOpen(false);
            setConnectToken(null);
          }}
          onError={(pluggyError) => {
            setError(pluggyError?.message ?? "Não foi possível concluir a conexão.");
            setWidgetOpen(false);
            setConnectToken(null);
          }}
          onSuccess={handleSuccess}
        />
      ) : null}
    </div>
  );
};
