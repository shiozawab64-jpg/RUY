import { NextResponse } from "next/server";
import { getPluggyEnvStatus } from "@/lib/env";
import { inspectPluggyConnectEnvironment } from "@/lib/pluggy/client";
import {
  isPluggyProductionConnect,
  maskPluggyClientId,
  pluggyConnectEnvironmentLabel,
  pluggyDevelopmentWidgetWarning,
} from "@/lib/pluggy/connect-config";
import { pluggyEnvironmentLabel, resolvePluggyWidgetSandbox } from "@/lib/pluggy/environment";

export const GET = async () => {
  const status = getPluggyEnvStatus();

  if (!status.credentialsConfigured || !status.clientId) {
    const missingHint =
      status.missing.length > 0
        ? `Variáveis ausentes: ${status.missing.join(", ")}.`
        : "Credenciais Pluggy incompletas.";

    return NextResponse.json(
      {
        credentialsConfigured: false,
        missing: status.missing,
        error: status.misconfigured ?? missingHint,
      },
      { status: 500 },
    );
  }

  const clientId = status.clientId;
  const clientIdHint = maskPluggyClientId(clientId);
  const isDesktop = process.env.DESKTOP === "1";

  try {
    const { connectConfig } = await inspectPluggyConnectEnvironment();
    const isProductionEnabled = isPluggyProductionConnect(connectConfig);
    const includeSandbox = resolvePluggyWidgetSandbox(clientId, connectConfig);
    const environment = isProductionEnabled ? "production" : "sandbox";
    const connectEnvironment = connectConfig.environment;
    const connectEnvironmentLabel = pluggyConnectEnvironmentLabel(connectConfig);

    return NextResponse.json({
      environment,
      environmentLabel: isProductionEnabled
        ? pluggyEnvironmentLabel("production")
        : connectEnvironmentLabel,
      connectEnvironment,
      connectEnvironmentLabel,
      isProductionEnabled,
      includeSandbox,
      isDesktop,
      clientIdHint,
      credentialsConfigured: true,
      developmentWidgetWarning: isProductionEnabled
        ? null
        : pluggyDevelopmentWidgetWarning(connectConfig),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível validar o ambiente Pluggy Connect.";

    return NextResponse.json(
      {
        credentialsConfigured: true,
        clientIdHint,
        isDesktop,
        error: message,
      },
      { status: 500 },
    );
  }
};
