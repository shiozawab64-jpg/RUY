"use client";

import type { PortfolioKind } from "@/lib/pluggy/types";
import type { CurrencyFilter, PortfolioFilter } from "@/lib/portfolio/types";
import {
  ASSIGN_PORTFOLIO_ORDER,
  CURRENCY_OPTIONS,
  PORTFOLIO_FILTER_ORDER,
  PORTFOLIO_META,
} from "@/lib/portfolio/types";

type PortfolioSelectorViewProps = {
  variant?: "view";
  value: PortfolioFilter;
  onChange: (value: PortfolioFilter) => void;
};

type PortfolioSelectorAssignProps = {
  variant: "assign";
  value: PortfolioKind;
  onChange: (value: PortfolioKind) => void;
};

type PortfolioSelectorProps = PortfolioSelectorViewProps | PortfolioSelectorAssignProps;

const portfolioButtonClass = (active: boolean) =>
  active
    ? "border-ink bg-ink text-paper"
    : "border-rule bg-white text-ink hover:bg-paper-muted";

const badgeClass = (active: boolean) =>
  active ? "bg-paper/15 text-paper" : "bg-paper-muted text-muted";

export const PortfolioSelector = (props: PortfolioSelectorProps) => {
  if (props.variant === "assign") {
    return (
      <div className="grid gap-0 border border-rule sm:grid-cols-2">
        {ASSIGN_PORTFOLIO_ORDER.map((portfolio, index) => {
          const meta = PORTFOLIO_META[portfolio];
          const active = props.value === portfolio;

          return (
            <button
              className={`border px-4 py-4 text-left transition ${portfolioButtonClass(active)} ${
                index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""
              }`}
              key={portfolio}
              onClick={() => props.onChange(portfolio)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass(active)}`}
                >
                  {meta.badge}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold">{meta.label}</p>
              <p className={`mt-1 text-sm ${active ? "text-paper/65" : "text-muted"}`}>
                {meta.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-0 border border-rule sm:grid-cols-2 lg:grid-cols-3">
      {PORTFOLIO_FILTER_ORDER.map((portfolio, index) => {
        const meta = PORTFOLIO_META[portfolio];
        const active = props.value === portfolio;

        return (
          <button
            className={`border px-4 py-4 text-left transition ${portfolioButtonClass(active)} ${
              index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""
            } ${index >= 2 ? "lg:border-t lg:border-l-0" : ""}`}
            key={portfolio}
            onClick={() => props.onChange(portfolio)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass(active)}`}
              >
                {meta.badge}
              </span>
            </div>
            <p className="mt-3 text-base font-semibold">{meta.label}</p>
            <p className={`mt-1 text-sm ${active ? "text-paper/65" : "text-muted"}`}>
              {meta.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
};

type CurrencySelectorProps = {
  value: CurrencyFilter;
  onChange: (value: CurrencyFilter) => void;
};

export const CurrencySelector = ({ value, onChange }: CurrencySelectorProps) => (
  <div className="flex flex-wrap gap-0 border border-rule">
    {CURRENCY_OPTIONS.map((option, index) => (
      <button
        className={`px-3 py-2 text-sm font-medium transition ${
          index > 0 ? "border-l border-rule" : ""
        } ${
          value === option.value
            ? "bg-ink text-paper"
            : "bg-white text-ink hover:bg-paper-muted"
        }`}
        key={option.value}
        onClick={() => onChange(option.value)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);
