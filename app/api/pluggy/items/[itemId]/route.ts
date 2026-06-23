import { NextResponse } from "next/server";
import { isKvConfigured } from "@/lib/kv/client";
import { deleteItem } from "@/lib/pluggy/client";
import { unregisterConnection } from "@/lib/sync/store";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  try {
    const { itemId } = await context.params;
    await deleteItem(itemId);

    if (isKvConfigured()) {
      await unregisterConnection(itemId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível remover a conexão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
