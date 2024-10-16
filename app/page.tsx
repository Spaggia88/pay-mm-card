"use client";

import { useEffect, useState } from "react";
import { ConnectKitButton } from "@daimo/pay";

type Item = { name: string; description: string; price: number };

const items: Item[] = [
  { name: "Apples", description: "1lb bag", price: 0.2 },
  { name: "Oranges", description: "1.5lb bag", price: 0.25 },
  { name: "Banana", description: "One bunch, organic", price: 0.3 },
];

export default function Home() {
  // Daimo Pay can be used in the same way for deposit (to dapp), donate, and invoice flows.
  // In this example, we demo an e-commerce checkout flow.
  // Start by letting the user choose what to buy:
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const totalUsd = selectedItems.reduce((a, b) => a + b.price, 0); // Dollars
  const amountUSDC = BigInt(totalUsd * 1e6); // USDC units

  // Generate a payment ID for the cart:
  const [payId, setPayId] = useState<string>();
  useEffect(() => {
    (async () => {
      if (selectedItems.length === 0) {
        setPayId(undefined);
        return;
      }

      const payId = await generatePayId(selectedItems, amountUSDC);
      console.log(
        `Got payment ID: ${payId} for ${JSON.stringify(selectedItems)}`
      );
      setPayId(payId);
    })();
  }, [selectedItems, amountUSDC]);

  return (
    <main>
      <h1>Daimo Pay Hello World</h1>
      <div style={{height: '16px'}} />
      <h2>Select Items</h2>
      <div style={{height: '8px'}} />
      <ItemsPicker {...{ selectedItems, setSelectedItems }} />
      <strong>Total: ${totalUsd.toFixed(2)}</strong>
      <div style={{height: '8px'}} />
      {payId != null && <ConnectKitButton payId={payId} />}
    </main>
  );
}
function ItemsPicker({
  selectedItems,
  setSelectedItems,
}: {
  selectedItems: Item[];
  setSelectedItems: (items: Item[]) => void;
}) {
  return (
    <div>
      {items.map((item: Item) => (
        <div key={item.name}>
          <input
            type="checkbox"
            id={item.name}
            checked={selectedItems.some(
              (selectedItem) => selectedItem.name === item.name
            )}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item]);
              } else {
                setSelectedItems(
                  selectedItems.filter(
                    (selectedItem) => selectedItem.name !== item.name
                  )
                );
              }
            }}
          />
          <label htmlFor={item.name}>
            {item.name} - {item.description} - ${item.price.toFixed(2)}
          </label>
        </div>
      ))}
    </div>
  );
}

async function generatePayId(
  selectedItems: Item[],
  amountUSDC: bigint
): Promise<string> {
  const recipient = {
    chain: 8453,
    token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    amount: `${amountUSDC}`,
    address: "0xc60A0A0E8bBc32DAC2E03030989AD6BEe45A874D", // enter your receiving address here
  };

  const response = await fetch("https://pay.daimo.com/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": "" + Math.random(),
      "Api-Key": "daimopay-demo",
    },
    body: JSON.stringify({
      intent: "Check out",
      items: selectedItems,
      recipient,
    }),
  });

  const data = await response.json();
  console.log(data);

  return data.id;
}
