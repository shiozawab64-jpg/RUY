"use client";

import { useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market/types";

const FALLBACK_QUOTES: MarketQuote[] = [
  { id: "ibovespa", label: "Ibovespa", value: 0, changePercent: null, updatedAt: null },
  { id: "usdbrl", label: "USD/BRL", value: 0, changePercent: null, updatedAt: null },
  { id: "eurbrl", label: "EUR/BRL", value: 0, changePercent: null, updatedAt: null },
];

const formatQuoteValue = (quote: MarketQuote): string => {
  if (quote.id === "ibovespa") {
    return quote.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }

  return quote.value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const formatChange = (changePercent: number | null): string => {
  if (changePercent === null) {
    return "—";
  }

  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
};

export const useMarketQuotes = () => {
  const [quotes, setQuotes] = useState<MarketQuote[]>(FALLBACK_QUOTES);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const response = await fetch("/api/market/quotes");
        const data = (await response.json()) as { quotes?: MarketQuote[] };

        if (response.ok && data.quotes?.length) {
          setQuotes(data.quotes);
        }
      } catch {
        // Keep fallback display on failure
      }
    };

    void loadQuotes();
    const intervalId = window.setInterval(loadQuotes, 5 * 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return quotes;
};

type InlineMarketTickerProps = {
  className?: string;
};

export const InlineMarketTicker = ({ className = "" }: InlineMarketTickerProps) => {
  const quotes = useMarketQuotes();

  return (
    <ul className={`flex min-w-0 items-center gap-0 overflow-x-auto whitespace-nowrap ${className}`}>
      {quotes.map((quote, index) => (
        <li
          className={`flex shrink-0 items-center gap-2 px-3 text-[0.6875rem] ${
            index > 0 ? "border-l border-white/15" : ""
          }`}
          key={quote.id}
        >
          <span className="font-semibold tracking-wide text-accent">{quote.label}</span>
          <span className="ruy-numeric text-paper">{formatQuoteValue(quote)}</span>
          <span
            className={`ruy-numeric ${
              quote.changePercent !== null && quote.changePercent > 0
                ? "text-emerald-300"
                : quote.changePercent !== null && quote.changePercent < 0
                  ? "text-red-300"
                  : "text-paper/60"
            }`}
          >
            {formatChange(quote.changePercent)}
          </span>
        </li>
      ))}
    </ul>
  );
};
