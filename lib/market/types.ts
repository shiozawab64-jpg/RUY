export type MarketQuote = {
  id: "ibovespa" | "usdbrl" | "eurbrl";
  label: string;
  value: number;
  changePercent: number | null;
  updatedAt: string | null;
};

export type MarketQuotesResponse = {
  quotes: MarketQuote[];
  fetchedAt: string;
};
