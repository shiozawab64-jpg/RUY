import type { CurrencyBalanceSummary, PortfolioFilter } from "@/lib/portfolio/types";
import { PORTFOLIO_META } from "@/lib/portfolio/types";
import { AnimatedCounter } from "@/components/animated-counter";
import { formatCurrency } from "@/lib/format";

type CurrencyBalancesProps = {
  portfolio: PortfolioFilter;
  balances: CurrencyBalanceSummary[];
};

const PRIMARY_CURRENCY_ORDER = ["BRL", "USD", "EUR"] as const;

const sortBalances = (balances: CurrencyBalanceSummary[]): CurrencyBalanceSummary[] =>
  [...balances].sort((a, b) => {
    const aIndex = PRIMARY_CURRENCY_ORDER.indexOf(
      a.currency as typeof PRIMARY_CURRENCY_ORDER[number],
    );
    const bIndex = PRIMARY_CURRENCY_ORDER.indexOf(
      b.currency as typeof PRIMARY_CURRENCY_ORDER[number],
    );
    const aRank = aIndex === -1 ? PRIMARY_CURRENCY_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? PRIMARY_CURRENCY_ORDER.length : bIndex;
    return aRank - bRank;
  });

export const CurrencyBalances = ({ portfolio, balances }: CurrencyBalancesProps) => {
  const meta = PORTFOLIO_META[portfolio];
  const sortedBalances = sortBalances(balances);
  const heroBalance = sortedBalances[0];
  const secondaryBalances = sortedBalances.slice(1);

  if (balances.length === 0) {
    return (
      <section className="border border-dashed border-rule bg-paper-muted px-8 py-12 text-center">
        <p className="text-sm text-muted">Nenhuma conta em {meta.label}.</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {heroBalance ? (
        <article className="grid gap-0 border-2 border-ink bg-ink text-paper lg:grid-cols-[1fr_auto]">
          <div className="px-8 py-10 sm:px-10 sm:py-12">
            <p className="ruy-section-label text-accent">Patrimônio consolidado</p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {meta.label}
            </p>
            {portfolio === "holding" ? (
              <p className="ruy-numeric mt-2 text-xs text-paper/45">
                CNPJ {meta.subtitle.replace("CNPJ ", "")}
              </p>
            ) : portfolio === "geral" ? (
              <p className="mt-2 text-xs text-paper/45">{meta.subtitle}</p>
            ) : null}

            <div className="mt-10">
              <p className="ruy-section-label text-accent">{heroBalance.currency}</p>
              <p
                className={`mt-3 ruy-numeric text-5xl font-medium tracking-tight sm:text-6xl lg:text-7xl ${
                  heroBalance.total < 0 ? "text-red-300" : "text-paper"
                }`}
              >
                <AnimatedCounter
                  format={(value) => formatCurrency(value, heroBalance.currency)}
                  value={heroBalance.total}
                />
              </p>
              <p className="ruy-numeric mt-4 text-sm text-paper/55">
                {heroBalance.accountCount} conta(s) nesta moeda
              </p>
            </div>
          </div>

          {secondaryBalances.length > 0 ? (
            <div className="grid border-t border-white/12 lg:border-t-0 lg:border-l lg:grid-cols-1">
              {secondaryBalances.map((balance, index) => (
                <div
                  className={`px-8 py-6 sm:px-10 ${
                    index > 0 ? "border-t border-white/12" : ""
                  }`}
                  key={balance.currency}
                >
                  <p className="ruy-section-label text-paper/55">{balance.currency}</p>
                  <p
                    className={`mt-2 ruy-numeric text-2xl font-medium tracking-tight ${
                      balance.total < 0 ? "text-red-300" : "text-paper"
                    }`}
                  >
                    <AnimatedCounter
                      format={(value) => formatCurrency(value, balance.currency)}
                      value={balance.total}
                    />
                  </p>
                  <p className="ruy-numeric mt-1.5 text-xs text-paper/45">
                    {balance.accountCount} conta(s)
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}

      <p className="text-xs leading-relaxed text-muted">
        Moedas não são convertidas entre si — cada total reflete apenas contas na mesma moeda.
      </p>
    </section>
  );
};
