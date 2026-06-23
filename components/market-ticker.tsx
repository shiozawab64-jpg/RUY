"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketQuote, MarketQuoteId } from "@/lib/market/types";
import styles from "./market-ticker.module.css";

const REFRESH_MS = 60_000;

const QUOTE_ORDER: MarketQuoteId[] = [
  "ibovespa",
  "nasdaq",
  "sp500",
  "dow",
  "usdbrl",
  "eurbrl",
  "btc",
];

const FALLBACK_LABELS: Record<MarketQuoteId, string> = {
  ibovespa: "IBOV",
  nasdaq: "NASDAQ",
  sp500: "S&P 500",
  dow: "DOW",
  usdbrl: "USD/BRL",
  eurbrl: "EUR/BRL",
  btc: "BTC/USD",
};

const FALLBACK_QUOTES: MarketQuote[] = QUOTE_ORDER.map((id) => ({
  id,
  label: FALLBACK_LABELS[id],
  value: 0,
  changePercent: null,
  updatedAt: null,
}));

const isFxQuote = (id: MarketQuoteId): boolean => id === "usdbrl" || id === "eurbrl";

const formatQuoteValue = (quote: MarketQuote): string => {
  if (quote.value <= 0) {
    return "—";
  }

  if (isFxQuote(quote.id)) {
    return quote.value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return quote.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
};

const formatChange = (changePercent: number | null): string | null => {
  if (changePercent === null) {
    return null;
  }

  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

const changeClassName = (changePercent: number | null): string => {
  if (changePercent === null) {
    return "text-paper/55";
  }

  if (changePercent > 0) {
    return "text-emerald-300";
  }

  if (changePercent < 0) {
    return "text-red-300";
  }

  return "text-paper/55";
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
          const freshById = new Map(data.quotes?.map((quote) => [quote.id, quote]));

          return QUOTE_ORDER.map((id) => {
            const fresh = freshById.get(id);
            const fallback = FALLBACK_QUOTES.find((quote) => quote.id === id);
            const previous = current.find((quote) => quote.id === id);

            if (fresh && fresh.value > 0) {
              return fresh;
            }

            return previous ?? fallback!;
          });
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

type QuoteItemProps = {
  quote: MarketQuote;
  dimmed?: boolean;
};

const QuoteItem = ({ quote, dimmed = false }: QuoteItemProps) => {
  const change = formatChange(quote.changePercent);

  return (
    <span className={`${styles.item} ${dimmed ? "opacity-60" : ""}`}>
      <span className={styles.label}>{quote.label}</span>
      <span className="ruy-numeric text-paper">{formatQuoteValue(quote)}</span>
      {change ? (
        <span className={`ruy-numeric text-[0.6875rem] ${changeClassName(quote.changePercent)}`}>
          {change}
        </span>
      ) : null}
    </span>
  );
};

type QuoteSegmentProps = {
  quotes: MarketQuote[];
  copyIndex: number;
  dimmed?: boolean;
};

const QuoteSegment = ({ quotes, copyIndex, dimmed = false }: QuoteSegmentProps) => (
  <div aria-hidden={copyIndex === 1 || undefined} className={styles.segment}>
    {quotes.map((quote, index) => (
      <span key={`${quote.id}-${copyIndex}`}>
        {index > 0 ? <span className={styles.separator}>·</span> : null}
        <QuoteItem dimmed={dimmed} quote={quote} />
      </span>
    ))}
  </div>
);

type InlineMarketTickerProps = {
  className?: string;
};

export const InlineMarketTicker = ({ className = "" }: InlineMarketTickerProps) => {
  const { quotes, status } = useMarketQuotes();
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 ${className}`}>
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
      <div
        aria-label="Cotações de mercado em tempo real"
        aria-live="polite"
        className={styles.marquee}
        role="region"
      >
        <div className={styles.row}>
          <div className={styles.track}>
            <QuoteSegment copyIndex={0} dimmed={isLoading} quotes={quotes} />
            <QuoteSegment copyIndex={1} dimmed={isLoading} quotes={quotes} />
          </div>
        </div>
      </div>
    </div>
  );
};
