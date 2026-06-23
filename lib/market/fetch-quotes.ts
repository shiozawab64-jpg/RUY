import type { MarketQuote, MarketQuotesResponse } from "@/lib/market/types";

const AWESOME_API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL";
const YAHOO_IBOVESPA_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=1d";

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

const fetchFxQuotes = async (): Promise<MarketQuote[]> => {
  const response = await fetch(AWESOME_API_URL, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar câmbio USD/EUR.");
  }

  const data = (await response.json()) as AwesomeApiResponse;

  const usd = data.USDBRL;
  const eur = data.EURBRL;

  if (!usd?.bid || !eur?.bid) {
    throw new Error("Resposta de câmbio incompleta.");
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

const fetchIbovespaQuote = async (): Promise<MarketQuote> => {
  const response = await fetch(YAHOO_IBOVESPA_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GPMH-PainelDoRuy/1.0)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar Ibovespa.");
  }

  const data = (await response.json()) as YahooChartResponse;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose;

  if (price === undefined) {
    throw new Error("Resposta do Ibovespa incompleta.");
  }

  const changePercent =
    previousClose && previousClose > 0
      ? ((price - previousClose) / previousClose) * 100
      : null;

  const updatedAt =
    meta?.regularMarketTime !== undefined
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null;

  return {
    id: "ibovespa",
    label: "Ibovespa",
    value: price,
    changePercent,
    updatedAt,
  };
};

export const fetchMarketQuotes = async (): Promise<MarketQuotesResponse> => {
  const [fxQuotes, ibovespa] = await Promise.all([fetchFxQuotes(), fetchIbovespaQuote()]);

  return {
    quotes: [ibovespa, ...fxQuotes],
    fetchedAt: new Date().toISOString(),
  };
};
