import type { MarketQuote, MarketQuoteId, MarketQuotesResponse } from "@/lib/market/types";

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

const INDEX_SYMBOLS: Array<{ symbol: string; id: MarketQuoteId; label: string }> = [
  { symbol: "^BVSP", id: "ibovespa", label: "IBOV" },
  { symbol: "^IXIC", id: "nasdaq", label: "NASDAQ" },
  { symbol: "^GSPC", id: "sp500", label: "S&P 500" },
  { symbol: "^DJI", id: "dow", label: "DOW" },
  { symbol: "BTC-USD", id: "btc", label: "BTC/USD" },
];

const QUOTE_ORDER: MarketQuoteId[] = [
  "ibovespa",
  "nasdaq",
  "sp500",
  "dow",
  "usdbrl",
  "eurbrl",
  "btc",
];

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

const fetchYahooChartFromHost = async (
  host: "query1" | "query2",
  symbol: string,
): Promise<YahooChartResponse> => {
  const base =
    host === "query1"
      ? YAHOO_CHART_BASE
      : YAHOO_CHART_BASE.replace("query1", "query2");
  const url = `${base}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const response = await fetch(url, EXTERNAL_FETCH_INIT);

  if (!response.ok) {
    throw new Error(`Yahoo chart failed for ${symbol}: ${response.status}`);
  }

  return (await response.json()) as YahooChartResponse;
};

const fetchYahooChartQuote = async (
  symbol: string,
  id: MarketQuoteId,
  label: string,
): Promise<MarketQuote> => {
  let data: YahooChartResponse;

  try {
    data = await fetchYahooChartFromHost("query1", symbol);
  } catch {
    data = await fetchYahooChartFromHost("query2", symbol);
  }

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

const fetchIndexQuotes = async (): Promise<MarketQuote[]> => {
  const results = await Promise.allSettled(
    INDEX_SYMBOLS.map(({ symbol, id, label }) => fetchYahooChartQuote(symbol, id, label)),
  );

  return results
    .filter((result): result is PromiseFulfilledResult<MarketQuote> => result.status === "fulfilled")
    .map((result) => result.value);
};

const sortQuotes = (quotes: MarketQuote[]): MarketQuote[] => {
  const byId = new Map(quotes.map((quote) => [quote.id, quote]));

  return QUOTE_ORDER.flatMap((id) => {
    const quote = byId.get(id);
    return quote ? [quote] : [];
  });
};

export const fetchMarketQuotes = async (): Promise<MarketQuotesResponse> => {
  const [indexQuotes, fxQuotes] = await Promise.all([
    fetchIndexQuotes(),
    fetchFxQuotes().catch(() => [] as MarketQuote[]),
  ]);

  const quotes = sortQuotes([...indexQuotes, ...fxQuotes]);

  if (quotes.length === 0) {
    throw new Error("Não foi possível carregar cotações de mercado.");
  }

  return {
    quotes,
    fetchedAt: new Date().toISOString(),
  };
};
