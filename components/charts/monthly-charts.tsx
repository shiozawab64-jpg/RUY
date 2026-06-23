"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, compactCurrencyLabel, CurrencyTooltip } from "@/components/charts/chart-primitives";
import type { MonthlySpending } from "@/lib/analytics/spending";
import { formatCurrency } from "@/lib/format";
import { CHART_EXPENSE, CHART_GRID, CHART_INCOME, CHART_TICK } from "@/lib/chart-colors";

type MonthlyComparisonChartProps = {
  monthly: MonthlySpending[];
  compact?: boolean;
  currency?: string;
};

export const MonthlyComparisonChart = ({
  monthly,
  compact = false,
  currency = "BRL",
}: MonthlyComparisonChartProps) => {
  const data = monthly.map((item) => ({
    name: item.label,
    Gastos: item.expenses,
    Entradas: item.income,
  }));

  const chart = (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={{ stroke: CHART_GRID }}
          dataKey="name"
          tick={{ fill: CHART_TICK, fontSize: 11 }}
          tickFormatter={(value: string) => value.replace(".", "")}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fill: CHART_TICK, fontSize: 11 }}
          tickFormatter={(value: number) => compactCurrencyLabel(value, currency)}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CurrencyTooltip currency={currency} />} />
        <Legend
          formatter={(value) => <span className="text-sm text-muted">{value}</span>}
          iconType="square"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="Gastos" fill={CHART_EXPENSE} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Entradas" fill={CHART_INCOME} radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  if (compact) {
    return <div className="h-56 w-full">{chart}</div>;
  }

  return (
    <ChartCard description="Comparativo de entradas e saídas mês a mês" title="Fluxo mensal">
      {chart}
    </ChartCard>
  );
};

export const ExpenseTrendChart = ({
  monthly,
  currency = "BRL",
}: MonthlyComparisonChartProps) => {
  const data = monthly.map((item) => ({
    name: item.label,
    Gastos: item.expenses,
  }));

  return (
    <ChartCard description="Evolução das saídas no período" title="Tendência de gastos">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={{ stroke: CHART_GRID }}
            dataKey="name"
            tick={{ fill: CHART_TICK, fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: CHART_TICK, fontSize: 11 }}
            tickFormatter={(value: number) => compactCurrencyLabel(value, currency)}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={<CurrencyTooltip currency={currency} />}
            formatter={(value) => formatCurrency(Number(value), currency)}
          />
          <Bar dataKey="Gastos" fill={CHART_INCOME} radius={[0, 0, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
