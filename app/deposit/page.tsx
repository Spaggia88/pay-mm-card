"use client";

import { assert, assertNotNull, timeAgo } from "@daimo/common";
import { DaimoPayButton, DaimoPayment } from "@daimo/pay";
import { LinkExternalIcon } from "@primer/octicons-react";
import { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { linea } from "viem/chains";
import { useBalance } from "wagmi";
import { DPProvider } from "../DaimoPayProvider";
import { ButtonPrimary, Header, LINEA_USDC_ADDRESS, SetAddressForm } from "../common";


export default function DepositPage() {
  // Fetch user's MetaMask Card (= Linea USDC) balance
  const [mmAddress, setMmAddress] = useState<Address>();
  const {
    data: balance,
    isFetching,
    refetch,
  } = useBalance({
    address: mmAddress,
    token: LINEA_USDC_ADDRESS,
    chainId: linea.id,
  });
  console.log(`Rendering. Account: ${mmAddress}, balance: ${balance?.value}`);

  // SSR only a shell. Hide rest till initial mount+fetch.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isFetching) setIsMounted(true);
  }, [isFetching]);

  // Reload balance on successful deposit.
  const [externalId, setExternalId] = useState(() => crypto.randomUUID());
  const refreshBalance = async () => {
    refetch(); // Refetch async
    // After success, show success state for 2s, then reset to a fresh deposit.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setExternalId(crypto.randomUUID());
    refetch();
  };

  return (
    <main>
      <Header path="Deposit" title="Deposit to MetaMask Card" />
      <div style={{ height: "16px" }} />
      {!isMounted ? null : mmAddress == null ? (
        <SetAddressView setMmAddress={setMmAddress} />
      ) : (
        <ConnectedView
          address={mmAddress}
          balance={balance}
          disconnect={() => setMmAddress(undefined)}
          refreshBalance={refreshBalance}
          externalId={externalId}
        />
      )}
    </main>
  );
}

function SetAddressView({
  setMmAddress,
}: {
  setMmAddress: (address: Address) => void;
}) {
  return (
    <div>
      <div className="text-gray">
        In production, manage the connection to MetaMask directly via the MetaMask
        SDK, not Wagmi. This preserves that connection even if the user deposits
        from a separate, non-MetaMask wallet.
      </div>
      <div style={{ height: "16px" }} />
      <SetAddressForm onSubmit={setMmAddress} placeholder="Enter MetaMask address" />
    </div>
  );
}

function ConnectedView({
  address,
  balance,
  disconnect,
  refreshBalance,
  externalId,
}: {
  address: Address;
  balance: Balance | undefined;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  externalId: string;
}) {
  const [recentDeposits, setRecentDeposits] = useState<DaimoPayment[]>([]);
  const onDeposit = (payment: DaimoPayment) => {
    setRecentDeposits([payment, ...recentDeposits]);
    refreshBalance();
  };

  return (
    <>
      <div className="text-gray">
        Welcome, {address.slice(0, 6)}...{address.slice(-4)}{" "}
        <button onClick={disconnect} className="button-text">
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
        {balance && <BalanceDisplay balance={balance} />}
        <DepositButton
          address={address}
          onDeposit={onDeposit}
          externalId={externalId}
        />
      </div>
      <div style={{ height: "32px" }} />
      {recentDeposits.length === 0 ? (
        <p className="text-gray" style={{ textAlign: "center" }}>
          Deposit from an exchange or wallet.
          <br />
          Supports any coin on any chain.
        </p>
      ) : (
        <div style={{ width: "100%" }}>
          {recentDeposits.map((deposit) => (
            <DepositRow
              key={assertNotNull(deposit.destination?.txHash)}
              deposit={deposit}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DepositRow({ deposit }: { deposit: DaimoPayment }) {
  const dest = assertNotNull(deposit.destination);
  assert(dest.tokenSymbol === "USDC");
  const amountUSDC = dest.amountUnits;

  return (
    <div className="deposit-row-wrap">
      <div className="deposit-row">
        <div>
          <div className="deposit-amount">${Number(amountUSDC).toFixed(2)}</div>
        </div>
        <div className="deposit-details">
          <div className="text-gray deposit-time">
            {timeAgo(Number(deposit.createdAt), undefined, undefined, true)}
          </div>
          <a
            href={`https://lineascan.build/tx/${dest.txHash}`}
            target="_blank"
            rel="noopener"
            className="text-gray deposit-link"
          >
            view on explorer
            <LinkExternalIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

interface Balance {
  value: bigint;
  decimals: number;
}

function BalanceDisplay({ balance }: { balance: Balance }) {
  return (
    <div>
      <h2>
        ${Number(formatUnits(balance.value, balance.decimals)).toFixed(2)}
      </h2>
      <div className="text-gray-bold">USDC ON LINEA</div>
    </div>
  );
}

function DepositButton({
  address,
  onDeposit,
  externalId,
}: {
  address: Address;
  onDeposit: (payment: DaimoPayment) => void;
  externalId: string;
}) {
  return (
    <DPProvider>
      <DaimoPayButton.Custom
        appId="pay-demo"
        externalId={externalId}
        toChain={linea.id}
        toToken={LINEA_USDC_ADDRESS}
        toAddress={address}
        intent="Deposit to Metamask Card"
        onPaymentCompleted={(event) => onDeposit(event.payment)}
        paymentOptions={["Coinbase", "ExternalChains"]}
        closeOnSuccess
      >
        {({ show }) => <ButtonPrimary onClick={show}>Deposit</ButtonPrimary>}
      </DaimoPayButton.Custom>
    </DPProvider>
  );
}
