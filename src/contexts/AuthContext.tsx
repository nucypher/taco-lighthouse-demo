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
        console.log('Wallet connected but no session, attempting SIWE authentication...', {
          walletAddress: wallet.accounts?.[0]?.address,
          sessionStatus: session ? 'exists' : 'missing'
        });
        
        try {
          // Check current session first
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (!currentSession) {
            console.log('No valid session found, initiating SIWE flow...');
            await connectWallet();
            
            // Verify session was established
            const { data: { session: verifySession } } = await supabase.auth.getSession();
            if (!verifySession) {
              console.error('Failed to establish session after wallet connection');
              throw new Error('Session verification failed');
            }
          } else {
            console.log('Found existing valid session:', {
              userId: currentSession.user.id,
              expiresAt: currentSession.expires_at
            });
          }
        } catch (error) {
          console.error('Failed to establish session:', error);
          // Only clear wallet if it's an authentication error
          if (error.message.includes('Auth') || error.message.includes('session')) {
            setWallet(null);
          }
          throw error; // Re-throw to be handled by error boundary
        }
      }
    };

    syncWalletAndSession().catch(error => {
      console.error('Session sync failed:', error);
    });
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
