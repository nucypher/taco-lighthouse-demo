import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { useWallet } from "./WalletContext";
import { orbisdb } from "@/integrations/orbis/base-client";
import { OrbisUser, userClient } from "@/integrations/orbis/user";
import { OrbisEVMAuth } from "@useorbis/db-sdk/auth";

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
  const [hasInitializedOrbis, setHasInitializedOrbis] = useState(false);

  const initializeOrbisAuth = useCallback(async () => {
    if (!privyAuthenticated || !wallet?.accounts?.[0]?.address || hasInitializedOrbis) {
      return;
    }

    try {
      console.log('Attempting to connect Orbis with wallet:', wallet);
      const provider = await wallet.getEthereumProvider();
      const auth = new OrbisEVMAuth(provider);
      await orbisdb.connectUser({ auth });
      
      const user = await userClient.connectOrbisUser(wallet.accounts[0].address);
      console.log('Orbis user connected:', user);
      setOrbisUser(user);
      setHasInitializedOrbis(true);
    } catch (error) {
      console.error('Failed to initialize Orbis auth:', error);
    }
    setIsLoading(false);
  }, [privyAuthenticated, wallet, hasInitializedOrbis]);

  useEffect(() => {
    console.log('Initializing AuthProvider');
    console.log('Auth state:', { privyReady, privyAuthenticated, privyUser, wallet });

    if (privyReady) {
      if (!privyAuthenticated) {
        setIsLoading(false);
        setOrbisUser(null);
        setHasInitializedOrbis(false);
      } else {
        initializeOrbisAuth();
      }
    }
  }, [privyReady, privyAuthenticated, initializeOrbisAuth]);

  const logout = async () => {
    try {
      await privyLogout();
      setOrbisUser(null);
      setHasInitializedOrbis(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(privyAuthenticated),
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