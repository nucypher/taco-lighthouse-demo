import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "./WalletContext";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet } = useWallet();

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

  // Effect to handle wallet disconnection
  useEffect(() => {
    const checkSessionValidity = async () => {
      if (!wallet && session) {
        console.log("Wallet disconnected, signing out...");
        await supabase.auth.signOut();
      } else if (wallet && session) {
        // Verify the wallet address matches the session
        const sessionEmail = session.user?.email;
        const walletAddress = wallet.accounts?.[0]?.address?.toLowerCase();
        const expectedEmail = `${walletAddress}@ethereum.local`;

        if (sessionEmail !== expectedEmail) {
          console.log("Session-wallet mismatch, signing out...", {
            sessionEmail,
            expectedEmail
          });
          await supabase.auth.signOut();
        }
      }
    };

    checkSessionValidity();
  }, [wallet, session]);

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