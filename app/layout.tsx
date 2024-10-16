import type { Metadata } from "next";
import "./globals.css";
import { EthProvider } from "./EthProvider";

export const metadata: Metadata = {
  title: "Daimo Pay Hello World",
  description: "Get started at https://pay.daimo.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EthProvider>
          {children}
        </EthProvider>
      </body>
    </html>
  );
}
