export type MarketQuoteId =
  | "ibovespa"
  | "nasdaq"
  | "sp500"
  | "dow"
  | "usdbrl"
  | "eurbrl"
  | "btc";

export type MarketQuote = {
  id: MarketQuoteId;
  label: string;
  value: number;
  changePercent: number | null;
  updatedAt: string | null;
};

export type MarketQuotesResponse = {
  quotes: MarketQuote[];
  fetchedAt: string;
};
