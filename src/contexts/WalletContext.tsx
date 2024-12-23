import { createContext, useContext } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

interface WalletContextType {
  wallet: {
    label?: string;
    accounts?: Array<{
      address: string;
    }>;
  } | null;
  setWallet: (wallet: any) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  // Convert Privy wallet format to match our existing interface
  const currentWallet = ready && authenticated && wallets[0] ? {
    label: wallets[0].walletClientType,
    accounts: [{
      address: wallets[0].address
    }]
  } : null;

  console.log('[WALLET] Privy state:', { ready, authenticated, user, wallets });
  console.log('[WALLET] Current wallet:', currentWallet);

  return (
    <WalletContext.Provider value={{ 
      wallet: currentWallet,
      setWallet: () => {} // No-op since Privy manages wallet state
    }}>
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