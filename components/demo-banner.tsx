type DemoBannerProps = {
  compact?: boolean;
};

export const DemoBanner = ({ compact = false }: DemoBannerProps) => (
  <div className={`border border-accent/40 bg-accent/5 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
    <p className="ruy-section-label text-accent">Dados de exemplo</p>
    <p className="mt-1 text-sm text-ink-muted">
      {compact
        ? "Conecte seus bancos para substituir por dados reais."
        : "Tudo já está configurado para o Ruy visualizar saldos, gastos e insights. Quando quiser, vá em Conectar contas e substitua por dados reais do Open Finance."}
    </p>
  </div>
);
