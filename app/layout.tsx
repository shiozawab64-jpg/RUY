import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata = {
  title: "Painel do Ruy",
  description: "Dashboard financeiro pessoal com Open Finance e insights de IA.",
  icons: {
    icon: "/ruy-profile.png",
  },
} satisfies Metadata;

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => (
  <html className={`${libreBaskerville.variable} ${sourceSans.variable}`} lang="pt-BR">
    <body className="antialiased">
      <AppShell>{children}</AppShell>
    </body>
  </html>
);

export default RootLayout;
