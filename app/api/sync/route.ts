import { NextResponse } from "next/server";
import { z } from "zod";
import { isKvConfigured } from "@/lib/kv/client";
import { syncItems } from "@/lib/sync/run-sync";

const bodySchema = z.object({
  itemIds: z.array(z.string().uuid()).optional(),
});

export const POST = async (request: Request) => {
  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: "KV não configurado. Sincronização indisponível." },
      { status: 503 },
    );
  }

  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const itemIds = body.itemIds ?? [];

    if (itemIds.length === 0) {
      return NextResponse.json(
        { error: "Informe ao menos um itemId para sincronizar." },
        { status: 400 },
      );
    }

    const summary = await syncItems(itemIds);
    const failed = summary.results.filter((result) => result.status === "error");

    return NextResponse.json({
      ok: failed.length === 0,
      summary,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parâmetros de sincronização inválidos." },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Não foi possível sincronizar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
