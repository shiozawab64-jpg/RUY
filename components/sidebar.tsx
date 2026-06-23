"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/gastos", label: "Gastos & insights" },
  { href: "/connect", label: "Conectar contas" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink bg-paper md:hidden">
        <nav className="flex gap-0 overflow-x-auto px-1">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={`shrink-0 border-b-2 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-rule bg-paper md:flex">
        <div className="border-b border-rule px-6 py-8">
          <p className="ruy-section-label text-accent">Navegação</p>
          <p className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
            Painel do Ruy
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0 px-0 py-3">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={`border-l-2 px-6 py-3.5 text-sm font-medium transition ${
                  active
                    ? "border-accent bg-paper-muted text-ink"
                    : "border-transparent text-muted hover:border-rule hover:bg-paper-muted hover:text-ink"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-rule px-6 py-5">
          <p className="ruy-section-label text-[0.625rem]">Open Finance via Pluggy</p>
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-muted">Análise com Claude</p>
        </div>
      </aside>
    </>
  );
};
