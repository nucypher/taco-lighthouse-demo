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
const ORBIS_CONTEXT_ID = "kjzl6kcym7w8y99fn4i5nup6v978x6wcpox2dem4pmqz9dk1ex1ts0v41tfypea";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout } = usePrivy();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [orbisUser, setOrbisUser] = useState<any>(null);

  const createOrbisProfile = async (address: string) => {
    try {
      console.log('Checking if user profile exists in Orbis...');
      const { rows: existingProfiles } = await orbisdb
        .select()
        .from(USER_MODEL_ID)
        .where({ name: address })
        .context(ORBIS_CONTEXT_ID)
        .run();
      
      if (!existingProfiles || existingProfiles.length === 0) {
        console.log('Creating new user profile in Orbis...');
        // Only include name property as required by the schema
        const result = await orbisdb
          .insert(USER_MODEL_ID)
          .value({
            name: address  // Using address as name since it's required
          })
          .context(ORBIS_CONTEXT_ID)
          .run();
          
        console.log('✅ User profile created:', result);
        return result;
      } else {
        console.log('User profile already exists:', existingProfiles[0]);
        return existingProfiles[0];
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