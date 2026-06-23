import { type NextRequest, NextResponse } from "next/server";
import { validateCronAuthorization } from "@/lib/cron-auth";
import { isKvConfigured } from "@/lib/kv/client";
import { syncAllRegisteredItems } from "@/lib/sync/run-sync";

export const maxDuration = 300;

export const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const auth = validateCronAuthorization(authHeader, process.env.CRON_SECRET);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: "KV não configurado. Defina KV_REST_API_URL e KV_REST_API_TOKEN." },
      { status: 503 },
    );
  }

  try {
    const summary = await syncAllRegisteredItems();
    const succeeded = summary.results.filter((result) => result.status === "success").length;
    const failed = summary.results.filter((result) => result.status === "error");

    console.info(
      `[cron/daily-sync] ${summary.ranAt}: ${succeeded}/${summary.results.length} itens sincronizados`,
    );

    for (const result of failed) {
      console.error(`[cron/daily-sync] item ${result.itemId}: ${result.error}`);
    }

    return NextResponse.json({
      ok: failed.length === 0,
      summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha na sincronização diária.";
    console.error("[cron/daily-sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
