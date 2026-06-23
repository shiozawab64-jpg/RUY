import { NextResponse } from "next/server";
import { z } from "zod";
import { listAccountsForItems, listRecentTransactionsForAccounts } from "@/lib/pluggy/client";

const bodySchema = z.object({
  itemIds: z.array(z.string().uuid()),
});

export const POST = async (request: Request) => {
  try {
    const body = bodySchema.parse(await request.json());

    if (body.itemIds.length === 0) {
      return NextResponse.json({ transactions: [] });
    }

    const accounts = await listAccountsForItems(body.itemIds);
    const transactions = await listRecentTransactionsForAccounts(
      accounts.map((account) => ({
        id: account.id,
        bankName: account.bankName,
      })),
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Lista de contas inválida." }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Não foi possível carregar as transações.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
