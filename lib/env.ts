import { z } from "zod";

const serverEnvSchema = z.object({
  PLUGGY_CLIENT_ID: z.string().trim().min(1),
  PLUGGY_CLIENT_SECRET: z.string().trim().min(1),
  ANTHROPIC_API_KEY: z.string().trim().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const getServerEnv = (): ServerEnv => {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      "Configure PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET e ANTHROPIC_API_KEY em .env.local.",
    );
  }

  return parsed.data;
};
