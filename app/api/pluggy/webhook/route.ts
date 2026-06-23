import { NextResponse } from "next/server";
import { isKvConfigured } from "@/lib/kv/client";
import {
  extractWebhookItemId,
  pluggyWebhookPayloadSchema,
  shouldSyncFromWebhook,
  verifyPluggyWebhookRequest,
} from "@/lib/pluggy/webhook";
import { syncItem } from "@/lib/sync/run-sync";

export const POST = async (request: Request) => {
  const auth = verifyPluggyWebhookRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Webhook não autorizado" }, { status: auth.status });
  }

  const parsed = pluggyWebhookPayloadSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const { event } = parsed.data;
  const itemId = extractWebhookItemId(parsed.data);

  // Pluggy expects 2xx before heavy work; sync runs fire-and-forget.
  if (shouldSyncFromWebhook(event, itemId) && isKvConfigured()) {
    void syncItem(itemId).catch((error) => {
      console.error(`[pluggy/webhook] sync falhou (${itemId}, ${event}):`, error);
    });
  }

  return NextResponse.json({ received: true, event });
};
