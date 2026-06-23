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
      <header className="sticky top-0 z-40 border-b-2 border-accent/40 bg-ink text-paper md:hidden">
        <div className="ruy-accent-bar" />
        <nav className="flex gap-0 overflow-x-auto px-2">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-paper/70 hover:text-paper"
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

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink text-paper md:flex">
        <div className="ruy-accent-bar" />
        <div className="border-b border-white/10 px-5 py-6">
          <p className="ruy-section-label text-accent">Navegação</p>
          <p className="mt-1 font-display text-base font-bold tracking-tight">Painel do Ruy</p>
        </div>

        <nav className="flex flex-1 flex-col gap-0 px-0 py-2">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={`border-l-2 px-5 py-3 text-sm font-medium transition ${
                  active
                    ? "border-accent bg-white/5 text-accent"
                    : "border-transparent text-paper/75 hover:border-white/20 hover:bg-white/5 hover:text-paper"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-4">
          <p className="ruy-section-label text-[0.625rem] text-paper/45">
            Open Finance via Pluggy
          </p>
          <p className="mt-1 text-[0.625rem] text-paper/45">Análise com Claude</p>
        </div>
      </aside>
    </>
  );
};
