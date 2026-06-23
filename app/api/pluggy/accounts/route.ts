import { NextResponse } from "next/server";
import { z } from "zod";
import { listAccountsForItems } from "@/lib/pluggy/client";

const bodySchema = z.object({
  itemIds: z.array(z.string().uuid()),
});

export const POST = async (request: Request) => {
  try {
    const body = bodySchema.parse(await request.json());

    if (body.itemIds.length === 0) {
      return NextResponse.json({ accounts: [], totalBalance: 0 });
    }

    const accounts = await listAccountsForItems(body.itemIds);
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return NextResponse.json({ accounts, totalBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Lista de contas inválida." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Não foi possível carregar as contas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
