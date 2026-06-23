"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { CurrencyBalances } from "@/components/currency-balances";
import { DemoBanner } from "@/components/demo-banner";
import { InsightsPanel } from "@/components/insights-panel";
import { CurrencySelector, PortfolioSelector } from "@/components/portfolio-controls";
import { RuyBrand } from "@/components/ruy-brand";
import { BankLogo } from "@/components/ui/bank-logo";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { SpendingAnalytics } from "@/lib/analytics/spending";
import { DEMO_AI_ANALYSIS, getDemoSnapshot } from "@/lib/demo/fixtures";
import { amountClassName, formatCurrency, formatDate } from "@/lib/format";
import type { DashboardAccount, DashboardTransaction } from "@/lib/pluggy/types";
import {
  buildPortfolioAnalytics,
  enrichAccounts,
  enrichTransactions,
  filterAccounts,
  filterTransactions,
  summarizeBalancesByCurrency,
} from "@/lib/portfolio/filters";
import type { CurrencyFilter, PortfolioFilter } from "@/lib/portfolio/types";
import { PORTFOLIO_META } from "@/lib/portfolio/types";
import { getItemIds, readConnections } from "@/lib/session/connections";

type RawAccount = Omit<DashboardAccount, "portfolio">;
type RawTransaction = Omit<DashboardTransaction, "portfolio">;

