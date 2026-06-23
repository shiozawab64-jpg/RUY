export type { PortfolioKind } from "@/lib/pluggy/types";
import type { PortfolioKind } from "@/lib/pluggy/types";

export type PortfolioFilter = PortfolioKind | "geral";

export type SupportedCurrency = "BRL" | "USD" | "EUR";

export type CurrencyFilter = SupportedCurrency | "all";

export const HOLDING_SHIOZAWA = {
  name: "Holding Shiozawa",
  cnpj: "12.345.678/0001-90",
} as const;

export const PORTFOLIO_FILTER_ORDER: PortfolioFilter[] = ["pessoal", "holding", "geral"];

export const ASSIGN_PORTFOLIO_ORDER: PortfolioKind[] = ["pessoal", "holding"];

export const PORTFOLIO_META: Record<
  PortfolioFilter,
  { label: string; subtitle: string; badge: string }
> = {
  pessoal: {
    label: "Contas pessoais",
    subtitle: "Pessoa física · BRL, USD e EUR",
    badge: "PF",
  },
  holding: {
    label: "Holding Shiozawa",
    subtitle: `CNPJ ${HOLDING_SHIOZAWA.cnpj}`,
    badge: "PJ",
  },
  geral: {
    label: "Visão geral",
    subtitle: "PF + Holding Shiozawa · todas as contas e moedas",
    badge: "Tudo",
  },
};

export const CURRENCY_OPTIONS: Array<{ value: CurrencyFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "BRL", label: "BRL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export type CurrencyBalanceSummary = {
  currency: SupportedCurrency;
  total: number;
  accountCount: number;
};
