import { createContext, useContext, useState } from "react";

interface WalletState {
  label?: string;
  accounts?: Array<{
    address: string;
  }>;
}

interface WalletContextType {
  wallet: WalletState | null;
  setWallet: (wallet: WalletState | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState | null>(null);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}