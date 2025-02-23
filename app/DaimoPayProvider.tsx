"use client";

import { DaimoPayProvider, getDefaultConfig } from '@daimo/pay';
import React from 'react';
import { WagmiProvider, createConfig } from 'wagmi';

const config = createConfig(
  getDefaultConfig({
    appName: 'Deposit to MetaMask Card',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  })
);

export function DPProvider ({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
        <DaimoPayProvider debugMode>{children}</DaimoPayProvider>
    </WagmiProvider>
  );
};