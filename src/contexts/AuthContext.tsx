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
      console.log("[AuthContext] Initial session check:", {
        hasSession: !!session,
        sessionId: session?.user?.id,
        sessionExp: session?.expires_at,
        accessToken: session?.access_token ? 'present' : 'missing'
      });
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[AuthContext] Auth state changed:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
        sessionExp: session?.expires_at,
        accessToken: session?.access_token ? 'present' : 'missing'
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
        console.log('[AuthContext] Attempting session recovery:', {
          hasWallet: !!wallet,
          walletAddress: wallet?.accounts?.[0]?.address,
          hasSession: !!session,
          isLoading
        });
        try {
          // Attempt to establish session using the existing wallet
          await connectWallet();
          
          // Double check session after connect attempt
          const { data: { session: newSession } } = await supabase.auth.getSession();
          console.log('[AuthContext] Session after recovery attempt:', {
            hasNewSession: !!newSession,
            newSessionId: newSession?.user?.id,
            newSessionExp: newSession?.expires_at
          });
          
        } catch (error) {
          console.error('[AuthContext] Session recovery failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
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