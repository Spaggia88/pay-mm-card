"use client";

import { CreditCardIcon } from "@primer/octicons-react";
import { useRef } from "react";
import { Address, getAddress } from "viem";

export const LINEA_USDC_ADDRESS = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";

export function Header({ path, title }: { path?: string; title: string }) {
  return (
    <header>
      <div className="flex-row">
        <CreditCardIcon size={48} />
        {path ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <a href="/">Demo</a>
            <span>/</span>
            <strong>{path}</strong>
          </div>
        ) : (
          <strong>Demo</strong>
        )}
      </div>
      <div style={{ height: "8px" }} />
      <h1 className="heading">{title}</h1>
    </header>
  );
}

export function ButtonPrimary({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="submit" className="button-primary" onClick={onClick}>
      {children}
    </button>
  );
}

export function SetAddressForm({
  onSubmit,
  placeholder,
}: {
  onSubmit: (addr: Address) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const trySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = inputRef.current?.value;
    if (val) onSubmit(getAddress(val));
  };

  return (
    <form className="flex-row" onSubmit={trySubmit}>
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder}
        style={{
          flexGrow: 1,
          border: "none",
          borderBottom: "1px solid var(--border-color)",
          padding: "8px",
          fontSize: "16px",
        }}
      />
      <ButtonPrimary>Enter</ButtonPrimary>
    </form>
  );
}
