import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { LeftRail } from "@/components/layout/left-rail";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aime - Institutional Equity Research Copilot",
  description: "AI-powered equity research platform for institutional analysts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          <TopNav />
          <div className="flex">
            <LeftRail />
            <main className="flex-1 ml-64 pt-4 pb-16 overflow-x-hidden">
              {children}
            </main>
          </div>
          <ToastProvider />
        </div>
      </body>
    </html>
  );
}
