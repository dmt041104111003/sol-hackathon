"use client";

import { SessionProvider } from "next-auth/react";
import { WalletProvider } from "./WalletProvider";
import { WalletAuth } from "./WalletAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WalletProvider>
        <WalletAuth />
        {children}
      </WalletProvider>
    </SessionProvider>
  );
}
