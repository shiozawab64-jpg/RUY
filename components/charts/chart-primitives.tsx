"use client";

import { formatCurrency } from "@/lib/format";

type TooltipEntry = {
  name?: string;
  value?: number;
  color?: string;
};

type CurrencyTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  currency?: string;
};

export const CurrencyTooltip = ({
  active,
  payload,
  label,
  currency = "BRL",
}: CurrencyTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="border border-rule bg-white px-3 py-2"
      style={{ borderRadius: "var(--radius-editorial)" }}
    >
      <p className="ruy-section-label capitalize">{label}</p>
      <ul className="mt-1 space-y-1">
        {payload.map((entry) => (
          <li className="flex items-center gap-2 text-sm" key={entry.name}>
            <span className="h-2 w-2" style={{ backgroundColor: entry.color }} />
            <span className="text-muted">{entry.name}:</span>
            <span className="font-semibold text-ink">
              {formatCurrency(Number(entry.value ?? 0), currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const compactCurrencyLabel = (value: number, currency = "BRL"): string => {
  const prefix = currency === "USD" ? "US$ " : currency === "EUR" ? "€" : "R$ ";
  return value >= 1000 ? `${prefix}${(value / 1000).toFixed(0)}k` : `${prefix}${value}`;
};

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const ChartCard = ({ title, description, children }: ChartCardProps) => (
  <article className="ruy-card p-5">
    <h3 className="ruy-headline text-lg">{title}</h3>
    {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    <hr className="ruy-rule my-4" />
    <div className="h-72 w-full">{children}</div>
  </article>
);
