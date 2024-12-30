import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { useWallet } from "./WalletContext";
import { orbisdb } from "@/integrations/orbis/base-client";
import { OrbisUser, userClient } from "@/integrations/orbis/user";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  orbisUser: OrbisUser | null;
  privyUser: PrivyUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout } = usePrivy();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [orbisUser, setOrbisUser] = useState<OrbisUser | null>(null);

  useEffect(() => {
    console.log('Initializing AuthProvider');
    console.log('Auth state:', { privyReady, privyAuthenticated, privyUser });

    async function initializeOrbisAuth() {
      if (privyAuthenticated && wallet?.accounts?.[0]?.address) {
        try {
          const isConnected = await orbisdb.isUserConnected(wallet.accounts[0].address);
          if (!isConnected) {
            await orbisdb.connectUser(window.ethereum);
          }
          
          const user = await userClient.connectOrbisUser(wallet.accounts[0].address);
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
        privyUser: privyUser || null
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