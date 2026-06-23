"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketQuote } from "@/lib/market/types";

const REFRESH_MS = 60_000;

const FALLBACK_QUOTES: MarketQuote[] = [
  { id: "ibovespa", label: "Ibovespa", value: 0, changePercent: null, updatedAt: null },
  { id: "usdbrl", label: "USD/BRL", value: 0, changePercent: null, updatedAt: null },
  { id: "eurbrl", label: "EUR/BRL", value: 0, changePercent: null, updatedAt: null },
];

const formatQuoteValue = (quote: MarketQuote): string => {
  if (quote.value <= 0) {
    return "—";
  }

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

type QuoteStatus = "loading" | "ready" | "error";

export const useMarketQuotes = () => {
  const [quotes, setQuotes] = useState<MarketQuote[]>(FALLBACK_QUOTES);
  const [status, setStatus] = useState<QuoteStatus>("loading");

  const loadQuotes = useCallback(async () => {
    try {
      const response = await fetch("/api/market/quotes", { cache: "no-store" });
      const data = (await response.json()) as { quotes?: MarketQuote[]; error?: string };

      if (response.ok && data.quotes?.length) {
        setQuotes((current) => {
          const merged = FALLBACK_QUOTES.map((fallback) => {
            const fresh = data.quotes?.find((quote) => quote.id === fallback.id);
            return fresh ?? fallback;
          });
          return merged;
        });
        setStatus("ready");
        return;
      }

      setStatus((current) => (current === "loading" ? "error" : current));
    } catch {
      setStatus((current) => (current === "loading" ? "error" : current));
    }
  }, []);

  useEffect(() => {
    void loadQuotes();
    const intervalId = window.setInterval(() => void loadQuotes(), REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [loadQuotes]);

  return { quotes, status };
};

type InlineMarketTickerProps = {
  className?: string;
};

export const InlineMarketTicker = ({ className = "" }: InlineMarketTickerProps) => {
  const { quotes, status } = useMarketQuotes();
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      {isLoading ? (
        <span className="shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-paper/45">
          Atualizando…
        </span>
      ) : null}
      {hasError ? (
        <span
          className="shrink-0 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-amber-200/80"
          title="Cotações indisponíveis no momento"
        >
          Offline
        </span>
      ) : null}
      <ul className="flex min-w-0 flex-1 items-stretch gap-0 overflow-x-auto whitespace-nowrap">
        {quotes.map((quote, index) => (
          <li
            className={`flex shrink-0 items-center gap-2.5 px-4 py-1 text-[0.75rem] ${
              index > 0 ? "border-l border-white/12" : ""
            } ${isLoading ? "opacity-60" : ""}`}
            key={quote.id}
          >
            <span className="font-semibold tracking-[0.06em] text-accent">{quote.label}</span>
            <span className="ruy-numeric text-paper">{formatQuoteValue(quote)}</span>
            <span
              className={`ruy-numeric text-[0.6875rem] ${
                quote.changePercent !== null && quote.changePercent > 0
                  ? "text-emerald-300"
                  : quote.changePercent !== null && quote.changePercent < 0
                    ? "text-red-300"
                    : "text-paper/55"
              }`}
            >
              {formatChange(quote.changePercent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
