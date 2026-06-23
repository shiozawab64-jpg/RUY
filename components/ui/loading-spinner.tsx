"use client";

type LoadingSpinnerProps = {
  label?: string;
};

export const LoadingSpinner = ({ label = "Carregando…" }: LoadingSpinnerProps) => (
  <div className="flex items-center gap-3 text-sm text-muted">
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rule border-t-ink"
    />
    <span>{label}</span>
  </div>
);
