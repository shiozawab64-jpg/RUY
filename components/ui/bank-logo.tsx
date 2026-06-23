import Image from "next/image";

type BankLogoProps = {
  bankName: string;
  logoUrl?: string | null;
  size?: "sm" | "md";
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const BankLogo = ({ bankName, logoUrl, size = "md" }: BankLogoProps) => {
  const dimension = size === "sm" ? 32 : 40;
  const className =
    size === "sm"
      ? "h-8 w-8 border border-rule bg-white object-contain p-1"
      : "h-10 w-10 border border-rule bg-white object-contain p-1";

  if (logoUrl) {
    return (
      <Image
        alt={bankName}
        className={className}
        height={dimension}
        src={logoUrl}
        unoptimized
        width={dimension}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${size === "sm" ? "h-8 w-8" : "h-10 w-10"} flex items-center justify-center bg-ink text-xs font-semibold text-paper`}
    >
      {initials(bankName)}
    </div>
  );
};
