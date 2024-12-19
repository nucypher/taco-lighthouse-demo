import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "./WalletContext";
import { connectWallet } from "@/lib/web3";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet, setWallet } = useWallet();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, {
        userId: session?.user?.id,
        email: session?.user?.email
      });
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to handle wallet-session synchronization
  useEffect(() => {
    const syncWalletAndSession = async () => {
      if (wallet && !session && !isLoading) {
        console.log('Wallet connected but no session, attempting SIWE authentication...');
        try {
          // Attempt to establish session using the existing wallet
          await connectWallet();
        } catch (error) {
          console.error('Failed to establish session:', error);
          setWallet(null);
        }
      }
    };

    syncWalletAndSession();
  }, [wallet, session, isLoading, setWallet]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
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