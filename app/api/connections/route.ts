import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isKvConfigured } from "@/lib/kv/client";
import { syncItem } from "@/lib/sync/run-sync";
import {
  listRegisteredConnections,
  registerConnection,
  unregisterConnection,
} from "@/lib/sync/store";
import type { RegisteredConnection } from "@/lib/sync/types";

const connectionSchema = z.object({
  itemId: z.string().uuid(),
  bankName: z.string().trim().min(1),
  bankLogoUrl: z.string().nullable().optional(),
  connectedAt: z.string().datetime(),
  portfolio: z.enum(["pessoal", "holding"]),
  cnpj: z.string().nullable().optional(),
});

export const GET = async () => {
  if (!isKvConfigured()) {
    return NextResponse.json({ connections: [], kvConfigured: false });
  }

  const connections = await listRegisteredConnections();
  return NextResponse.json({ connections, kvConfigured: true });
};

export const POST = async (request: Request) => {
  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: "KV não configurado. Sincronização automática indisponível." },
      { status: 503 },
    );
  }

  try {
    const connection = connectionSchema.parse(await request.json()) satisfies RegisteredConnection;
    await registerConnection(connection);

    waitUntil(
      syncItem(connection.itemId).catch((error) => {
        console.error(`[connections] sync inicial falhou (${connection.itemId}):`, error);
      }),
    );

    return NextResponse.json({ ok: true, connection });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados de conexão inválidos." }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Não foi possível registrar a conexão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const DELETE = async (request: Request) => {
  if (!isKvConfigured()) {
    return NextResponse.json({ ok: true, kvConfigured: false });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId é obrigatório." }, { status: 400 });
    }

    await unregisterConnection(itemId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível remover o registro.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
