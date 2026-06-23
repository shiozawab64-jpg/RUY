import { fetchMarketQuotes } from "@/lib/market/fetch-quotes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
  try {
    const payload = await fetchMarketQuotes();

    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar cotações de mercado.";

    return Response.json({ error: message }, { status: 502 });
  }
};
