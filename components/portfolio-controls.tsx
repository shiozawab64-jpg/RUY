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

export const PortfolioSelector = (props: PortfolioSelectorProps) => {
  if (props.variant === "assign") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {ASSIGN_PORTFOLIO_ORDER.map((portfolio) => {
          const meta = PORTFOLIO_META[portfolio];
          const active = props.value === portfolio;

          return (
            <button
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
              }`}
              key={portfolio}
              onClick={() => props.onChange(portfolio)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {meta.badge}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold">{meta.label}</p>
              <p className={`mt-1 text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
                {meta.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PORTFOLIO_FILTER_ORDER.map((portfolio) => {
        const meta = PORTFOLIO_META[portfolio];
        const active = props.value === portfolio;

        return (
          <button
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              active
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
            }`}
            key={portfolio}
            onClick={() => props.onChange(portfolio)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {meta.badge}
              </span>
            </div>
            <p className="mt-3 text-base font-semibold">{meta.label}</p>
            <p className={`mt-1 text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
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
  <div className="flex flex-wrap gap-2">
    {CURRENCY_OPTIONS.map((option) => (
      <button
        className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
          value === option.value
            ? "bg-slate-950 text-white"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
