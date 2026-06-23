"use client";

import { useEffect, useState } from "react";

type LocalDateTimeProps = {
  inverted?: boolean;
  variant?: "default" | "inverted" | "editorial";
};

const formatLocalDateTime = (date: Date): { dateLine: string; timeLine: string } => {
  const dateLine = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const timeLine = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return { dateLine, timeLine };
};

export const LocalDateTime = ({
  inverted = false,
  variant = inverted ? "inverted" : "default",
}: LocalDateTimeProps) => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!now) {
    return null;
  }

  const { dateLine, timeLine } = formatLocalDateTime(now);

  if (variant === "editorial") {
    return (
      <div className="text-[0.6875rem] leading-relaxed text-muted">
        <p className="ruy-section-label text-muted">Hoje</p>
        <p className="mt-1 capitalize text-ink">{dateLine}</p>
        <p className="mt-0.5 tabular-nums text-ink-muted">{timeLine}</p>
      </div>
    );
  }

  const mutedClass = variant === "inverted" ? "text-paper/55" : "text-muted";
  const timeClass = variant === "inverted" ? "text-paper/80" : "text-ink-muted";

  return (
    <div className={`text-xs leading-relaxed ${mutedClass}`}>
      <p className="capitalize">{dateLine}</p>
      <p className={`mt-0.5 font-medium tabular-nums tracking-wide ${timeClass}`}>{timeLine}</p>
    </div>
  );
};
