import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { useWallet } from "./WalletContext";
import { orbisdb } from "@/integrations/orbis/base-client";
import { OrbisUser, userClient } from "@/integrations/orbis/user";
import { OrbisEVMAuth } from "@useorbis/db-sdk/auth";
import { toast } from "sonner";

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
  const [isInitializingOrbis, setIsInitializingOrbis] = useState(false);

  const initializeOrbisAuth = useCallback(async () => {
    if (!privyAuthenticated || !wallet?.accounts?.[0]?.address) {
      console.log('Cannot initialize Orbis: missing authentication or wallet', {
        privyAuthenticated,
        walletAddress: wallet?.accounts?.[0]?.address
      });
      setIsLoading(false);
      return;
    }

    if (isInitializingOrbis) {
      console.log('Skipping Orbis initialization - already in progress');
      return;
    }

    try {
      setIsInitializingOrbis(true);
      console.log('Starting Orbis initialization...');

      // First check if there's an existing session
      const isConnected = await orbisdb.isUserConnected();
      console.log('Checking existing Orbis connection:', isConnected);

      if (isConnected) {
        console.log('User already connected to Orbis');
        const user = await userClient.getOrbisUser(wallet.accounts[0].address);
        console.log('Retrieved existing Orbis user:', user);
        
        if (user) {
          setOrbisUser(user);
          setIsLoading(false);
          return;
        }
      }

      // If no valid session exists, create a new one
      console.log('Creating new Orbis connection...');
      const provider = await wallet.getEthereumProvider();
      const auth = new OrbisEVMAuth(provider);
      
      const authResult = await orbisdb.connectUser({ auth });
      console.log('Orbis auth result:', authResult);
      
      if (!authResult) {
        throw new Error('Failed to authenticate with Orbis');
      }

      // Create or get the Orbis user
      const user = await userClient.connectOrbisUser(wallet.accounts[0].address);
      console.log('Connected Orbis user:', user);
      
      if (!user) {
        throw new Error('Failed to create or get Orbis user');
      }
      
      setOrbisUser(user);
      toast.success("Successfully connected to Orbis");
    } catch (error) {
      console.error('Failed to initialize Orbis auth:', error);
      toast.error("Failed to connect to Orbis. Please try again.");
      // Reset states on error
      setOrbisUser(null);
    } finally {
      setIsInitializingOrbis(false);
      setIsLoading(false);
    }
  }, [privyAuthenticated, wallet, isInitializingOrbis]);

  useEffect(() => {
    console.log('Auth state changed:', { 
      privyReady, 
      privyAuthenticated, 
      hasWallet: Boolean(wallet),
      walletAddress: wallet?.accounts?.[0]?.address,
      isInitializingOrbis,
      currentOrbisUser: orbisUser
    });

    // Reset loading state if Privy is not ready or not authenticated
    if (!privyReady || !privyAuthenticated) {
      setIsLoading(false);
      setOrbisUser(null);
      setIsInitializingOrbis(false);
      return;
    }

    // Check for existing Orbis session
    orbisdb.isUserConnected().then(isConnected => {
      console.log('Checking existing Orbis session:', isConnected);
      if (!isConnected && !orbisUser && !isInitializingOrbis) {
        initializeOrbisAuth();
      } else {
        // Make sure to set loading to false if we're already connected
        setIsLoading(false);
      }
    });

  }, [privyReady, privyAuthenticated, wallet, initializeOrbisAuth, orbisUser, isInitializingOrbis]);

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('Starting logout process...');
      await orbisdb.disconnectUser();
      await privyLogout();
      setOrbisUser(null);
      setIsInitializingOrbis(false);
      toast.success("Successfully logged out");
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error during logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(privyAuthenticated && privyReady),
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