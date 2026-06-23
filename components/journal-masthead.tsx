"use client";

import Image from "next/image";
import Link from "next/link";
import { InlineMarketTicker } from "@/components/market-ticker";
import { LocalDateTime } from "@/components/local-date-time";

export const JournalMasthead = () => (
  <header className="border-b-2 border-ink bg-paper">
    <div className="border-b border-ink bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-1.5 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden shrink-0 ruy-section-label text-[0.5625rem] text-accent sm:inline">
            Mercados
          </span>
          <InlineMarketTicker className="py-0.5" />
        </div>
        <LocalDateTime variant="masthead" />
      </div>
    </div>

    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-8 sm:pt-5">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="hidden sm:block">
          <LocalDateTime variant="editorial" />
        </div>

        <div className="flex justify-center px-0 sm:px-6">
          <Link
            aria-label="Ir para o dashboard — The Wall Shiozawa Journal"
            className="block w-full max-w-[min(100%,36rem)] transition-opacity hover:opacity-90"
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
          <p className="mt-1 font-display text-sm font-bold tracking-tight text-ink">Painel do Ruy</p>
          <p className="mt-1 text-[0.6875rem] text-muted">Open Finance · Insights com IA</p>
        </div>
      </div>
    </div>

    <hr className="ruy-rule-strong mt-4" />
  </header>
);
