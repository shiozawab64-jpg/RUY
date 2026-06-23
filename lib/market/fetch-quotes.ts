import type { MarketQuote, MarketQuotesResponse } from "@/lib/market/types";

const AWESOME_API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL";
const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

const EXTERNAL_FETCH_INIT: RequestInit = {
  cache: "no-store",
  headers: {
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (compatible; PainelDoRuy/1.0; +https://ruy-two.vercel.app)",
  },
};

type AwesomeCurrencyQuote = {
  bid?: string;
  pctChange?: string;
  create_date?: string;
};

type AwesomeApiResponse = {
  USDBRL?: AwesomeCurrencyQuote;
  EURBRL?: AwesomeCurrencyQuote;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
    }>;
  };
};

const parseNumber = (value: string | number | undefined): number | null => {
  if (value === undefined) {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const computeChangePercent = (
  price: number | undefined,
  previousClose: number | undefined,
): number | null => {
  if (price === undefined || previousClose === undefined || previousClose <= 0) {
    return null;
  }

  return ((price - previousClose) / previousClose) * 100;
};

const fetchYahooChartQuote = async (
  symbol: string,
  id: MarketQuote["id"],
  label: string,
): Promise<MarketQuote> => {
  const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const response = await fetch(url, EXTERNAL_FETCH_INIT);

  if (!response.ok) {
    throw new Error(`Yahoo chart failed for ${symbol}: ${response.status}`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;

  if (price === undefined) {
    throw new Error(`Yahoo chart incomplete for ${symbol}`);
  }

  const updatedAt =
    meta?.regularMarketTime !== undefined
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null;

  return {
    id,
    label,
    value: price,
    changePercent: computeChangePercent(price, meta?.chartPreviousClose),
    updatedAt,
  };
};

const fetchFxFromAwesome = async (): Promise<MarketQuote[]> => {
  const response = await fetch(AWESOME_API_URL, EXTERNAL_FETCH_INIT);

  if (!response.ok) {
    throw new Error(`AwesomeAPI status ${response.status}`);
  }

  const data = (await response.json()) as AwesomeApiResponse;
  const usd = data.USDBRL;
  const eur = data.EURBRL;

  if (!usd?.bid || !eur?.bid) {
    throw new Error("AwesomeAPI response incomplete");
  }

  return [
    {
      id: "usdbrl",
      label: "USD/BRL",
      value: parseNumber(usd.bid) ?? 0,
      changePercent: parseNumber(usd.pctChange),
      updatedAt: usd.create_date ?? null,
    },
    {
      id: "eurbrl",
      label: "EUR/BRL",
      value: parseNumber(eur.bid) ?? 0,
      changePercent: parseNumber(eur.pctChange),
      updatedAt: eur.create_date ?? null,
    },
  ];
};

const fetchFxFromYahoo = async (): Promise<MarketQuote[]> => {
  const [usd, eur] = await Promise.all([
    fetchYahooChartQuote("USDBRL=X", "usdbrl", "USD/BRL"),
    fetchYahooChartQuote("EURBRL=X", "eurbrl", "EUR/BRL"),
  ]);

  return [usd, eur];
};

const fetchFxQuotes = async (): Promise<MarketQuote[]> => {
  try {
    return await fetchFxFromAwesome();
  } catch {
    return fetchFxFromYahoo();
  }
};

const fetchIbovespaQuote = async (): Promise<MarketQuote> => {
  try {
    return await fetchYahooChartQuote("^BVSP", "ibovespa", "Ibovespa");
  } catch {
    // Alternate Yahoo host occasionally succeeds when query1 is blocked.
    const url = `${YAHOO_CHART_BASE.replace("query1", "query2")}/${encodeURIComponent("^BVSP")}?interval=1d&range=1d`;
    const response = await fetch(url, EXTERNAL_FETCH_INIT);

    if (!response.ok) {
      throw new Error("Não foi possível carregar Ibovespa.");
    }

    const data = (await response.json()) as YahooChartResponse;
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;

    if (price === undefined) {
      throw new Error("Resposta do Ibovespa incompleta.");
    }

    return {
      id: "ibovespa",
      label: "Ibovespa",
      value: price,
      changePercent: computeChangePercent(price, meta?.chartPreviousClose),
      updatedAt:
        meta?.regularMarketTime !== undefined
          ? new Date(meta.regularMarketTime * 1000).toISOString()
          : null,
    };
  }
};

const fetchQuoteSafely = async (
  fetcher: () => Promise<MarketQuote | MarketQuote[]>,
): Promise<MarketQuote[]> => {
  try {
    const result = await fetcher();
    return Array.isArray(result) ? result : [result];
  } catch {
    return [];
  }
};

export const fetchMarketQuotes = async (): Promise<MarketQuotesResponse> => {
  const [ibovespaQuotes, fxQuotes] = await Promise.all([
    fetchQuoteSafely(fetchIbovespaQuote),
    fetchQuoteSafely(fetchFxQuotes),
  ]);

  const quotes = [...ibovespaQuotes, ...fxQuotes];

  if (quotes.length === 0) {
    throw new Error("Não foi possível carregar cotações de mercado.");
  }

  return {
    quotes,
    fetchedAt: new Date().toISOString(),
  };
};
