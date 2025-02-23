import type { Metadata } from "next";
import "./globals.css";
import { MetaMaskProvider } from "./MetaMaskProvider";

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
      <body style={{backgroundColor: '#eee'}}>
        <MetaMaskProvider>
          {children}
        </MetaMaskProvider>
      </body>
    </html>
  );
}
