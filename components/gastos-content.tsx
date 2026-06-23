"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AutoInsightsCards } from "@/components/auto-insights-cards";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { CurrencyBalances } from "@/components/currency-balances";
import { DemoBanner } from "@/components/demo-banner";
import { InsightsPanel } from "@/components/insights-panel";
import { CurrencySelector, PortfolioSelector } from "@/components/portfolio-controls";
import { SyncStatusBar } from "@/components/sync-status-bar";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { SpendingAnalytics } from "@/lib/analytics/spending";
import { DEMO_AI_ANALYSIS, getDemoSnapshot } from "@/lib/demo/fixtures";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DashboardAccount, DashboardTransaction } from "@/lib/pluggy/types";
import {
  buildPortfolioAnalytics,
  enrichAccounts,
  enrichTransactions,
  filterAccounts,
  summarizeBalancesByCurrency,
} from "@/lib/portfolio/filters";
import type { CurrencyFilter, PortfolioFilter } from "@/lib/portfolio/types";
import { PORTFOLIO_META } from "@/lib/portfolio/types";
import { getItemIds, readConnections } from "@/lib/session/connections";
import { triggerSyncOnServer } from "@/lib/session/register-connection";
import type { FinancialDataSource } from "@/lib/sync/types";

type RawAccount = Omit<DashboardAccount, "portfolio">;
type RawTransaction = Omit<DashboardTransaction, "portfolio">;

const PERIOD_OPTIONS = [
  { months: 3, label: "3 meses" },
  { months: 6, label: "6 meses" },
  { months: 12, label: "12 meses" },
];

