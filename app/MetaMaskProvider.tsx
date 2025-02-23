"use client";

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, linea, base, arbitrum, optimism, polygon } from 'viem/chains';
import { metaMask, injected } from 'wagmi/connectors';


const mmConfig = createConfig({
    chains: [mainnet, linea, base, arbitrum, optimism, polygon],
    connectors: [metaMask({
        dappMetadata: {
            url: "https://pay.daimo.com",
            name: "Deposit to Metamask Card",
        }
    }), injected()],
    transports: {
      [mainnet.id]: http(),
      [linea.id]: http(),
      [base.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
      [polygon.id]: http(),
    },
  });


const queryClient = new QueryClient();


export function MetaMaskProvider ({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={mmConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  };