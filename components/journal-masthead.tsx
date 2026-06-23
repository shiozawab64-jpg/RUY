"use client";

import Image from "next/image";
import Link from "next/link";
import { InlineMarketTicker } from "@/components/market-ticker";
import { LocalDateTime } from "@/components/local-date-time";

export const JournalMasthead = () => (
  <header className="border-b-2 border-ink bg-paper">
    <div className="border-b border-ink bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-[var(--spacing-page-x)] py-2">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden sm:gap-4">
          <span className="hidden shrink-0 ruy-section-label text-[0.625rem] text-accent md:inline">
            Mercados
          </span>
          <InlineMarketTicker className="overflow-hidden" />
        </div>
        <LocalDateTime variant="masthead" />
      </div>
    </div>

    <div className="mx-auto w-full max-w-7xl px-[var(--spacing-page-x)] pt-6 sm:pt-8">
      <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-8">
        <div className="hidden sm:block">
          <LocalDateTime variant="editorial" />
        </div>

        <div className="flex justify-center px-0 sm:px-8">
          <Link
            aria-label="Ir para o dashboard — The Wall Shiozawa Journal"
            className="block w-full max-w-[min(100%,38rem)] transition-opacity hover:opacity-90"
            href="/dashboard"
          >
            <Image
              alt="The Wall Shiozawa Journal — masthead editorial"
              className="h-auto w-full object-contain"
              height={499}
              priority
              src="/wall-shiozawa-journal.png"
              width={1024}
            />
          </Link>
        </div>

        <div className="hidden text-right sm:block">
          <p className="ruy-section-label text-accent">Finanças pessoais</p>
          <p className="mt-2 font-display text-base font-bold tracking-tight text-ink">
            Painel do Ruy
          </p>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
            Open Finance · Insights com IA
          </p>
        </div>
      </div>
    </div>

    <hr className="ruy-rule-strong mt-6 sm:mt-8" />
  </header>
);
