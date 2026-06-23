import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSpendingAnalytics } from "@/lib/analytics/spending";
import { listAccountsForItems, listTransactionsForAccounts } from "@/lib/pluggy/client";

const bodySchema = z.object({
  itemIds: z.array(z.string().uuid()),
  months: z.number().int().min(1).max(12).default(6),
});

export const POST = async (request: Request) => {
  try {
    const body = bodySchema.parse(await request.json());

    if (body.itemIds.length === 0) {
      return NextResponse.json({
        analytics: buildSpendingAnalytics([], body.months),
        accounts: [],
        totalBalance: 0,
      });
    }

    const accounts = await listAccountsForItems(body.itemIds);
    const transactions = await listTransactionsForAccounts(
      accounts.map((account) => ({
        id: account.id,
        bankName: account.bankName,
        currencyCode: account.currencyCode,
      })),
      body.months,
    );

    const analytics = buildSpendingAnalytics(transactions, body.months);
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return NextResponse.json({ analytics, accounts, totalBalance, transactions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Parâmetros de análise inválidos." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Não foi possível calcular os gastos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
