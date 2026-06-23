import { NextResponse } from "next/server";
import { deleteItem } from "@/lib/pluggy/client";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  try {
    const { itemId } = await context.params;
    await deleteItem(itemId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível remover a conexão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
