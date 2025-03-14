"use client";

import { DaimoPayButton, DaimoPayment } from "@daimo/pay";
import { useState } from "react";
import { Address } from "viem";
import { linea } from "viem/chains";
import { DPProvider } from "../DaimoPayProvider";
import { ButtonPrimary, Header, LINEA_USDC_ADDRESS, SetAddressForm } from "../common";

export default function BuyPage() {
  const [recipientAddr, setRecipientAddr] = useState<Address>();

  return (
    <main>
      <Header path="Buy" title="Buy MetaMask Metal Card" />
      <div style={{ height: "16px" }} />
      {recipientAddr==null ? (
        <SetAddressView setRecipientAddr={setRecipientAddr} />
      ) : (
        <Checkout
          recipientAddr={recipientAddr}
        />
      )}
    </main>
  );
}

function SetAddressView({
  setRecipientAddr,
}: {
  setRecipientAddr: (address: Address) => void;
}) {
  return (
    <div>
      <div className="text-gray">
        Payer pays from any chain. Recipient address receives USDC on Linea. Set `externalId` to uniquely identify each checkout; this will be passed into webhooks.
      </div>
      <div style={{ height: "16px" }} />
      <SetAddressForm onSubmit={setRecipientAddr} placeholder="Enter recipient address" />
    </div>
  );
}

function Checkout({
  recipientAddr,
}: {
  recipientAddr: Address;
}) {
  const [externalId] = useState(() => crypto.randomUUID());
  const [recentPayments, setRecentPayments] = useState<DaimoPayment[]>([]);
  const amountUsd = 140;

  const onPaymentComplete = (payment: DaimoPayment) => {
    setRecentPayments([payment, ...recentPayments]);
  };

  return (
    <div>
      <div className="text-gray">
        Purchase a MetaMask Metal Card for ${amountUsd.toFixed(2)}
      </div>
      <div style={{ height: "16px" }} />
      <CheckoutButton 
        address={recipientAddr}
        onPayment={onPaymentComplete}
        externalId={externalId}
        amountUsd={amountUsd}
      />
    </div>
  );
}

function CheckoutButton({
  address,
  onPayment,
  externalId,
  amountUsd,
}: {
  address: Address;
  onPayment: (payment: DaimoPayment) => void;
  externalId: string;
  amountUsd: number;
}) {
  return (
    <DPProvider>
      <DaimoPayButton.Custom
        appId="pay-demo"
        externalId={externalId}
        toChain={linea.id}
        toToken={LINEA_USDC_ADDRESS}
        toAddress={address}
        toUnits={amountUsd.toFixed(2)}
        intent="Purchase Card"
        onPaymentCompleted={(event) => onPayment(event.payment)}
        paymentOptions={["Coinbase", "ExternalChains"]}
        closeOnSuccess
      >
        {({ show }) => <ButtonPrimary onClick={show}>Buy Now</ButtonPrimary>}
      </DaimoPayButton.Custom>
    </DPProvider>
  );
}
