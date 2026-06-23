"use client";

import { BankSpendingChart } from "@/components/charts/bank-spending-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { ExpenseTrendChart, MonthlyComparisonChart } from "@/components/charts/monthly-charts";
import type { SpendingAnalytics } from "@/lib/analytics/spending";

type AnalyticsChartsProps = {
  analytics: SpendingAnalytics;
  compact?: boolean;
  currency?: string;
};

export const AnalyticsCharts = ({
  analytics,
  compact = false,
  currency = "BRL",
}: AnalyticsChartsProps) => {
  if (compact) {
    return (
      <section className="ruy-card p-5">
        <h3 className="ruy-headline text-lg">Gráficos de análise</h3>
        <p className="mt-1 text-sm text-muted">Fluxo mensal · {currency}</p>
        <hr className="ruy-rule my-4" />
        <MonthlyComparisonChart compact currency={currency} monthly={analytics.monthly} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="border-b border-rule pb-2">
        <h3 className="ruy-headline text-lg">Gráficos de análise</h3>
        <p className="mt-1 text-sm text-muted">
          Visualização de gastos, categorias e bancos · {currency}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyComparisonChart currency={currency} monthly={analytics.monthly} />
        <CategoryPieChart categories={analytics.byCategory} currency={currency} />
        <ExpenseTrendChart currency={currency} monthly={analytics.monthly} />
        <BankSpendingChart banks={analytics.byBank} currency={currency} />
      </div>
    </section>
  );
};
