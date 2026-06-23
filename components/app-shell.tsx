import { JournalMasthead } from "@/components/journal-masthead";
import { MarketTicker } from "@/components/market-ticker";
import { Sidebar } from "@/components/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-svh bg-paper">
    <Sidebar />
    <div className="flex min-h-svh flex-col md:ml-64">
      <MarketTicker />
      <JournalMasthead />
      <main className="flex-1 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  </div>
);
