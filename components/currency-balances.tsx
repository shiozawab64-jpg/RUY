import type { CurrencyBalanceSummary, PortfolioFilter } from "@/lib/portfolio/types";
import { PORTFOLIO_META } from "@/lib/portfolio/types";
import { formatCurrency } from "@/lib/format";

type CurrencyBalancesProps = {
  portfolio: PortfolioFilter;
  balances: CurrencyBalanceSummary[];
};

export const CurrencyBalances = ({ portfolio, balances }: CurrencyBalancesProps) => {
  const meta = PORTFOLIO_META[portfolio];

  if (balances.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
        <p className="text-sm text-slate-600">Nenhuma conta em {meta.label}.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm text-slate-500">Saldo consolidado · {meta.label}</p>
        {portfolio === "holding" ? (
          <p className="text-xs text-slate-400">CNPJ {meta.subtitle.replace("CNPJ ", "")}</p>
        ) : portfolio === "geral" ? (
          <p className="text-xs text-slate-400">{meta.subtitle}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {balances.map((balance) => (
          <article
            className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-5 text-white"
            key={balance.currency}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{balance.currency}</p>
            <p
              className={`mt-2 text-3xl font-semibold tracking-tight ${
                balance.total < 0 ? "text-rose-300" : "text-white"
              }`}
            >
              {formatCurrency(balance.total, balance.currency)}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {balance.accountCount} conta(s) nesta moeda
            </p>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Moedas não são convertidas entre si — cada total reflete apenas contas na mesma moeda.
      </p>
    </section>
  );
};
