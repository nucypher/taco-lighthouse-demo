import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { useWallet } from "./WalletContext";
import { orbisdb } from "@/integrations/orbis/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  orbisUser: any;
  privyUser: PrivyUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_MODEL_ID = "kjzl6hvfrbw6c7j8otyyccaetle63o1m27zafs06csb24bljk1imyns9klda994";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout } = usePrivy();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [orbisUser, setOrbisUser] = useState<any>(null);

  const createOrbisProfile = async (address: string) => {
    try {
      console.log('Checking if user profile exists in Orbis...');
      const existingProfiles = await orbisdb.query(USER_MODEL_ID).first().run();
      
      if (!existingProfiles) {
        console.log('Creating new user profile in Orbis...');
        const result = await orbisdb
          .insert(USER_MODEL_ID)
          .value({
            name: '',  // Can be updated later
            createdAt: new Date().toISOString()
          })
          .run();
          
        console.log('✅ User profile created:', result);
        return result;
      } else {
        console.log('User profile already exists:', existingProfiles);
        return existingProfiles;
      }
    } catch (error) {
      console.error('Failed to create/check Orbis profile:', error);
      throw error;
    }
  };

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
          const user = await orbisdb.getConnectedUser();
          setOrbisUser(user);
          
          // Create or verify Orbis profile
          await createOrbisProfile(wallet.accounts[0].address);
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