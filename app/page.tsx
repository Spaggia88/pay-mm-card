"use client";

import { DaimoPayButton } from "@daimo/pay";
import { CreditCardIcon } from "@primer/octicons-react";
import { formatUnits } from "viem";
import { linea } from "viem/chains";
import { useAccount, useBalance, useConnect } from "wagmi";
import { DPProvider } from "./DaimoPayProvider";

const LINEA_USDC_ADDRESS = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
export default function Home() {
  const account = useAccount();
  const { data: balance, refetch } = useBalance({
    address: account.address,
    token: LINEA_USDC_ADDRESS,
    chainId: linea.id,
  });

  const { connectors, connect } = useConnect();
  console.log(
    `Rendering. Account: ${account.address}. Connectors: ${connectors.map(
      (c) => c.name
    )}`
  );
  const connector = connectors[0];

  // Reload balance on successful deposit.
  const refreshBalance = async () => {
    const oldBalance = balance?.value;
    while (balance?.value === oldBalance) {
      console.log(`Old balance ${oldBalance}, refetching`);
      await refetch();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log(`New balance ${balance?.value}`);
  };

  return (
    <main
      style={{
        margin: "32px auto",
        maxWidth: "512px",
        borderRadius: 16,
        padding: 32,
        backgroundColor: "#fdfdfd",
        height: "360px",
      }}
    >
      <CreditCardIcon size={48} />
      <div style={{ height: "8px" }} />
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>
        Deposit to MetaMask Card
      </h1>
      <div style={{ height: "16px" }} />
      {account.address == null ? (
        <>
          <MMBtn onClick={() => connect({ connector })}>Connect MetaMask</MMBtn>
        </>
      ) : (
        <>
          {balance && (
            <>
              <div style={{ height: "16px" }} />
              <h2>
                $
                {Number(formatUnits(balance.value, balance.decimals)).toFixed(
                  2
                )}
              </h2>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#666" }}>
                USDC ON LINEA
              </div>
            </>
          )}
          <div style={{ height: "16px" }} />
          <DPProvider>
            <DaimoPayButton.Custom
              appId="pay-demo"
              toChain={linea.id}
              toToken={LINEA_USDC_ADDRESS}
              toAddress={account.address}
              intent="Deposit to Metamask Card"
              onPaymentCompleted={refreshBalance}
              closeOnSuccess
            >
              {({ show }) => <MMBtn onClick={show}>Deposit</MMBtn>}
            </DaimoPayButton.Custom>
          </DPProvider>
          <div style={{ height: "16px" }} />
          <p style={{ textAlign: "center", color: "#666" }}>
            Deposit from an exchange or wallet.
            <br />
            Supports any coin on any chain.
          </p>
        </>
      )}
    </main>
  );
}

const MMBtn = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: "rgb(3, 118, 201)",
      color: "white",
      padding: "16px 32px",
      borderRadius: "48px",
      border: "none",
      fontSize: "16px",
      fontWeight: 500,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);
