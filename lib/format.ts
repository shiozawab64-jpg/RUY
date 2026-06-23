export const formatCurrency = (value: number, currency = "BRL"): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);

export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));

export const amountClassName = (amount: number): string =>
  amount >= 0 ? "text-positive" : "text-negative";

export const formatIndexValue = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatExchangeRate = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);

export const formatPercentChange = (value: number): string => {
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(value);

  return `${formatted}%`;
};

export const changeClassName = (change: number | null): string => {
  if (change === null || change === 0) {
    return "text-muted";
  }

  return change > 0 ? "text-positive" : "text-negative";
};