export const GastosContent = () => {
  const [months, setMonths] = useState(6);
  const [portfolio, setPortfolio] = useState<PortfolioFilter>("pessoal");
  const [currency, setCurrency] = useState<CurrencyFilter>("all");
  const [allAccounts, setAllAccounts] = useState<DashboardAccount[]>([]);
  const [allTransactions, setAllTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<FinancialDataSource | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async (periodMonths: number) => {
    setLoading(true);
    setError(null);

    const itemIds = getItemIds();

    if (itemIds.length === 0) {
      const demo = getDemoSnapshot();
      setAllAccounts(demo.accounts);
      setAllTransactions(demo.transactions);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    setIsDemo(false);

    try {
      const response = await fetch("/api/pluggy/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds, months: periodMonths }),
      });

      const data = (await response.json()) as {
        accounts?: RawAccount[];
        transactions?: RawTransaction[];
        meta?: { source?: FinancialDataSource; lastSyncedAt?: string | null };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao carregar análise de gastos.");
      }

      const connections = readConnections();
      const accounts = enrichAccounts(data.accounts ?? [], connections);
      setAllAccounts(accounts);
      setAllTransactions(enrichTransactions(data.transactions ?? [], accounts));
      setDataSource(data.meta?.source ?? null);
      setLastSyncedAt(data.meta?.lastSyncedAt ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Não foi possível carregar os gastos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    const itemIds = getItemIds();
    if (itemIds.length === 0) {
      return;
    }

    setRefreshing(true);
    setError(null);

    const syncResult = await triggerSyncOnServer(itemIds);
    if (!syncResult.ok) {
      setError(syncResult.error ?? "Não foi possível atualizar os dados.");
      setRefreshing(false);
      return;
    }

    await loadAnalytics(months);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadAnalytics(months);
  }, [loadAnalytics, months]);

  const enrichedAccounts = allAccounts;
  const enrichedTransactions = allTransactions;

  const filteredAccounts = useMemo(
    () => filterAccounts(enrichedAccounts, portfolio, currency),
    [enrichedAccounts, portfolio, currency],
  );

  const currencyBalances = useMemo(
    () => summarizeBalancesByCurrency(enrichedAccounts, portfolio),
    [enrichedAccounts, portfolio],
  );

  const analytics: SpendingAnalytics | null = useMemo(
    () => buildPortfolioAnalytics(enrichedTransactions, portfolio, currency, months),
    [enrichedTransactions, portfolio, currency, months],
  );

  const analyticsCurrency = currency === "all" ? "BRL" : currency;
  const portfolioMeta = PORTFOLIO_META[portfolio];

  const generateInsights = async () => {
    if (!analytics) {
      return;
    }

    setInsightsOpen(true);
    setInsightsLoading(true);
    setInsightsError(null);
    setAnalysis(null);

    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAnalysis(DEMO_AI_ANALYSIS);
      setInsightsLoading(false);
      return;
    }

    const primaryBalance =
      currencyBalances.find((balance) => balance.currency === analyticsCurrency)?.total ?? 0;

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalBalance: primaryBalance,
          portfolio: portfolioMeta.label,
          currency: analyticsCurrency,
          accounts: filteredAccounts,
          months,
          analytics,
        }),
      });

      const data = (await response.json()) as {
        analysis?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível gerar a análise.");
      }

      setAnalysis(data.analysis ?? null);
    } catch (insightsFailure) {
      setInsightsError(
        insightsFailure instanceof Error ? insightsFailure.message : "Erro ao consultar a IA.",
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <header className="border-b-2 border-ink pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="ruy-section-label">Para o Ruy</p>
              <h2 className="ruy-headline mt-1 text-4xl">Gastos & insights</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Análise por portfólio — pessoal, holding ou visão geral — com saldos em BRL, USD e
                EUR sem conversão cruzada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  className={`px-3 py-2 text-sm font-semibold uppercase tracking-[0.06em] transition ${
                    months === option.months
                      ? "border border-ink bg-ink text-paper"
                      : "ruy-card bg-white text-ink-muted hover:border-ink-muted"
                  }`}
                  key={option.months}
                  onClick={() => setMonths(option.months)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
              <button
                className="ruy-btn-primary"
                disabled={!analytics || loading}
                onClick={() => void generateInsights()}
                type="button"
              >
                Análise com IA
              </button>
            </div>
          </div>
        </header>

        <section>
          <p className="ruy-section-label mb-3">Portfólio</p>
          <PortfolioSelector onChange={setPortfolio} value={portfolio} />
        </section>

        <div>
          <p className="ruy-section-label mb-2">Filtrar por moeda</p>
          <CurrencySelector onChange={setCurrency} value={currency} />
        </div>

        {isDemo ? <DemoBanner /> : null}
        {!isDemo && !loading ? (
          <SyncStatusBar
            lastSyncedAt={lastSyncedAt}
            onRefresh={() => void handleRefresh()}
            refreshing={refreshing}
            source={dataSource}
          />
        ) : null}
        {loading ? <LoadingSpinner label="Calculando gastos do portfólio selecionado…" /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!loading && analytics ? (
          <>
            <CurrencyBalances balances={currencyBalances} portfolio={portfolio} />

            {currency === "all" ? (
              <p className="text-xs text-muted">
                KPIs e gráficos usam lançamentos em BRL. Selecione USD ou EUR para outra moeda.
              </p>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="ruy-card p-4">
                <p className="ruy-section-label">Gastos este mês</p>
                <p className="mt-2 font-display text-2xl font-bold text-negative">
                  {formatCurrency(analytics.currentMonth.expenses, analyticsCurrency)}
                </p>
              </article>
              <article className="ruy-card p-4">
                <p className="ruy-section-label">Mês anterior</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink">
                  {formatCurrency(analytics.previousMonth.expenses, analyticsCurrency)}
                </p>
              </article>
              <article className="ruy-card p-4">
                <p className="ruy-section-label">No período</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink">
                  {formatCurrency(analytics.totalExpensesPeriod, analyticsCurrency)}
                </p>
              </article>
              <article className="ruy-card p-4">
                <p className="ruy-section-label">Contas ativas</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink">
                  {filteredAccounts.length}
                </p>
                <p className="mt-1 text-xs text-muted">{portfolioMeta.label}</p>
              </article>
            </section>

            <section className="space-y-4">
              <h3 className="ruy-headline border-b border-rule pb-2 text-lg">
                Feedback automático
              </h3>
              <AutoInsightsCards insights={analytics.autoInsights} />
            </section>

            <AnalyticsCharts analytics={analytics} currency={analyticsCurrency} />

            <section className="ruy-card p-5">
              <h3 className="ruy-headline text-lg">Detalhe por categoria</h3>
              <p className="mt-1 text-sm text-muted">
                Lista completa com volume e participação ({analyticsCurrency})
              </p>
              <hr className="ruy-rule my-4" />
              <CategoryBreakdown categories={analytics.byCategory} currency={analyticsCurrency} />
            </section>

            <section className="ruy-card p-5">
              <h3 className="ruy-headline text-lg">Maiores despesas</h3>
              <hr className="ruy-rule my-4" />
              <ul className="space-y-3">
                {analytics.topExpenses.map((expense) => (
                  <li className="border-b border-rule pb-3 text-sm last:border-0" key={expense.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{expense.description}</p>
                        <p className="text-xs text-muted">
                          {formatDate(expense.date)} · {expense.category} · {expense.bankName}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-semibold text-negative">
                        {formatCurrency(Math.abs(expense.amount), analyticsCurrency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {isDemo ? (
              <div className="border border-rule bg-paper-muted px-5 py-4 text-center">
                <p className="text-sm text-ink-muted">
                  Quando conectar os bancos reais, PF e holding entram nos portfólios corretos
                  automaticamente.
                </p>
                <Link className="ruy-btn-primary mt-3" href="/connect">
                  Conectar contas
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <InsightsPanel
        analysis={analysis}
        error={insightsError}
        loading={insightsLoading}
        onClose={() => setInsightsOpen(false)}
        open={insightsOpen}
      />
    </>
  );
};
