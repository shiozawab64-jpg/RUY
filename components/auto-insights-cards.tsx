import type { AutoInsight } from "@/lib/analytics/spending";

const toneStyles: Record<AutoInsight["tone"], string> = {
  info: "border-rule bg-paper-muted",
  warning: "border-accent/40 bg-accent/5",
  success: "border-ink/20 bg-white",
};

type AutoInsightsCardsProps = {
  insights: AutoInsight[];
};

export const AutoInsightsCards = ({ insights }: AutoInsightsCardsProps) => {
  if (insights.length === 0) {
    return (
      <p className="border border-dashed border-rule px-5 py-8 text-sm text-muted">
        Conecte contas e aguarde a sincronização para ver insights automáticos.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {insights.map((insight) => (
        <article
          className={`ruy-card p-4 ${toneStyles[insight.tone]}`}
          key={insight.title}
        >
          <h4 className="ruy-section-label text-ink">{insight.title}</h4>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{insight.body}</p>
        </article>
      ))}
    </div>
  );
};
