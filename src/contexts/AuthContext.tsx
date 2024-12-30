import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "./WalletContext";
import { connectOrbisUser, isOrbisUserConnected, getOrbisConnectedUser } from "@/integrations/orbis/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  orbisUser: any;
  privyUser: any; // Add this line to fix the TypeScript error
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout } = usePrivy();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [orbisUser, setOrbisUser] = useState<any>(null);

  useEffect(() => {
    console.log('Initializing AuthProvider');
    console.log('Auth state:', { privyReady, privyAuthenticated, privyUser });

    async function initializeOrbisAuth() {
      if (privyAuthenticated && wallet?.accounts?.[0]?.address) {
        try {
          const isConnected = await isOrbisUserConnected(wallet.accounts[0].address);
          if (!isConnected) {
            await connectOrbisUser(window.ethereum);
          }
          const user = await getOrbisConnectedUser();
          setOrbisUser(user);
        } catch (error) {
          console.error('Failed to initialize Orbis auth:', error);
        }
      }
      setIsLoading(false);
    }

    if (privyReady) {
      initializeOrbisAuth();
    }
  }, [privyReady, privyAuthenticated, wallet]);

  const logout = async () => {
    try {
      await privyLogout();
      setOrbisUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(privyAuthenticated && orbisUser),
        isLoading,
        logout,
        orbisUser,
        privyUser // Add this line to expose privyUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}