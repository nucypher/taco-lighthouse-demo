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
      if (session) {
        console.log("Found existing session:", {
          userId: session.user?.id,
          email: session.user?.email
        });
      }
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

  // Effect to handle wallet connection state
  useEffect(() => {
    const handleWalletState = async () => {
      if (wallet && !session) {
        // If we have a wallet but no session, try to authenticate
        try {
          console.log('Attempting to authenticate wallet...');
          await connectWallet();
        } catch (error) {
          console.error('Failed to authenticate wallet:', error);
          // If authentication fails, clear the wallet state
          setWallet(null);
        }
      } else if (!wallet && session) {
        // If we have a session but no wallet, sign out
        console.log('Session exists without wallet, signing out...');
        await supabase.auth.signOut();
      } else if (wallet && session) {
        // Verify the wallet address matches the session
        const sessionEmail = session.user?.email;
        const walletAddress = wallet.accounts?.[0]?.address?.toLowerCase();
        const expectedEmail = `${walletAddress}@ethereum.local`;

        if (sessionEmail !== expectedEmail) {
          console.log('Session-wallet mismatch, signing out...', {
            sessionEmail,
            expectedEmail
          });
          await supabase.auth.signOut();
          setWallet(null);
        }
      }
    };

    handleWalletState();
  }, [wallet, session, setWallet]);

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