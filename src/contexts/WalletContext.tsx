import { createContext, useContext, useState, useEffect } from "react";
import { connectWalletOnly } from "@/services/wallet";

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

  // Attempt to restore and reconnect wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      console.log('[WALLET] Initializing wallet provider...');
      const storedWallet = localStorage.getItem('connectedWallet');
      
      if (storedWallet) {
        console.log('[WALLET] Found stored wallet, attempting to reconnect...');
        try {
          // First restore the stored state
          const parsedWallet = JSON.parse(storedWallet);
          console.log('[WALLET] Parsed stored wallet:', parsedWallet);
          
          // Then attempt to reconnect
          const reconnectedWallet = await connectWalletOnly();
          if (reconnectedWallet) {
            console.log('[WALLET] Successfully reconnected wallet:', reconnectedWallet);
            setWallet(reconnectedWallet);
          } else {
            console.log('[WALLET] Failed to reconnect wallet');
            localStorage.removeItem('connectedWallet');
          }
        } catch (error) {
          console.error('[WALLET] Error reconnecting wallet:', error);
          localStorage.removeItem('connectedWallet');
        }
      } else {
        console.log('[WALLET] No stored wallet found');
      }
    };

    initializeWallet();
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