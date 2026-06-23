import { z } from "zod";

const pluggyEnvSchema = z.object({
  PLUGGY_CLIENT_ID: z.string().trim().min(1),
  PLUGGY_CLIENT_SECRET: z.string().trim().min(1),
});

const serverEnvSchema = pluggyEnvSchema.extend({
  ANTHROPIC_API_KEY: z.string().trim().min(1),
});

export type PluggyEnv = z.infer<typeof pluggyEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type PluggyEnvStatus = {
  credentialsConfigured: boolean;
  missing: string[];
  misconfigured?: string;
  clientId?: string;
};

const PLUGGY_REQUIRED_KEYS = ["PLUGGY_CLIENT_ID", "PLUGGY_CLIENT_SECRET"] as const;

const missingPluggyKeys = (): string[] =>
  PLUGGY_REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());

const pluggyMisconfigurationHint = (): string | undefined => {
  const hasApiKeyAlias = Boolean(process.env.PLUGGY_API_KEY?.trim());
  const missing = missingPluggyKeys();

  if (!hasApiKeyAlias || missing.length === 0) {
    return undefined;
  }

  return (
    "Encontramos PLUGGY_API_KEY, mas este app usa PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET " +
    "(credenciais da aplicação no dashboard Pluggy). A API key efêmera gerada em /auth não " +
    "deve ser salva no Vercel."
  );
};

export const getPluggyEnvStatus = (): PluggyEnvStatus => {
  const missing = missingPluggyKeys();
  const misconfigured = pluggyMisconfigurationHint();

  if (missing.length > 0) {
    return {
      credentialsConfigured: false,
      missing,
      misconfigured,
    };
  }

  return {
    credentialsConfigured: true,
    missing: [],
    clientId: process.env.PLUGGY_CLIENT_ID?.trim(),
  };
};

export const getPluggyEnv = (): PluggyEnv => {
  const status = getPluggyEnvStatus();

  if (!status.credentialsConfigured) {
    const missingList = status.missing.join(", ");
    const hint = status.misconfigured ? ` ${status.misconfigured}` : "";

    throw new Error(`Configure ${missingList} no ambiente (Vercel ou .env.local).${hint}`);
  }

  return pluggyEnvSchema.parse(process.env);
};

export const getServerEnv = (): ServerEnv => {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      "Configure PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET e ANTHROPIC_API_KEY em .env.local.",
    );
  }

  return parsed.data;
};
