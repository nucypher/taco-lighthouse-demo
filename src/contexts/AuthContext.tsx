import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { usePrivy, User as PrivyUser } from "@privy-io/react-auth";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  privyUser: PrivyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('Initializing AuthProvider');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get Privy authentication state
  const { 
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    logout: privyLogout
  } = usePrivy();

  useEffect(() => {
    console.log('Setting up auth state listeners');
    console.log('Privy state:', { privyReady, privyAuthenticated, privyUser });
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial Supabase session:", session);
      setSession(session);
      if (!session && privyAuthenticated) {
        console.log("No Supabase session but Privy is authenticated");
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listeners');
      subscription.unsubscribe();
    };
  }, [privyReady, privyAuthenticated, privyUser]);

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await Promise.all([
        supabase.auth.signOut(),
        privyLogout()
      ]);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Only consider authenticated when both Privy and Supabase sessions exist
  const isAuthenticated = Boolean(privyAuthenticated && session);

  const value = {
    session,
    privyUser,
    isLoading: isLoading || !privyReady,
    isAuthenticated,
    logout: handleLogout
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