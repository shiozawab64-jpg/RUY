import type { CategorySpending } from "@/lib/analytics/spending";
import { formatCurrency } from "@/lib/format";

type CategoryBreakdownProps = {
  categories: CategorySpending[];
  currency?: string;
};

export const CategoryBreakdown = ({ categories, currency = "BRL" }: CategoryBreakdownProps) => {
  if (categories.length === 0) {
    return <p className="text-sm text-muted">Nenhuma despesa categorizada no período.</p>;
  }

  return (
    <div className="space-y-3">
      {categories.slice(0, 10).map((category) => (
        <div key={category.category}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-ink">{category.category}</span>
            <span className="whitespace-nowrap text-muted">
              {formatCurrency(category.total, currency)} · {category.share.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden bg-paper-muted">
            <div className="h-full bg-ink" style={{ width: `${category.share}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">{category.count} lançamento(s)</p>
        </div>
      ))}
    </div>
  );
};
