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
  const [isInitializingOrbis, setIsInitializingOrbis] = useState(false);

  const initializeOrbisAuth = useCallback(async () => {
    // Skip if already initialized, initializing, not authenticated, or no wallet
    if (
      hasInitializedOrbis || 
      isInitializingOrbis || 
      !privyAuthenticated || 
      !wallet?.accounts?.[0]?.address
    ) {
      return;
    }

    try {
      setIsInitializingOrbis(true);
      console.log('Starting Orbis initialization...');
      
      // Check if user is already connected to Orbis
      const isConnected = await orbisdb.isUserConnected();
      if (isConnected) {
        console.log('User already connected to Orbis');
        const user = await userClient.getOrbisUser(wallet.accounts[0].address);
        if (user) {
          console.log('Found existing Orbis user:', user);
          setOrbisUser(user);
          setHasInitializedOrbis(true);
          return;
        }
      }

      // If not connected or no user found, proceed with new connection
      console.log('Connecting new Orbis user with wallet:', wallet.accounts[0].address);
      const provider = await wallet.getEthereumProvider();
      const auth = new OrbisEVMAuth(provider);
      await orbisdb.connectUser({ auth });
      
      const user = await userClient.connectOrbisUser(wallet.accounts[0].address);
      console.log('New Orbis user connected:', user);
      setOrbisUser(user);
      setHasInitializedOrbis(true);
    } catch (error) {
      console.error('Failed to initialize Orbis auth:', error);
    } finally {
      setIsInitializingOrbis(false);
      setIsLoading(false);
    }
  }, [privyAuthenticated, wallet, hasInitializedOrbis, isInitializingOrbis]);

  useEffect(() => {
    console.log('Auth state changed:', { 
      privyReady, 
      privyAuthenticated, 
      hasWallet: Boolean(wallet),
      hasInitializedOrbis,
      isInitializingOrbis 
    });

    if (!privyReady) return;

    if (!privyAuthenticated) {
      setIsLoading(false);
      setOrbisUser(null);
      setHasInitializedOrbis(false);
      setIsInitializingOrbis(false);
      return;
    }

    // Only initialize if we haven't already and we're not in the process of initializing
    if (!hasInitializedOrbis && !isInitializingOrbis) {
      initializeOrbisAuth();
    }
  }, [privyReady, privyAuthenticated, wallet, initializeOrbisAuth, hasInitializedOrbis, isInitializingOrbis]);

  const logout = async () => {
    try {
      await privyLogout();
      setOrbisUser(null);
      setHasInitializedOrbis(false);
      setIsInitializingOrbis(false);
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