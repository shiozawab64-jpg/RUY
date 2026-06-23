import { DM_Mono, Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
  <html
    className={`${playfair.variable} ${dmMono.variable} ${inter.variable}`}
    lang="pt-BR"
  >
    <body className="antialiased">
      <AppShell>{children}</AppShell>
    </body>
  </html>
);

export default RootLayout;
