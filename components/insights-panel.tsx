"use client";

import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type InsightsPanelProps = {
  open: boolean;
  analysis: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

const renderMarkdownSections = (analysis: string) => {
  const sections = analysis.split(/^## /m).filter(Boolean);

  return sections.map((section) => {
    const [titleLine, ...bodyLines] = section.split("\n");
    const title = titleLine?.trim() ?? "Análise";
    const body = bodyLines.join("\n").trim();

    return (
      <section className="ruy-card bg-paper-muted p-4" key={title}>
        <h3 className="ruy-section-label text-ink">{title}</h3>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{body}</div>
      </section>
    );
  });
};

export const InsightsPanel = ({ open, analysis, loading, error, onClose }: InsightsPanelProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50">
      <button
        aria-label="Fechar painel de análise"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col border-l-2 border-ink bg-paper">
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <div>
            <p className="ruy-section-label text-accent">IA financeira</p>
            <h2 className="ruy-headline text-lg">Análise do período</h2>
          </div>
          <button
            className="px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {loading ? <LoadingSpinner label="Gerando análise com Claude…" /> : null}
          {error ? (
            <p className="border border-negative/30 bg-red-50 px-4 py-3 text-sm text-negative">
              {error}
            </p>
          ) : null}
          {analysis ? renderMarkdownSections(analysis) : null}
        </div>
      </aside>
    </div>
  );
};