export const DashboardContent = () => {
  const [allAccounts, setAllAccounts] = useState<DashboardAccount[]>([]);
  const [allTransactions, setAllTransactions] = useState<DashboardTransaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioFilter>("pessoal");
  const [currency, setCurrency] = useState<CurrencyFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
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
      const analyticsResponse = await fetch("/api/pluggy/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds, months: 6 }),
      });

      const analyticsData = (await analyticsResponse.json()) as {
        accounts?: RawAccount[];
        transactions?: RawTransaction[];
        error?: string;
      };

      if (!analyticsResponse.ok) {
        throw new Error(analyticsData.error ?? "Erro ao carregar dados do painel.");
      }

      const connections = readConnections();
      const accounts = enrichAccounts(analyticsData.accounts ?? [], connections);
      setAllAccounts(accounts);
      setAllTransactions(enrichTransactions(analyticsData.transactions ?? [], accounts));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Não foi possível carregar o painel.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const connections = readConnections();

  const filteredAccounts = useMemo(
    () => filterAccounts(allAccounts, portfolio, currency),
    [allAccounts, portfolio, currency],
  );

  const filteredTransactions = useMemo(
    () => filterTransactions(allTransactions, portfolio, currency).slice(0, 30),
    [allTransactions, portfolio, currency],
  );

  const currencyBalances = useMemo(
    () => summarizeBalancesByCurrency(allAccounts, portfolio),
    [allAccounts, portfolio],
  );

  const analytics: SpendingAnalytics | null = useMemo(
    () => buildPortfolioAnalytics(allTransactions, portfolio, currency, 6),
    [allTransactions, portfolio, currency],
  );

  const analyticsCurrency = currency === "all" ? "BRL" : currency;
  const portfolioMeta = PORTFOLIO_META[portfolio];
  const connectionCount =
    portfolio === "geral"
      ? isDemo
        ? new Set(allAccounts.map((account) => account.itemId)).size
        : connections.length
      : isDemo
        ? allAccounts.filter((account) => account.portfolio === portfolio).length
        : connections.filter((connection) => connection.portfolio === portfolio).length;

  const generateInsights = async () => {
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
          months: 6,
          analytics,
          transactions: filteredTransactions,
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
      <div className="ruy-page-stack">
        <header className="border-b-2 border-ink pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <RuyBrand showTitle={false} size="lg" />
              <div>
                <p className="ruy-section-label">Olá, Ruy</p>
                <h2 className="ruy-headline mt-2 text-4xl sm:text-5xl">Dashboard</h2>
                <p className="mt-2 text-sm text-muted">
                  {connectionCount} banco(s) · {filteredAccounts.length} conta(s) ·{" "}
                  {portfolioMeta.label}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="ruy-btn-secondary" href="/gastos">
                Ver gastos & insights
              </Link>
              <button
                className="ruy-btn-primary"
                disabled={loading || filteredAccounts.length === 0}
                onClick={() => void generateInsights()}
                type="button"
              >
                Gerar análise
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

        {isDemo ? <DemoBanner compact /> : null}
        {loading ? <LoadingSpinner label="Carregando saldos e transações…" /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!loading && !error ? (
          <>
            <CurrencyBalances balances={currencyBalances} portfolio={portfolio} />

            {currency === "all" && analytics ? (
              <p className="text-xs text-muted">
                KPIs e gráficos abaixo usam lançamentos em BRL. Selecione USD ou EUR para analisar
                outra moeda.
              </p>
            ) : null}

            {analytics ? (
              <section className="grid gap-5 sm:grid-cols-3">
                <article className="ruy-card ruy-card-padded">
                  <p className="ruy-section-label">Gastos este mês</p>
                  <p className="ruy-numeric mt-2 text-xl font-medium text-negative">
                    {formatCurrency(analytics.currentMonth.expenses, analyticsCurrency)}
                  </p>
                </article>
                <article className="ruy-card ruy-card-padded">
                  <p className="ruy-section-label">Top categoria</p>
                  <p className="mt-2 font-display text-base font-bold text-ink">
                    {analytics.byCategory[0]?.category ?? "—"}
                  </p>
                  {analytics.byCategory[0] ? (
                    <p className="ruy-numeric mt-1 text-sm text-muted">
                      {formatCurrency(analytics.byCategory[0].total, analyticsCurrency)}
                    </p>
                  ) : null}
                </article>
                <article className="ruy-card ruy-card-padded">
                  <p className="ruy-section-label">vs mês passado</p>
                  <p className="ruy-numeric mt-2 text-xl font-medium text-ink">
                    {analytics.expenseChangePercent === null
                      ? "—"
                      : `${analytics.expenseChangePercent > 0 ? "+" : ""}${analytics.expenseChangePercent.toFixed(0)}%`}
                  </p>
                </article>
              </section>
            ) : null}

            {analytics ? (
              <AnalyticsCharts analytics={analytics} compact currency={analyticsCurrency} />
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-rule pb-2">
                <h3 className="ruy-headline text-lg">Contas</h3>
                {!isDemo ? (
                  <Link className="text-sm font-semibold text-muted hover:text-ink" href="/connect">
                    Gerenciar conexões →
                  </Link>
                ) : (
                  <Link className="text-sm font-semibold text-accent hover:text-ink" href="/connect">
                    Conectar bancos reais →
                  </Link>
                )}
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredAccounts.map((account) => (
                  <article className="ruy-card ruy-card-padded" key={account.id}>
                    <div className="flex items-start gap-3">
                      <BankLogo bankName={account.bankName} logoUrl={account.bankLogoUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {account.bankName}
                        </p>
                        <p className="text-xs text-muted">
                          {account.accountType} · {account.accountName} · {account.currencyCode}
                        </p>
                        <p
                          className={`ruy-numeric mt-3 text-xl font-medium ${
                            account.balance < 0 ? "text-negative" : "text-ink"
                          }`}
                        >
                          {formatCurrency(account.balance, account.currencyCode)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-rule pb-2">
                <h3 className="ruy-headline text-lg">Últimos lançamentos</h3>
                <Link className="text-sm font-semibold text-muted hover:text-ink" href="/gastos">
                  Ver análise completa →
                </Link>
              </div>

              <div className="ruy-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="ruy-data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="whitespace-nowrap text-muted">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="text-ink">
                            <p>{transaction.description}</p>
                            <p className="text-xs text-muted">{transaction.bankName}</p>
                          </td>
                          <td className="text-muted">{transaction.category}</td>
                          <td
                            className={`ruy-numeric whitespace-nowrap font-medium ${amountClassName(transaction.amount)}`}
                          >
                            {formatCurrency(transaction.amount, transaction.currencyCode)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
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
