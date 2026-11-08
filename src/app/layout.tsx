import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerFlow — Business finances, in flow",
  description: "A clear view of your accounting, sales, expenses and cash flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
