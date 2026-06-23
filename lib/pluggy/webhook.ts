import { z } from "zod";

/** Pluggy webhook payload. See https://docs.pluggy.ai/docs/webhooks */
export const pluggyWebhookPayloadSchema = z
  .object({
    event: z.string(),
    eventId: z.string().optional(),
    itemId: z.string().uuid().optional(),
    /** Some payloads (e.g. transactions/created) duplicate itemId as `id`. */
    id: z.string().uuid().optional(),
  })
  .passthrough();

export type PluggyWebhookPayload = z.infer<typeof pluggyWebhookPayloadSchema>;

/** Item and transaction events that should trigger a cache refresh when itemId is present. */
export const PLUGGY_SYNC_WEBHOOK_EVENTS = new Set([
  "item/created",
  "item/updated",
  "item/login_succeeded",
  "transactions/created",
  "transactions/updated",
  "transactions/deleted",
]);

export const extractWebhookItemId = (payload: PluggyWebhookPayload): string | undefined =>
  payload.itemId ?? payload.id;

export const shouldSyncFromWebhook = (event: string, itemId: string | undefined): itemId is string =>
  Boolean(itemId && PLUGGY_SYNC_WEBHOOK_EVENTS.has(event));

/**
 * Pluggy does not sign webhooks with `x-pluggy-signature`.
 * Optional auth: set PLUGGY_WEBHOOK_SECRET and configure the same value as a custom
 * header when creating the webhook via API (e.g. `X-Webhook-Secret`).
 */
export const getPluggyWebhookSecret = (): string | null => {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
};

export const verifyPluggyWebhookRequest = (
  request: Request,
): { ok: true } | { ok: false; status: 401 } => {
  const expected = getPluggyWebhookSecret();
  if (!expected) {
    return { ok: true };
  }

  const provided =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;

  if (provided !== expected) {
    return { ok: false, status: 401 };
  }

  return { ok: true };
};
