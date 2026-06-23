import type { PluggyConnectRemoteConfig } from "./connect-config";
import { isPluggyProductionConnect } from "./connect-config";

export type PluggyEnvironment = "sandbox" | "production";

/**
 * Legacy heuristic for includeSandbox on the widget (MeuPluggy / Pluggy Bank test connectors).
 * Prefer `resolvePluggyWidgetSandbox` with live Connect config when available.
 */
export const detectPluggyEnvironment = (clientId: string): PluggyEnvironment => {
  const override = process.env.PLUGGY_SANDBOX?.trim().toLowerCase();

  if (override === "1" || override === "true" || override === "yes") {
    return "sandbox";
  }

  if (override === "0" || override === "false" || override === "no") {
    return "production";
  }

  const normalized = clientId.toLowerCase();

  if (normalized.includes("sandbox") || normalized.includes("-test-")) {
    return "sandbox";
  }

  return "production";
};

export const pluggyEnvironmentLabel = (environment: PluggyEnvironment): string =>
  environment === "sandbox" ? "Sandbox" : "Produção";

export const shouldIncludeSandboxConnectors = (environment: PluggyEnvironment): boolean =>
  environment === "sandbox";

export const resolvePluggyWidgetSandbox = (
  clientId: string,
  connectConfig?: PluggyConnectRemoteConfig | null,
): boolean => {
  if (connectConfig) {
    return !isPluggyProductionConnect(connectConfig);
  }

  return shouldIncludeSandboxConnectors(detectPluggyEnvironment(clientId));
};
