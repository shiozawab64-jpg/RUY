const PLUGGY_AUTH_BASE_URL = "https://auth.pluggy.ai";

export type PluggyConnectApiEnvironment = "PRODUCTION" | "DEVELOPMENT" | "DEMO" | string;

export type PluggyConnectRemoteConfig = {
  environment: PluggyConnectApiEnvironment;
  isProductionEnabled: boolean;
  companyName?: string;
  totalItems?: number;
  itemsCreateLimit?: number;
};

export const maskPluggyClientId = (clientId: string): string => {
  const trimmed = clientId.trim();
  if (trimmed.length <= 8) {
    return trimmed;
  }

  return `${trimmed.slice(0, 8)}…`;
};

export const fetchPluggyConnectConfig = async (
  connectToken: string,
): Promise<PluggyConnectRemoteConfig> => {
  const response = await fetch(`${PLUGGY_AUTH_BASE_URL}/connect/config`, {
    headers: {
      Authorization: `Bearer ${connectToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pluggy Connect config error (${response.status}): ${body}`);
  }

  return (await response.json()) as PluggyConnectRemoteConfig;
};

export const isPluggyProductionConnect = (config: PluggyConnectRemoteConfig): boolean =>
  config.isProductionEnabled === true || config.environment === "PRODUCTION";

export const pluggyConnectEnvironmentLabel = (config: PluggyConnectRemoteConfig): string => {
  if (isPluggyProductionConnect(config)) {
    return "Produção";
  }

  if (config.environment === "DEVELOPMENT") {
    return "Desenvolvimento";
  }

  if (config.environment === "DEMO") {
    return "Demo";
  }

  return config.environment;
};

export const pluggyDevelopmentWidgetWarning = (config: PluggyConnectRemoteConfig): string => {
  const label = pluggyConnectEnvironmentLabel(config);

  return `As chaves Pluggy ativas são de ${label} (client id com prefixo visível no painel). O widget mostra "Aplicação demo" e não conecta bancos reais. No dashboard Pluggy → Aplicações → Ir para produção, copie o CLIENT_ID e CLIENT_SECRET da aplicação de Produção e salve aqui.`;
};
