import Image from "next/image";

type RuyBrandProps = {
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  inverted?: boolean;
};

const sizeMap = {
  sm: { box: "h-10 w-10", title: "text-lg", subtitle: "text-[10px]" },
  md: { box: "h-14 w-14", title: "text-xl", subtitle: "text-[10px]" },
  lg: { box: "h-16 w-16", title: "text-2xl", subtitle: "text-[10px]" },
};

export const RuyBrand = ({ size = "md", showTitle = true, inverted = false }: RuyBrandProps) => {
  const styles = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${styles.box} shrink-0 overflow-hidden border ${
          inverted ? "border-white/20 bg-ink-muted" : "border-rule bg-white"
        }`}
      >
        <Image
          alt="Ruy — GPMH Digital Consulting"
          className="h-full w-full object-cover object-top"
          height={96}
          priority
          src="/ruy-profile.png"
          width={96}
        />
      </div>
      {showTitle ? (
        <div className="min-w-0">
          <p
            className={`${styles.subtitle} ruy-section-label ${
              inverted ? "text-accent/90" : "text-accent"
            }`}
          >
            Finanças pessoais
          </p>
          <p
            className={`${styles.title} ruy-headline leading-tight ${
              inverted ? "text-paper" : "text-ink"
            }`}
          >
            Painel do Ruy
          </p>
        </div>
      ) : null}
    </div>
  );
};
