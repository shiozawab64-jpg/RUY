"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, compactCurrencyLabel } from "@/components/charts/chart-primitives";
import type { BankSpending } from "@/lib/analytics/spending";
import { formatCurrency } from "@/lib/format";
import { CHART_AXIS, CHART_COLORS, CHART_GRID, CHART_TICK } from "@/lib/chart-colors";

type BankSpendingChartProps = {
  banks: BankSpending[];
  currency?: string;
};

export const BankSpendingChart = ({ banks, currency = "BRL" }: BankSpendingChartProps) => {
  const data = banks.map((bank) => ({
    name: bank.bankName,
    total: bank.total,
    share: bank.share,
  }));

  if (data.length === 0) {
    return (
      <ChartCard description="Participação de cada instituição" title="Gastos por banco">
        <p className="flex h-full items-center justify-center text-sm text-muted">
          Sem dados bancários no período.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard description="Participação de cada instituição" title="Gastos por banco">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={CHART_GRID} strokeDasharray="3 3" />
          <XAxis
            axisLine={false}
            tick={{ fill: CHART_TICK, fontSize: 11 }}
            tickFormatter={(value: number) => compactCurrencyLabel(value, currency)}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickLine={false}
            type="category"
            width={72}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 0,
              border: "1px solid #d4d0c8",
              fontSize: 13,
            }}
            formatter={(value, _name, item) => {
              const share = item.payload?.share as number | undefined;
              return [
                `${formatCurrency(Number(value), currency)}${share ? ` · ${share.toFixed(0)}%` : ""}`,
                "Gastos",
              ];
            }}
          />
          <Bar dataKey="total" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} key={entry.name} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
