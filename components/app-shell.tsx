import { JournalMasthead } from "@/components/journal-masthead";
import { Sidebar } from "@/components/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-svh bg-paper">
    <Sidebar />
    <div className="flex min-h-svh flex-col md:ml-56">
      <JournalMasthead />
      <main className="flex-1 bg-paper">
        <div className="mx-auto w-full max-w-7xl px-[var(--spacing-page-x)] py-8 sm:py-12">
          {children}
        </div>
      </main>
    </div>
  </div>
);
