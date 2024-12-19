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
      console.log('[WALLET] Restoring wallet state from localStorage:', storedWallet);
      try {
        const parsedWallet = JSON.parse(storedWallet);
        console.log('[WALLET] Parsed stored wallet:', parsedWallet);
        setWallet(parsedWallet);
      } catch (error) {
        console.error('[WALLET] Error parsing stored wallet:', error);
        localStorage.removeItem('connectedWallet');
      }
    } else {
      console.log('[WALLET] No stored wallet found in localStorage');
    }
  }, []);

  // Update localStorage when wallet state changes
  useEffect(() => {
    console.log('[WALLET] Wallet state changed:', wallet);
    if (wallet) {
      localStorage.setItem('connectedWallet', JSON.stringify(wallet));
      console.log('[WALLET] Updated wallet in localStorage');
    } else {
      localStorage.removeItem('connectedWallet');
      console.log('[WALLET] Removed wallet from localStorage');
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