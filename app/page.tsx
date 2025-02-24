"use client";

import { DaimoPayButton } from "@daimo/pay";
import { CreditCardIcon } from "@primer/octicons-react";
import { formatUnits } from "viem";
import { linea } from "viem/chains";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { DPProvider } from "./DaimoPayProvider";
import { useEffect, useState } from "react";

const LINEA_USDC_ADDRESS = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";

export default function Home() {
  // Let user connect MetaMask
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  // Fetch user's MetaMask Card (= Linea USDC) balance
  const account = useAccount();
  const {
    data: balance,
    isFetching,
    refetch,
  } = useBalance({
    address: account.address,
    token: LINEA_USDC_ADDRESS,
    chainId: linea.id,
  });
  console.log(
    `Rendering. Account: ${account.address}, balance: ${balance?.value}`
  );

  // SSR only a shell. Hide rest till initial mount+fetch.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isFetching) setIsMounted(true);
  }, [isFetching]);

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
    <main>
      <CreditCardIcon size={48} />
      <div style={{ height: "8px" }} />
      <h1 className="heading">Deposit to MetaMask Card</h1>
      <div style={{ height: "16px" }} />
      {!isMounted ? null : account.address == null ? (
        <>
          <MMBtn onClick={() => connect({ connector })}>Connect MetaMask</MMBtn>
        </>
      ) : (
        <>
          <div className="text-gray">
            Welcome, {account.address.slice(0, 6)}...{account.address.slice(-4)}{" "}
            <button onClick={() => disconnect()} className="button-text">
              Disconnect
            </button>
          </div>
          <div style={{ height: "16px" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {balance && (
              <div>
                <h2>
                  $
                  {Number(formatUnits(balance.value, balance.decimals)).toFixed(
                    2
                  )}
                </h2>
                <div className="text-gray-bold">USDC ON LINEA</div>
              </div>
            )}
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
          </div>
          <div style={{ height: "16px" }} />
          <p className="text-gray" style={{ textAlign: "center" }}>
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
  <button onClick={onClick} className="button-primary">
    {children}
  </button>
);
