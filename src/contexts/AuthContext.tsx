import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWallets } from "@privy-io/react-auth";

interface AuthContextType {
  privyUser: PrivyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('Initializing AuthProvider');
  const [isLoading, setIsLoading] = useState(true);
  
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
      await privyLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const value = {
    privyUser,
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