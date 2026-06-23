"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "@/components/charts/chart-primitives";
import type { CategorySpending } from "@/lib/analytics/spending";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS } from "@/lib/chart-colors";

type CategoryPieChartProps = {
  categories: CategorySpending[];
  currency?: string;
};

const buildPieData = (categories: CategorySpending[]) => {
  const top = categories.slice(0, 6);
  const restTotal = categories.slice(6).reduce((sum, item) => sum + item.total, 0);

  const data = top.map((item) => ({
    name: item.category,
    value: item.total,
  }));

  if (restTotal > 0) {
    data.push({ name: "Outros", value: restTotal });
  }

  return data;
};

export const CategoryPieChart = ({ categories, currency = "BRL" }: CategoryPieChartProps) => {
  if (categories.length === 0) {
    return (
      <ChartCard description="Distribuição percentual no período" title="Gastos por categoria">
        <p className="flex h-full items-center justify-center text-sm text-muted">
          Sem despesas categorizadas.
        </p>
      </ChartCard>
    );
  }

  const data = buildPieData(categories);

  return (
    <ChartCard description="Distribuição percentual no período" title="Gastos por categoria">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius={58}
            nameKey="name"
            outerRadius={96}
            paddingAngle={1}
          >
            {data.map((entry, index) => (
              <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} key={entry.name} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currency)}
            contentStyle={{
              borderRadius: 2,
              border: "1px solid #d4d0c8",
              fontSize: 13,
            }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-muted">{String(value)}</span>}
            iconType="square"
            layout="horizontal"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 11, lineHeight: "16px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
