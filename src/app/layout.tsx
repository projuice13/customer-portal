import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { QueryProvider } from "@/components/layout/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Customer Resource Portal",
    template: "%s | Resource Portal",
  },
  description:
    "Your central hub for product assets, marketing materials, and business tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
