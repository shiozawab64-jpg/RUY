import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";

const SYSTEM_PROMPT =
  "Você é um assistente financeiro pessoal. Analise os dados bancários fornecidos e responda SEMPRE em português brasileiro, de forma clara e direta, sem jargões. O usuário pode ter contas pessoais (PF) e contas da Holding Shiozawa (PJ), em BRL, USD e EUR — nunca some moedas diferentes.";

const analyticsSchema = z.object({
  monthsAnalyzed: z.number(),
  monthly: z.array(
    z.object({
      monthKey: z.string(),
      label: z.string(),
      expenses: z.number(),
      income: z.number(),
    }),
  ),
  byCategory: z.array(
    z.object({
      category: z.string(),
      total: z.number(),
      count: z.number(),
      share: z.number(),
    }),
  ),
  byBank: z.array(
    z.object({
      bankName: z.string(),
      total: z.number(),
      share: z.number(),
    }),
  ),
  autoInsights: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
      tone: z.enum(["info", "warning", "success"]),
    }),
  ),
  currentMonth: z.object({ expenses: z.number(), income: z.number() }),
  previousMonth: z.object({ expenses: z.number(), income: z.number() }),
  expenseChangePercent: z.number().nullable(),
  totalExpensesPeriod: z.number(),
  totalIncomePeriod: z.number(),
});

const bodySchema = z.object({
  totalBalance: z.number(),
  portfolio: z.string().optional(),
  currency: z.string().optional(),
  months: z.number().int().min(1).max(12).default(6),
  accounts: z.array(
    z.object({
      bankName: z.string(),
      accountType: z.string(),
      accountName: z.string(),
      balance: z.number(),
    }),
  ),
  analytics: analyticsSchema.nullish(),
  transactions: z
    .array(
      z.object({
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        category: z.string(),
        bankName: z.string(),
      }),
    )
    .optional(),
});

export const POST = async (request: Request) => {
  try {
    const body = bodySchema.parse(await request.json());
    const { ANTHROPIC_API_KEY } = getServerEnv();

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const portfolioLabel = body.portfolio ?? "Contas consolidadas";
    const currencyLabel = body.currency ?? "BRL";

    const userPrompt = `Analise os dados financeiros e responda com as seções abaixo (use títulos markdown):

## Resumo geral do período
## Onde está concentrado o dinheiro
## Maiores gastos por categoria
## Evolução dos últimos meses
## Alertas de cobranças recorrentes suspeitas
## 3 recomendações práticas para o Ruy

Contexto:
- Portfólio analisado: ${portfolioLabel}
- Moeda dos KPIs e gráficos: ${currencyLabel}

Dados:
- Saldo principal (${currencyLabel}): ${body.totalBalance.toFixed(2)}
- Período analisado: ${body.months} meses
- Contas: ${JSON.stringify(body.accounts, null, 2)}
- Analytics: ${JSON.stringify(body.analytics, null, 2)}
- Amostra de transações: ${JSON.stringify((body.transactions ?? []).slice(0, 120), null, 2)}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");

    if (textBlock?.type !== "text") {
      return NextResponse.json({ error: "A IA não retornou uma análise válida." }, { status: 502 });
    }

    return NextResponse.json({ analysis: textBlock.text });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados financeiros inválidos para análise." },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Não foi possível gerar a análise.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
