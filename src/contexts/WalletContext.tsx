import { createContext, useContext, useState, useEffect } from "react";

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

  // Restore wallet state from localStorage on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem('connectedWallet');
    if (storedWallet) {
      console.log('Restoring wallet state from localStorage:', storedWallet);
      setWallet(JSON.parse(storedWallet));
    }
  }, []);

  // Update localStorage when wallet state changes
  useEffect(() => {
    console.log('Wallet state changed:', wallet);
    if (wallet) {
      localStorage.setItem('connectedWallet', JSON.stringify(wallet));
    } else {
      localStorage.removeItem('connectedWallet');
    }
  }, [wallet]);

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