import { fetchMarketQuotes } from "@/lib/market/fetch-quotes";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const payload = await fetchMarketQuotes();

    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar cotações de mercado.";

    return Response.json({ error: message }, { status: 502 });
  }
};
