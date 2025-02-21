"use client";

import { DaimoPayButton } from "@daimo/pay";
import { useState } from "react";

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

  return (
    <main>
      <h1>Daimo Pay Hello World</h1>
      <div style={{ height: "16px" }} />
      <h2>Select Items</h2>
      <div style={{ height: "8px" }} />
      <ItemsPicker {...{ selectedItems, setSelectedItems }} />
      <strong>Total: ${totalUsd.toFixed(2)}</strong>
      <div style={{ height: "8px" }} />
      <DaimoPayButton
        appId="pay-demo"
        toChain={8453}
        toAddress="0xc60A0A0E8bBc32DAC2E03030989AD6BEe45A874D"
        toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        toUnits={totalUsd.toFixed(2)}
        onPaymentCompleted={() => {
          window.alert("Payment completed");
        }}
      />
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
