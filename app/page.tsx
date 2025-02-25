"use client";

import { assert, assertNotNull, timeAgo } from "@daimo/common";
import { DaimoPayButton } from "@daimo/pay";
import { CreditCardIcon, LinkExternalIcon } from "@primer/octicons-react";
import { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { linea } from "viem/chains";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { DPProvider } from "./DaimoPayProvider";

// TODO: add timestamp to payment source/dest.
// TODO: export these.
type DaimoPayCompletedEvent = Parameters<
  NonNullable<Parameters<typeof DaimoPayButton>[0]["onPaymentCompleted"]>
>[0];
type DaimoPayment = DaimoPayCompletedEvent["payment"];

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
  const [externalId, setExternalId] = useState(()=>crypto.randomUUID());
  const refreshBalance = async () => {
    // TODO: without the timeout, we get a flash of spinner after the checkmark.
    // This is because we're now on the confirm page with a new externalId > new payId.
    setTimeout(() => setExternalId(crypto.randomUUID()), 2000);

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
        <MMBtn onClick={() => connect({ connector })}>Connect MetaMask</MMBtn>
      ) : (
        <ConnectedView
          address={account.address}
          balance={balance}
          disconnect={disconnect}
          refreshBalance={refreshBalance}
          externalId={externalId}
        />
      )}
    </main>
  );
}

function MMBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="button-primary">
      {children}
    </button>
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
          refreshBalance={refreshBalance}
          onDeposit={(event) => setRecentDeposits([event, ...recentDeposits])}
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

function DepositRow({
  deposit,
}: {
  deposit: DaimoPayment;
}) {
  const dest = assertNotNull(deposit.destination);
  assert(dest.tokenSymbol === "USDC");
  const amountUSDC = dest.amountUnits;

  return (
    <div className="deposit-row-wrap">
      <div className="deposit-row">
        <div>
          <div className="deposit-amount">
            ${Number(amountUSDC).toFixed(2)}
          </div>
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
  refreshBalance,
  onDeposit,
  externalId,
}: {
  address: Address;
  refreshBalance: () => Promise<void>;
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
        onPaymentCompleted={(event) => {
          refreshBalance();
          onDeposit(event.payment);
        }}
        closeOnSuccess
      >
        {({ show }) => <MMBtn onClick={show}>Deposit</MMBtn>}
      </DaimoPayButton.Custom>
    </DPProvider>
  );
}
