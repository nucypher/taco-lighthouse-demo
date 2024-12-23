import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { toast } from "sonner";
import { DID } from "dids";
import { createDIDFromWallet } from "@/utils/did-auth";
import { useWallets } from "@privy-io/react-auth";
import { authenticateCeramic } from "@/integrations/ceramic/client";

interface AuthContextType {
  privyUser: PrivyUser | null;
  did: DID | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('Initializing AuthProvider');
  const [isLoading, setIsLoading] = useState(true);
  const [did, setDID] = useState<DID | null>(null);
  
  const { 
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout,
    login: privyLogin
  } = usePrivy();

  const { wallets } = useWallets();

  useEffect(() => {
    console.log('Auth state changed:', { 
      privyReady, 
      privyAuthenticated, 
      privyUser,
      walletCount: wallets.length
    });
    
    if (privyReady) {
      setIsLoading(false);
    }
  }, [privyReady, privyAuthenticated, privyUser, wallets]);

  // Handle DID creation when wallet is connected
  useEffect(() => {
    async function setupDID() {
      if (privyAuthenticated && wallets.length > 0 && !did) {
        const wallet = wallets[0];
        console.log('Setting up DID with wallet:', wallet.address);
        
        try {
          // Get the provider from the wallet's sendTransaction method
          const provider = {
            request: wallet.sendTransaction
          };
          
          const newDID = await createDIDFromWallet(
            provider,
            wallet.address
          );
          
          if (newDID) {
            // Authenticate Ceramic with the created DID
            await authenticateCeramic(newDID);
            setDID(newDID);
            console.log('DID setup complete:', newDID.id);
            toast.success('DID authentication successful');
          } else {
            console.error('Failed to create DID');
            toast.error('Failed to setup DID authentication');
          }
        } catch (error) {
          console.error('Error setting up DID:', error);
          toast.error('Error setting up DID authentication');
        }
      }
    }

    setupDID();
  }, [privyAuthenticated, wallets, did]);

  const handleLogin = async () => {
    try {
      console.log('Initiating login...');
      await privyLogin();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      setDID(null);
      await privyLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const value = {
    privyUser,
    did,
    isLoading: isLoading || !privyReady,
    isAuthenticated: Boolean(privyAuthenticated),
    logout: handleLogout,
    login: handleLogin
  };

  return (
    <AuthContext.Provider value={value}>
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